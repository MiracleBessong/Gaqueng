import { useCallback, useState } from "react";

const URL = "https://api.mymemory.translated.net/get";

export function useTranslation() {
  const [loading, setLoading] = useState(false);
  const translate = useCallback(async (text, sourceLang, targetLang) => {
    if (!text) return "";
    if (sourceLang === targetLang) return text;
    setLoading(true);
    try {
      const res = await fetch(
        `${URL}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`,
      );
      const data = await res.json();
      return data.responseData?.translatedText || "";
    } catch (e) {
      console.error(e);
      return "[translation error]";
    } finally {
      setLoading(false);
    }
  }, []);
  return { translate, loading };
}
