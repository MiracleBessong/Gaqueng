import { useState } from "react";
import { getLang } from "../lib/languages";
import { useCallback } from "react";

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(async (text, lang) => {
    if (!text) return;
    const langObj = getLang(lang);
    if (!langObj) return;
    setSpeaking(true);
    try {
      if (langObj.ttsEngine === "browser") {
        await speakBrowser(text, langObj.ttsLang);
      } else if (langObj.ttsEngine === "azure") {
        await speakAzure(text, langObj.ttsVoice, langObj.ttsLang);
      }
    } catch (e) {
      console.error("TTS failed, fallback to browser:", e);
      try {
        await speakBrowser(text, langObj.ttsLang);
      } catch (e2) {
        console.error(e2);
      }
    }
    setSpeaking(false);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);
  return { speak, stop, speaking };
}

function speakBrowser(text, lang) {
  return new Promise((res) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.onend = res;
    u.onerror = res;
    window.speechSynthesis.speak(u);
  });
}

async function speakAzure(text, voiceName, langCode) {
  const region = import.meta.env.VITE_AZURE_REGION;
  const key = import.meta.env.VITE_AZURE_API_KEY;
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  // SSML with the proper voice and language
  const safeText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const ssml = `<speak version='1.0' xml:lang='${langCode}'><voice xml:lang='${langCode}' name='${voiceName}'>${safeText}</voice></speak>`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
    },
    body: ssml,
  });
  if (!res.ok) throw new Error(`Azure TTS failed: ${res.status}`);
  const blob = await res.blob();
  await playBlob(blob);
}

async function playBlob(blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await new Promise((res) => {
    audio.onended = res;
    audio.onerror = res;
    audio.play();
  });
  URL.revokeObjectURL(url);
}
