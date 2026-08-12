import { useState } from "react";
import { askAssistant } from "../lib/api";
import { useSpeechSynthesis } from "./useSpeechSynthesis";

export function useMeetingAssistant({ transcript }) {
  const [awake, setAwake] = useState(false);
  const [assistantLang, setAssistantLang] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const { speak, stop: stopSpeaking } = useSpeechSynthesis();

  const wake = () => {
    setAwake(true);
    setAssistantLang(null);
    speak("Hi, what language do you understand?", "en");
  };

  const setLanguage = (langCode) => {
    setAssistantLang(langCode);
    const langName =
      {
        en: "English",
        fr: "French",
        es: "Spanish",
        de: "German",
        it: "Italian",
        pt: "Portuguese",
        yo: "Yoruba",
        ha: "Hausa",
        ig: "Igbo",
        ko: "Korean",
        ar: "Arabic",
        zh: "Chinese",
        ja: "Japanese",
        ru: "Russian",
        hi: "Hindi",
      }[langCode] || langCode;
    speak(
      `Great, I will answer in ${langName}. What is your question?`,
      langCode,
    );
  };

  const ask = async (question) => {
    if (!assistantLang) return;
    setBusy(true);
    try {
      const answer = await askAssistant({
        question,
        transcript,
        lang: assistantLang,
        history,
      });
      setHistory((h) => [...h, { q: question, a: answer }]);
      await speak(answer, assistantLang);
    } catch (e) {
      console.error(e);
      speak("Sorry, I could not answer that.", assistantLang);
    } finally {
      setBusy(false);
    }
  };

  // Fixed: sleep() now actually cancels any speech in progress instead of
  // just resetting state while the assistant keeps talking in the background.
  const sleep = () => {
    stopSpeaking();
    setAwake(false);
    setAssistantLang(null);
  };

  return { awake, assistantLang, history, busy, wake, setLanguage, ask, sleep };
}
