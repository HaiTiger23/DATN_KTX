import { Segmented } from 'antd';
import { useLanguage } from '../context/LanguageContext';

/**
 * Chuyển EN ↔ VI. `variant="fixed"` dùng trên màn hình đăng nhập.
 */
export default function LanguageSwitcher({ variant = 'inline' }) {
  const { locale, setLocale } = useLanguage();

  const segment = (
    <Segmented
      size="small"
      value={locale}
      onChange={(v) => setLocale(v)}
      options={[
        { label: 'VI', value: 'vi' },
        { label: 'EN', value: 'en' },
      ]}
    />
  );

  if (variant === 'fixed') {
    return <div className="ktx-lang-switcher--fixed">{segment}</div>;
  }

  return segment;
}
