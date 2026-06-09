import React, { useState, useEffect } from 'react';
import { Empty, Spin, Modal, InputNumber } from 'antd';
import StudentRoomsTab from '../../components/tabs/StudentRoomsTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function StudentRoomsPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [data, setData] = useState({ rooms: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [roomFilters, setRoomFilters] = useState({ search: '', sort: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      let q = `?page=${page}&limit=${limit}`;
      if (roomFilters.search) q += `&search=${encodeURIComponent(roomFilters.search)}`;
      if (roomFilters.sort) q += `&sort=${encodeURIComponent(roomFilters.sort)}`;
      if (roomFilters.floor) q += `&floor=${encodeURIComponent(roomFilters.floor)}`;
      if (roomFilters.roomType) q += `&roomType=${encodeURIComponent(roomFilters.roomType)}`;

      const res = await api(`/student/rooms${q}`);
      setData({ 
        rooms: res.data, 
        studentContracts: res.studentContracts,
        studentRequests: res.studentRequests
      });
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit, roomFilters]);

  const registerRoom = async (roomId) => {
    try {
      const usr = await api('/auth/profile');
      if (!usr.fullname || !usr.cccd || !usr.cccd_date || !usr.cccd_place || !usr.phone || !usr.address || !usr.mssv) {
        Modal.confirm({
          title: t('prompt.updateInfo'),
          content: t('prompt.updateInfoDesc', 'Vui lòng cập nhật đầy đủ thông tin cá nhân (CCCD, địa chỉ, SĐT...) trước khi đăng ký.'),
          okText: t('modal.updateNow', 'Cập nhật ngay'),
          cancelText: t('modal.cancel'),
          onOk: () => {
            // Need a way to navigate to profile
            window.location.href = '/profile';
          },
        });
        return;
      }
    } catch {
      showToast(t('toast.checkInfoError'), 'error');
      return;
    }

    let monthsNum = 6;
    Modal.confirm({
      title: t('prompt.rentMonths'),
      icon: null,
      content: (
        <InputNumber
          min={1}
          className="ktx-modal-months-input"
          defaultValue={6}
          onChange={(v) => {
            monthsNum = typeof v === 'number' ? v : Number(v) || 1;
          }}
        />
      ),
      onOk: () => {
        if (Number.isNaN(monthsNum) || monthsNum <= 0) {
          showToast(t('toast.monthsInvalid'), 'error');
          return Promise.reject(new Error('validation'));
        }
        return new Promise((resolve, reject) => {
          Modal.confirm({
            title: t('confirm.registerRoom', { months: monthsNum }),
            onOk: async () => {
              try {
                await api('/student/requests', 'POST', { room_id: roomId, months: monthsNum });
                showToast(t('toast.requestSubmitted'));
                window.location.href = '/student/requests';
                resolve();
              } catch (err) {
                showToast(err.message, 'error');
                reject(new Error('api'));
              }
            },
            onCancel: () => reject(new Error('cancel')),
          });
        });
      },
    });
  };

  if (data.error) {
    return <Empty description={<span style={{ color: 'red' }}>{t('dashboard.loadError')}</span>} />;
  }

  const contracts = data.studentContracts || [];
  const requests = data.studentRequests || [];
  const active = contracts.find((c) => c.status === 'Active');
  const activeRoomId = active ? String(active.room_id?._id ?? active.room_id) : null;
  const pendingReg = requests.find((r) => r.status === 'Pending' && r.type === 'Registration');
  const pendingRoomId = pendingReg ? String(pendingReg.room_id?._id ?? pendingReg.room_id) : null;

  return (
    <div style={{ position: 'relative', minHeight: '200px' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255, 255, 255, 0.6)', zIndex: 10, borderRadius: '12px' }}>
          <Spin size="large" />
        </div>
      )}
      <StudentRoomsTab
        rooms={data.rooms || []}
        activeRoomId={activeRoomId}
        pendingRoomId={pendingRoomId}
        onRegister={registerRoom}
        pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
        filters={roomFilters}
        onFiltersChange={(newFilters) => {
          setRoomFilters(prev => ({ ...prev, ...newFilters }));
          setPage(1);
        }}
      />
    </div>
  );
}
