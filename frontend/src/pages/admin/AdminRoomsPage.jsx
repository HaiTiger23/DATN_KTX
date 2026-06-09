import React, { useState, useEffect } from 'react';
import { Empty, Spin, Input, Select, Button, Tag, Modal, Form, InputNumber, Upload } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import AdminRoomsTab from '../../components/tabs/AdminRoomsTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { exportToExcel } from '../../utils/exportUtils';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../../components/RichTextEditor';

export default function AdminRoomsPage() {
  const { t } = useLanguage();
  const api = useApi();
  const navigate = useNavigate();
  const [data, setData] = useState({ rooms: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: '', status: '', building: '', sort: '' });
  const [buildings, setBuildings] = useState([]);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [roomForm, setRoomForm] = useState({ room_code: '', building: '', floor: 1, capacity: 4, price: 0, amenities: [], description: '', detailed_description: '', roomType: 'Standard' });
  const [roomFiles, setRoomFiles] = useState([]);

  // Utilities
  const formatVndInput = (val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const parseVndInput = (val) => val.replace(/\$\s?|(,*)/g, '');

  const loadData = async () => {
    setLoading(true);
    try {
      let q = `?page=${page}&limit=${limit}`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;

      const res = await api(`/admin/rooms${q}`);
      setData({ rooms: res.data });
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async () => {
    try {
      if (modalType === 'add_room' || modalType === 'edit_room') {
        if (!roomForm.room_code || !roomForm.room_code.trim() || !roomForm.building || !roomForm.building.trim()) {
          showToast('Mã phòng và tòa nhà không được để trống', 'error');
          return;
        }
        if (roomForm.capacity <= 0) {
          showToast('Sức chứa phải lớn hơn 0', 'error');
          return;
        }
        if (roomForm.price < 0) {
          showToast('Giá phòng không hợp lệ', 'error');
          return;
        }
        const formData = new FormData();
        Object.keys(roomForm).forEach(k => {
          if (k === 'amenities') {
            roomForm[k].forEach(a => formData.append('amenities', a));
          } else {
            formData.append(k, roomForm[k]);
          }
        });
        roomFiles.forEach(f => {
          if (f.originFileObj) {
            formData.append('images', f.originFileObj);
          } else if (f.url) {
            formData.append('existingImages', f.url);
          }
        });

        if (modalType === 'add_room') {
          await api('/admin/rooms', 'POST', formData, true);
        } else {
          await api(`/admin/rooms/${editingId}`, 'PUT', formData, true);
        }
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      Modal.error({ title: t('dashboard.loadError'), content: err.message });
    }
  };

  const openAddRoom = () => {
    setModalType('add_room');
    setRoomForm({ room_code: '', building: '', floor: 1, capacity: 4, price: 0, amenities: [], description: '', detailed_description: '', roomType: 'Standard' });
    setRoomFiles([]);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditRoom = (room) => {
    setModalType('edit_room');
    setRoomForm({
      room_code: room.room_code,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      price: room.price,
      amenities: room.amenities || [],
      description: room.description || '',
      detailed_description: room.detailed_description || '',
      roomType: room.roomType || 'Standard'
    });
    setRoomFiles((room.images || []).map((url, idx) => ({
      uid: `-img-${idx}`, name: `image-${idx}.jpg`, status: 'done', url
    })));
    setEditingId(room._id);
    setModalOpen(true);
  };

  useEffect(() => {
    loadData();
  }, [page, limit, filters]);

  const toggleRoomStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Available' ? 'Maintenance' : 'Available';
    try {
      await api(`/admin/rooms/${id}/status`, 'PATCH', { status: newStatus });
      loadData();
    } catch (error) {
      Modal.error({ title: t('dashboard.loadError'), content: error.message });
    }
  };

  const handleExportExcel = async () => {
    try {
      let q = `?limit=10000`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;

      const res = await api(`/admin/rooms${q}`);
      const formatted = res.data.map(r => {
        let typeStr = r.roomType || r.room_type;
        if (typeStr === 'Standard') typeStr = 'Tiêu chuẩn';
        if (typeStr === 'Service') typeStr = 'Dịch vụ';
        if (typeStr === 'VIP') typeStr = 'VIP';

        let statusStr = r.status;
        if (r.status === 'Available') statusStr = 'Còn trống';
        if (r.status === 'Full') statusStr = 'Đã đầy';
        if (r.status === 'Maintenance') statusStr = 'Đang bảo trì';

        return {
          'Tòa nhà': r.building,
          'Tầng': r.floor,
          'Số phòng': r.room_code,
          'Loại phòng': typeStr,
          'Sức chứa': r.capacity,
          'Đang ở': r.current_people,
          'Giá (VNĐ)': r.price,
          'Trạng thái': statusStr,
        };
      });
      exportToExcel(formatted, 'DS_Phong', 'DuLieu');
    } catch (err) {
      console.error(err);
    }
  };

  const renderFilterBar = () => {
    const statusOptions = [
      { label: t('filter.available', 'Còn trống'), value: 'Available' },
      { label: t('filter.full', 'Đã đầy'), value: 'Full' },
      { label: t('filter.maintenance', 'Đang bảo trì'), value: 'Maintenance' }
    ];
    const sortOptions = [
      { label: t('sort.newest'), value: '' },
      { label: t('sort.priceAsc'), value: 'price_asc' },
      { label: t('sort.priceDesc'), value: 'price_desc' },
      { label: t('sort.roomCode'), value: 'room_code' }
    ];

    return (
      <div className="ktx-filter-bar" style={{ 
        marginBottom: 24, 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(10px)',
        padding: '20px', 
        borderRadius: '12px', 
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)' 
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flex: 1 }}>
            <Input 
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('filter.searchRoom')}
              allowClear
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{ borderRadius: '8px', width: '240px' }}
            />
            <Select 
              style={{ width: '160px', borderRadius: '8px' }}
              placeholder={t('filter.status')}
              allowClear
              value={filters.status || undefined}
              onChange={v => setFilters(prev => ({ ...prev, status: v || '' }))}
              options={statusOptions}
            />
            <Select 
              style={{ width: '160px', borderRadius: '8px' }}
              placeholder={t('filter.sort')}
              value={filters.sort || ''}
              onChange={v => setFilters(prev => ({ ...prev, sort: v }))}
              options={sortOptions}
            />
          </div>
          <div>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                height: '40px',
                padding: '0 24px',
                fontWeight: 600,
                fontSize: '14px'
              }}
              onClick={handleExportExcel}
            >
              Xuất Excel
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                height: '40px',
                padding: '0 24px',
                fontWeight: 600,
                fontSize: '14px',
                marginLeft: '12px'
              }}
              onClick={openAddRoom}
            >
              {t('dashboard.addNew')}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (data.error) {
    return <Empty description={<span style={{ color: 'red' }}>{t('dashboard.loadError')}</span>} />;
  }

  return (
    <div>
      {renderFilterBar()}
      <div style={{ position: 'relative', minHeight: '200px' }}>
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255, 255, 255, 0.6)', zIndex: 10, borderRadius: '12px' }}>
            <Spin size="large" />
          </div>
        )}
      
      <Modal
        title={modalType === 'add_room' ? t('modal.addRoom') : t('modal.editRoom')}
        open={modalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setModalOpen(false)}
        okText={t('modal.save')}
        cancelText={t('modal.cancel')}
        destroyOnClose
        width={700}
      >
        <Form layout="vertical">
          <Form.Item label={t('modal.roomCode')}>
            <Input
              value={roomForm.room_code}
              onChange={(e) => setRoomForm((f) => ({ ...f, room_code: e.target.value }))}
              disabled={modalType === 'edit_room'}
            />
          </Form.Item>
          <Form.Item label={t('modal.building')} required>
            <Input value={roomForm.building} onChange={(e) => setRoomForm((f) => ({ ...f, building: e.target.value }))} />
          </Form.Item>
          <Form.Item label={t('modal.floor')} required>
            <InputNumber
              className="ktx-input-block"
              min={1}
              value={roomForm.floor}
              onChange={(v) => setRoomForm((f) => ({ ...f, floor: v }))}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label={t('modal.roomType')}>
            <Select value={roomForm.roomType} onChange={(v) => setRoomForm((f) => ({ ...f, roomType: v }))}>
              <Select.Option value="Standard">{t('modal.roomTypeStandard', 'Tiêu chuẩn')}</Select.Option>
              <Select.Option value="Service">{t('modal.roomTypeService', 'Dịch vụ')}</Select.Option>
              <Select.Option value="VIP">{t('modal.roomTypeVip', 'VIP')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('modal.capacity')} required>
            <InputNumber
              className="ktx-input-block"
              min={1}
              value={roomForm.capacity}
              onChange={(v) => setRoomForm((f) => ({ ...f, capacity: v }))}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label={t('modal.priceMonth')} required>
            <InputNumber
              className="ktx-input-block"
              min={0}
              step={1000}
              value={roomForm.price}
              formatter={formatVndInput}
              parser={parseVndInput}
              onChange={(v) => setRoomForm((f) => ({ ...f, price: v }))}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label={t('modal.description')}>
            <Input.TextArea value={roomForm.description} onChange={(e) => setRoomForm((f) => ({ ...f, description: e.target.value }))} />
          </Form.Item>
          <Form.Item label={t('modal.detailedDescription', 'Mô tả chi tiết')}>
            <RichTextEditor
              value={roomForm.detailed_description}
              onChange={(val) => setRoomForm((f) => ({ ...f, detailed_description: val }))}
              placeholder={t('modal.detailedDescriptionHint', 'Nhập mô tả chi tiết phòng...')}
            />
          </Form.Item>
          <Form.Item label={t('modal.amenities')}>
            <Select 
              mode="tags" 
              placeholder={t('modal.amenitiesHint', 'Nhập tiện ích')} 
              value={roomForm.amenities} 
              onChange={(v) => setRoomForm((f) => ({ ...f, amenities: v }))} 
            />
          </Form.Item>
          <Form.Item label={t('modal.images')}>
            <Upload
              listType="picture-card"
              fileList={roomFiles}
              onPreview={(file) => {
                Modal.info({
                  title: t('modal.viewImage'),
                  content: <img src={file.url || file.preview} style={{ width: '100%' }} alt="room" />,
                  footer: null,
                  maskClosable: true,
                });
              }}
              onChange={({ fileList }) => setRoomFiles(fileList)}
              beforeUpload={() => false}
              multiple
            >
              {roomFiles.length >= 10 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>{t('modal.upload', 'Tải lên')}</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

        <AdminRoomsTab
          rooms={data.rooms || []}
          onToggleStatus={toggleRoomStatus}
          onEdit={openEditRoom}
          onNavigate={(target, params) => {
            if (target === 'students' && params?.room_id) {
              navigate(`/admin/students?room_id=${params.room_id}`);
            }
          }}
          pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
        />
      </div>
    </div>
  );
}
