import React, { useState, useEffect } from 'react';
import { Empty, Spin } from 'antd';
import AdminSettingsTab from '../../components/tabs/AdminSettingsTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [agentSettings, setAgentSettings] = useState({
    max_responses: 5,
    response_mode: 'concise',
    temperature: 0.7,
    auto_translate: false,
    use_internet: true
  });
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api('/admin/settings');
      if (res) {
        const { geminiApiKey, _id, createdAt, updatedAt, __v, ...restSettings } = res;
        setGeminiKey(geminiApiKey || '');
        setAgentSettings((prev) => ({
          ...prev,
          ...restSettings,
          use_internet: restSettings.use_internet !== false
        }));
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveSettings = async () => {
    try {
      await api('/admin/settings', 'POST', { 
        geminiApiKey: geminiKey,
        ...agentSettings
      });
      showToast(t('toast.settingsSaved'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (error) {
    return <Empty description={<span style={{ color: 'red' }}>{t('dashboard.loadError')}</span>} />;
  }

  return (
    <div style={{ position: 'relative', minHeight: '200px' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255, 255, 255, 0.6)', zIndex: 10, borderRadius: '12px' }}>
          <Spin size="large" />
        </div>
      )}
      <AdminSettingsTab
        geminiKey={geminiKey}
        setGeminiKey={setGeminiKey}
        agentSettings={agentSettings}
        setAgentSettings={setAgentSettings}
        onSave={saveSettings}
      />
    </div>
  );
}
