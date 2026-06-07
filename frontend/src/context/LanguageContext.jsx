import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEY, translations } from '../i18n/translations';

const LanguageContext = createContext(null);

/**
 * @param {string} key
 * @param {string | Record<string, string | number>} [fallbackOrVars]
 * @param {Record<string, string | number>} [vars]
 */
function translate(locale, key, fallbackOrVars, vars) {
  let fallback = key;
  let actualVars = vars;

  if (typeof fallbackOrVars === 'string') {
    fallback = fallbackOrVars;
  } else if (fallbackOrVars !== undefined) {
    actualVars = fallbackOrVars;
  }

  const dict = translations[locale] || translations.vi;
  let str = dict[key];
  if (str === undefined) {
    str = translations.vi[key] ?? fallback;
  }
  if (actualVars && typeof str === 'string') {
    return str.replace(/\{(\w+)\}/g, (_, k) => (actualVars[k] !== undefined ? String(actualVars[k]) : `{${k}}`));
  }
  return str;
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'vi') return stored;
    return 'vi';
  });

  const setLocale = useCallback((next) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'vi';
  }, [locale]);

  const t = useCallback(
    (key, fallbackOrVars, vars) => translate(locale, key, fallbackOrVars, vars),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
