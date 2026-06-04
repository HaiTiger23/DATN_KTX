import React, { useState, useEffect } from 'react';
import { Empty, Spin } from 'antd';
import ProfileTab from '../../components/tabs/ProfileTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  const { user, updateUserLocal } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    fullname: '', email: '', phone: '', address: '', mssv: '',
    cccd: '', cccd_date: '', cccd_place: '', password: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const fullUser = await api('/auth/profile');
        setProfileForm({
          fullname: fullUser.fullname || '',
          email: fullUser.email || '',
          phone: fullUser.phone || '',
          address: fullUser.address || '',
          mssv: fullUser.mssv || '',
          cccd: fullUser.cccd || '',
          cccd_date: fullUser.cccd_date || '',
          cccd_place: fullUser.cccd_place || '',
          password: ''
        });
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    try {
      const body = {
        fullname: profileForm.fullname,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.address,
        mssv: profileForm.mssv,
        cccd: profileForm.cccd,
        cccd_date: profileForm.cccd_date,
        cccd_place: profileForm.cccd_place,
      };
      if (profileForm.password) body.password = profileForm.password;
      const res = await api('/auth/profile', 'PUT', body);
      showToast(t('toast.profileSaved'));
      updateUserLocal({ fullname: res.fullname });
      setProfileForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '200px' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255, 255, 255, 0.6)', zIndex: 10, borderRadius: '12px' }}>
          <Spin size="large" />
        </div>
      )}
      <ProfileTab user={user} form={profileForm} setForm={setProfileForm} onSave={saveProfile} />
    </div>
  );
}
