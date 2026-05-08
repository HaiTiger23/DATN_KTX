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
    return (
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1000,
          padding: 8,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {segment}
      </div>
    );
  }

  return segment;
}
