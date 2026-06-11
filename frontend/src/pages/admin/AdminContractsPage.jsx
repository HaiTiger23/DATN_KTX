import React, { useState, useEffect, useRef } from 'react';
import { Empty, Spin, Input, Select, Button, Tag, Modal, Form } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import AdminContractsTab from '../../components/tabs/AdminContractsTab';
import ContractPrintTemplate from '../../components/ContractPrintTemplate';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { exportToExcel } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';
import { useLocation } from 'react-router-dom';

export default function AdminContractsPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  const location = useLocation();
  const [data, setData] = useState({ contracts: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return { 
      search: params.get('search') || '', 
      status: '', 
      sort: '', 
      room_id: '' 
    };
  });
  const [allRooms, setAllRooms] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [agentSettings, setAgentSettings] = useState({});

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [contractForm, setContractForm] = useState({ student_id: '', room_id: '', start_date: '', end_date: '', reason: '' });
  const [viewingContract, setViewingContract] = useState(null);
  const printRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      let q = `?page=${page}&limit=${limit}`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;
      if (filters.room_id) q += `&room_id=${encodeURIComponent(filters.room_id)}`;

      const res = await api(`/admin/contracts${q}`);
      setData({ contracts: res.data });
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const loadRoomsAndStudents = async () => {
    try {
      const [roomsRes, studentsRes, settings] = await Promise.all([
        api('/admin/rooms?limit=1000'),
        api('/admin/students?limit=1000&status=Active'),
        api('/admin/settings')
      ]);
      setAllRooms(roomsRes.data.map(r => ({ label: `${r.building}-${r.room_code}`, value: r._id })));
      setAllStudents(studentsRes.data.map(s => ({ label: `${s.mssv} - ${s.fullname}`, value: s._id })));
      setAgentSettings(settings || {});
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    loadRoomsAndStudents();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam !== null && searchParam !== filters.search) {
      setFilters(prev => ({ ...prev, search: searchParam }));
    }
  }, [location.search]);

  useEffect(() => {
    loadData();
  }, [page, limit, filters]);

  const handleModalSubmit = async () => {
    try {
      if (modalType === 'add_contract') {
        if (!contractForm.student_id || !contractForm.room_id || !contractForm.start_date || !contractForm.end_date) {
          showToast(t('toast.missingFields'), 'error');
          return;
        }
        if (new Date(contractForm.start_date) >= new Date(contractForm.end_date)) {
          showToast('Ngày bắt đầu phải trước ngày kết thúc', 'error');
          return;
        }
        await api('/admin/contracts', 'POST', contractForm);
        showToast(t('toast.contractCreated'));
      } else if (modalType === 'edit_contract') {
        if (!contractForm.start_date || !contractForm.end_date) {
          showToast(t('toast.missingFields'), 'error');
          return;
        }
        if (new Date(contractForm.start_date) >= new Date(contractForm.end_date)) {
          showToast('Ngày bắt đầu phải trước ngày kết thúc', 'error');
          return;
        }
        const body = {
          start_date: contractForm.start_date,
          end_date: contractForm.end_date
        };
        await api(`/admin/contracts/${editingId}`, 'PUT', body);
        showToast(t('toast.contractUpdated'));
      } else if (modalType === 'end_contract') {
        if (!contractForm.reason) {
          showToast('Vui lòng nhập lý do kết thúc', 'error');
          return;
        }
        await api(`/admin/contracts/${editingId}/status`, 'PATCH', { reason: contractForm.reason });
        showToast(t('toast.contractEnded'));
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      Modal.error({ title: t('dashboard.loadError'), content: err.message });
    }
  };

  const openAddContract = () => {
    setModalType('add_contract');
    setContractForm({ student_id: '', room_id: '', start_date: '', end_date: '', reason: '' });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditContract = (contract) => {
    setModalType('edit_contract');
    setContractForm({
      student_id: contract.student_id?._id,
      room_id: contract.room_id?._id,
      start_date: contract.start_date ? new Date(contract.start_date).toISOString().split('T')[0] : '',
      end_date: contract.end_date ? new Date(contract.end_date).toISOString().split('T')[0] : '',
      reason: ''
    });
    setEditingId(contract._id);
    setModalOpen(true);
  };

  const openEndContract = (id) => {
    setModalType('end_contract');
    setEditingId(id);
    setContractForm({ student_id: '', room_id: '', start_date: '', end_date: '', reason: '' });
    setModalOpen(true);
  };

  const handleDeleteContract = async (id) => {
    try {
      await api(`/admin/contracts/${id}`, 'DELETE');
      showToast('Đã xóa hợp đồng thành công');
      loadData();
    } catch (err) {
      Modal.error({ title: t('dashboard.loadError'), content: err.message });
    }
  };

  const handleExportExcel = async () => {
    try {
      let q = `?limit=10000`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;
      if (filters.room_id) q += `&room_id=${encodeURIComponent(filters.room_id)}`;

      const res = await api(`/admin/contracts${q}`);
      const formatted = res.data.map(c => ({
        'Mã HĐ': c.contract_code || c._id,
        'Sinh viên': c.student_id?.fullname || '',
        'Mã SV': c.student_id?.mssv || '',
        'Phòng': c.room_id?.room_code || '',
        'Ngày bắt đầu': new Date(c.start_date).toLocaleDateString('vi-VN'),
        'Ngày kết thúc': new Date(c.end_date).toLocaleDateString('vi-VN'),
        'Trạng thái': c.status === 'Active' ? 'Đang hiệu lực' : c.status === 'Expired' ? 'Hết hạn' : 'Đã hủy'
      }));
      exportToExcel(formatted, 'DS_HopDong', 'DuLieu');
    } catch (err) {
      console.error(err);
    }
  };

  const renderFilterBar = () => {
    const statusOptions = [
      { label: t('filter.effect'), value: 'Active' },
      { label: t('filter.ended'), value: 'Ended' }
    ];
    const sortOptions = [
      { label: t('sort.newest'), value: '' },
      { label: t('sort.oldest'), value: 'oldest' }
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
              showSearch
              style={{ width: '180px', borderRadius: '8px' }}
              placeholder={t('filter.selectRoom')}
              allowClear
              value={filters.room_id || undefined}
              onChange={v => setFilters(prev => ({ ...prev, room_id: v || '' }))}
              options={allRooms}
              optionFilterProp="label"
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
              onClick={openAddContract}
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
          title={
            modalType === 'add_contract' ? t('modal.addContract', 'Tạo hợp đồng') :
            modalType === 'edit_contract' ? t('modal.editContract', 'Gia hạn hợp đồng') :
            modalType === 'end_contract' ? 'Xác nhận kết thúc hợp đồng' :
            t('modal.viewContract', 'Chi tiết hợp đồng')
          }
          open={modalOpen}
          onOk={modalType === 'view_contract' ? () => setModalOpen(false) : handleModalSubmit}
          onCancel={() => setModalOpen(false)}
          okText={modalType === 'view_contract' ? t('modal.close', 'Đóng') : t('modal.save')}
          cancelButtonProps={modalType === 'view_contract' ? { style: { display: 'none' } } : {}}
          cancelText={t('modal.cancel')}
          destroyOnClose
          width={modalType === 'view_contract' ? 800 : 520}
        >
          {(modalType === 'add_contract' || modalType === 'edit_contract') ? (
            <Form layout="vertical">
            {modalType === 'add_contract' && (
              <>
                <Form.Item label={t('contracts.selectStudent', 'Chọn sinh viên')} required>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    value={contractForm.student_id || undefined}
                    onChange={(v) => setContractForm(f => ({ ...f, student_id: v }))}
                    options={allStudents}
                    placeholder="MSSV hoặc Tên"
                  />
                </Form.Item>
                <Form.Item label={t('contracts.selectRoom', 'Chọn phòng')} required>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    value={contractForm.room_id || undefined}
                    onChange={(v) => setContractForm(f => ({ ...f, room_id: v }))}
                    options={allRooms}
                    placeholder="Tòa nhà - Phòng"
                  />
                </Form.Item>
              </>
            )}
            <Form.Item label={t('contracts.from', 'Ngày bắt đầu')} required>
              <Input type="date" value={contractForm.start_date} onChange={(e) => setContractForm(f => ({ ...f, start_date: e.target.value }))} />
            </Form.Item>
            <Form.Item label={t('contracts.to', 'Ngày kết thúc')} required>
              <Input type="date" value={contractForm.end_date} onChange={(e) => setContractForm(f => ({ ...f, end_date: e.target.value }))} />
            </Form.Item>
            </Form>
          ) : null}
          {modalType === 'end_contract' && (
            <Form layout="vertical">
              <Form.Item label="Lý do kết thúc" required>
                <Input.TextArea 
                  rows={4} 
                  value={contractForm.reason} 
                  onChange={(e) => setContractForm(f => ({ ...f, reason: e.target.value }))} 
                  placeholder="Vui lòng nhập lý do (VD: Sinh viên đã tốt nghiệp, vi phạm nội quy...)" 
                />
              </Form.Item>
            </Form>
          )}
          {modalType === 'view_contract' && (
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ 
                background: 'white', padding: '30px 24px', borderRadius: '8px', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', 
                fontFamily: 'Times New Roman, serif', color: '#0f172a' 
              }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                  <h4 style={{ margin: 0, fontSize: '15px', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</h4>
                </div>
                
                <h2 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>HỢP ĐỒNG THUÊ CHỖ Ở KÝ TÚC XÁ</h2>
                
                <div style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  <p style={{ margin: '8px 0' }}><strong>Bên A (Cho thuê):</strong> {agentSettings?.contractBqlName || 'Ban Quản lý Ký túc xá'}</p>
                  <p style={{ margin: '8px 0' }}><strong>Người đại diện:</strong> {agentSettings?.contractRepName || '..............................'} - <strong>Chức vụ:</strong> {agentSettings?.contractRepRole || '..............................'}</p>
                  <p style={{ margin: '8px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}></p>
                  <p style={{ margin: '8px 0' }}><strong>Bên B (Người thuê):</strong> {viewingContract?.student_id?.fullname} - <strong>MSSV:</strong> {viewingContract?.student_id?.mssv || '...'}</p>
                  <p style={{ margin: '8px 0' }}><strong>CCCD/CMND:</strong> {viewingContract?.student_id?.cccd || '...'}</p>
                  <p style={{ margin: '8px 0' }}><strong>Căn hộ/Phòng:</strong> {viewingContract?.room_id?.room_code} (Tòa nhà {viewingContract?.room_id?.building})</p>
                  <p style={{ margin: '8px 0' }}><strong>Thời hạn thuê:</strong> Từ ngày {new Date(viewingContract?.start_date).toLocaleDateString('vi-VN')} đến ngày {new Date(viewingContract?.end_date).toLocaleDateString('vi-VN')}</p>
                  <p style={{ margin: '8px 0' }}><strong>Đơn giá:</strong> {viewingContract?.room_id?.price ? viewingContract.room_id.price.toLocaleString() : '...'} VNĐ/tháng</p>
                </div>

                <div style={{ marginTop: '24px', padding: '12px', background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', fontStyle: 'italic', fontSize: '13px' }}>
                  * Đây là bản xem trước tóm tắt. Vui lòng bấm <strong>In Hợp Đồng</strong> để xuất bản in A4 với đầy đủ các điều khoản pháp lý ràng buộc giữa hai bên.
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => {
                    if (printRef.current) {
                      window.print();
                    }
                  }}
                  style={{ 
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', 
                    borderColor: '#4338ca', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)', 
                    padding: '0 40px',
                    fontWeight: 600
                  }}
                >
                  {t('contracts.print')}
                </Button>
              </div>
              <ContractPrintTemplate ref={printRef} contract={viewingContract} settings={agentSettings} />
            </div>
          )}
        </Modal>

        <AdminContractsTab
          contracts={data.contracts || []}
          onEndContract={openEndContract}
          onEditContract={openEditContract}
          onDeleteContract={handleDeleteContract}
          onViewContract={(c) => {
            setViewingContract(c);
            setModalType('view_contract');
            setModalOpen(true);
          }}
          pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
        />
      </div>
    </div>
  );
}
