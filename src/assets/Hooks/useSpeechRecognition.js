import { useCallback, useRef, useState } from "react";
import { getLang } from "../lib/languages";

export function useSpeechRecognition({ lang, onResult, onError }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const finalTextRef = useRef("");
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const manualStopRef = useRef(false); // true only when the user explicitly stops
  const fatalRef = useRef(false); // true if a real (non "no-speech") error occurred

  const start = useCallback(async () => {
    const langObj = getLang(lang);
    if (!langObj) return;
    setTranscript("");
    finalTextRef.current = "";
    manualStopRef.current = false;
    fatalRef.current = false;
    setListening(true);

    if (langObj.sttEngine === "browser") {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        alert("Use Chrome for speech recognition.");
        setListening(false);
        return;
      }

      const createRecognizer = () => {
        const r = new SR();
        r.lang = langObj.sttLang;
        r.interimResults = true;
        // Keep listening across natural pauses in speech — only the user
        // clicking "stop" should end the session, not a gap in talking.
        r.continuous = true;

        r.onresult = (e) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const chunk = e.results[i][0].transcript;
            if (e.results[i].isFinal) {
              finalTextRef.current += (finalTextRef.current ? " " : "") + chunk;
              // Send each completed phrase to the caller as it lands,
              // instead of waiting for the whole session to end.
              onResult(chunk.trim());
            } else {
              interim += chunk;
            }
          }
          setTranscript(`${finalTextRef.current} ${interim}`.trim());
        };

        const FATAL_ERRORS = new Set([
          "not-allowed",
          "audio-capture",
          "service-not-allowed",
        ]);

        r.onerror = (e) => {
          // "no-speech" fires on normal pauses — not a real error, ignore it
          // so the auto-restart in onend can keep the session alive.
          if (e.error !== "no-speech") {
            console.error("Speech recognition error:", e.error);
          }
          if (FATAL_ERRORS.has(e.error)) {
            fatalRef.current = true;
            onError?.(e.error);
          }
          };

        r.onend = () => {
          if (manualStopRef.current || fatalRef.current) {
            setListening(false);
            return;
          }
          // Some browsers end the session on their own after a silence
          // timeout even with continuous:true. If the user didn't ask to
          // stop, transparently restart so listening never pauses on us.
          try {
            r.start();
          } catch (err) {
            console.error("Failed to auto-restart recognition:", err);
            setListening(false);
          }
        };

        return r;
      };

      const r = createRecognizer();
      recognitionRef.current = r;
      r.start();
      return;
    }

    // Azure STT — record audio, send to Azure
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
              ? "audio/webm;codecs=opus"
              : "";
            const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
              // Label the Blob with the SAME mime type (codecs included) that
              // MediaRecorder actually recorded with — re-labeling it as plain
              // "audio/webm" here was dropping the codec info Azure needs.
              const blob = new Blob(chunksRef.current, {
                type: mimeType || "audio/webm",
              });
        stream.getTracks().forEach((t) => {
          t.stop();
        });
        try {
                  const text = await transcribeAzure(blob, langObj.sttLang, mimeType);
                  setTranscript(text);
                  finalTextRef.current = text;
                  if (text) {
                    onResult(text);
                  } else {
                    console.warn("Azure STT returned no text for this recording.");
                  }
                } catch (e) {
                  console.error("Azure STT request failed:", e);
                } finally {
                  setListening(false);
                }
      };
      mediaRecorderRef.current = mr;
      mr.start();
    } catch (e) {
      console.error(e);
      alert("Allow microphone access.");
      setListening(false);
    }
  }, [lang, onResult, onError]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    recognitionRef.current?.stop();
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    setListening(false);
  }, []);

  return { listening, transcript, start, stop };
}

async function transcribeAzure(blob, langCode) {
  const region = import.meta.env.VITE_AZURE_REGION;
  const key = import.meta.env.VITE_AZURE_API_KEY;
  const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${langCode}`;

  // Convert to WAV first — raw streamed webm/opus blobs from MediaRecorder
  // were causing Azure to return "Success" with an empty DisplayText.
  const wavBlob = await blobToWav(blob);
  const buf = await wavBlob.arrayBuffer();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
      Accept: "application/json",
    },
    body: buf,
  });

  if (!res.ok) throw new Error(`Azure STT failed: ${res.status}`);
  const data = await res.json();
  return data.DisplayText || data.text || "";
}

  // Converts a recorded Blob (webm/opus) into 16-bit PCM WAV. Azure's REST STT
  // endpoint can silently return empty DisplayText for streamed webm/opus
  // blobs from MediaRecorder (they lack a proper duration/seek header) —
  // converting to WAV first avoids that entirely.
  async function blobToWav(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const targetSampleRate = 16000;
    const offlineCtx = new OfflineAudioContext(
      1,
      Math.ceil(audioBuffer.duration * targetSampleRate),
      targetSampleRate,
    );
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    const rendered = await offlineCtx.startRendering();

    const samples = rendered.getChannelData(0);
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    audioCtx.close();
    return new Blob([buffer], { type: "audio/wav" });
  }
