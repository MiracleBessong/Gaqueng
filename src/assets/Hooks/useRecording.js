import { useRef, useState } from "react";

// Records the local mix of microphone + what you hear (translated audio).
export function useRecording() {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    streamRef.current = stream;
    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setUrl(URL.createObjectURL(blob));
      streamRef.current.getTracks().forEach((t) => {
        t.stop();
      });
    };
    recorderRef.current = mr;
    mr.start();
    setRecording(true);
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return { recording, url, start, stop };
}
