import React, { useState, useEffect } from 'react';
import { Empty, Spin, Modal, Form, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AdminKnowledgeTab from '../../components/tabs/AdminKnowledgeTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import RichTextEditor from '../../components/RichTextEditor';

export default function AdminKnowledgePage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  
  const [data, setData] = useState({ knowledge: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [knowledgeForm, setKnowledgeForm] = useState({ question: '', answer: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api(`/admin/knowledge?page=${page}&limit=${limit}`);
      setData({ knowledge: res.data });
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit]);

  const deleteKnowledge = (id) => {
    Modal.confirm({
      title: t('confirm.deleteKnowledge'),
      okType: 'danger',
      onOk: async () => {
        try {
          await api(`/admin/knowledge/${id}`, 'DELETE');
          showToast(t('toast.knowledgeDeleted'));
          loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleModalSubmit = async () => {
    try {
      if (!knowledgeForm.question || !knowledgeForm.answer) {
        showToast(t('toast.missingFields'), 'error');
        return;
      }
      await api('/admin/knowledge', 'POST', knowledgeForm);
      showToast(t('toast.knowledgeCreated', 'Thêm tri thức thành công'));
      setModalOpen(false);
      loadData();
    } catch (err) {
      Modal.error({ title: t('dashboard.loadError'), content: err.message });
    }
  };

  const openAddKnowledge = () => {
    setKnowledgeForm({ question: '', answer: '' });
    setModalOpen(true);
  };

  if (data.error) {
    return <Empty description={<span style={{ color: 'red' }}>{t('dashboard.loadError')}</span>} />;
  }

  return (
    <div style={{ position: 'relative', minHeight: '200px' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255, 255, 255, 0.6)', zIndex: 10, borderRadius: '12px' }}>
          <Spin size="large" />
        </div>
      )}

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', borderRadius: '8px' }}
          onClick={openAddKnowledge}
        >
          {t('dashboard.addKnowledge')}
        </Button>
      </div>

      <Modal
        title={t('modal.addKnowledge', 'Thêm Tri thức (RAG)')}
        open={modalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setModalOpen(false)}
        okText={t('modal.save')}
        cancelText={t('modal.cancel')}
        destroyOnClose
        width={700}
      >
        <Form layout="vertical">
          <Form.Item label={t('modal.question', 'Câu hỏi')} required>
            <Input value={knowledgeForm.question} onChange={(e) => setKnowledgeForm((f) => ({ ...f, question: e.target.value }))} />
          </Form.Item>
          <Form.Item label={t('modal.answer', 'Câu trả lời')} required>
            <RichTextEditor
              value={knowledgeForm.answer}
              onChange={(html) => setKnowledgeForm((f) => ({ ...f, answer: html }))}
              placeholder={t('modal.knowledgeAnswerPlaceholder', 'Nhập chi tiết câu trả lời...')}
            />
          </Form.Item>
        </Form>
      </Modal>

      <AdminKnowledgeTab
        items={data.knowledge || []}
        onDelete={deleteKnowledge}
        pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
      />
    </div>
  );
}
