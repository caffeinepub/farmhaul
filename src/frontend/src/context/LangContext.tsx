import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type Lang,
  type TranslationKey,
  translations,
} from "../i18n/translations";

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem("farmhaul_lang");
    return (["en", "hi", "kn"].includes(stored ?? "") ? stored : "en") as Lang;
  });

  useEffect(() => {
    localStorage.setItem("farmhaul_lang", lang);
  }, [lang]);

  const toggleLang = () =>
    setLang((l) => (l === "en" ? "hi" : l === "hi" ? "kn" : "en"));

  const t = (key: TranslationKey) =>
    translations[lang][key] ?? translations.en[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
