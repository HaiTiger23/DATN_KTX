import { useState } from 'react';
import { Button, List, Tag, Typography, Modal, Pagination, Space, Input, Avatar } from 'antd';
import { MessageOutlined, SendOutlined, DeleteOutlined } from '@ant-design/icons';
import { User, Shield } from 'lucide-react';
import FeedbackRichBody from '../FeedbackRichBody';
import { useLanguage } from '../../context/LanguageContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function statusColor(status) {
  return status === 'Pending' ? 'processing' : 'success';
}

export default function AdminFeedbacksTab({ feedbacks, onSendReply, onDeleteReply, onDelete, pagination, currentUser }) {
  const { t } = useLanguage();
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');

  return (
    <>
      <List
        className="ktx-feedback-list"
        itemLayout="horizontal"
        dataSource={feedbacks}
        renderItem={(f) => (
          <List.Item
            style={{ 
              cursor: 'pointer', 
              background: '#fff', 
              marginBottom: 12, 
              borderRadius: 8, 
              padding: '16px 24px',
              border: '1px solid #f0f0f0',
              transition: 'box-shadow 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            onClick={() => setViewingFeedback(f)}
            actions={[
              <Tag color={statusColor(f.status)}>
                {f.status === 'Pending' ? t('feedbacks.pending') : t('feedbacks.replied')}
              </Tag>
            ]}
          >
            <List.Item.Meta
              title={
                <Typography.Text strong ellipsis style={{ maxWidth: '100%', fontSize: 16 }}>
                  {f.title}
                </Typography.Text>
              }
              description={
                <Typography.Text type="secondary">
                  <User size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} /> {t('feedbacks.from')} <Typography.Text strong>{f.student_id?.fullname || t('common.na')}</Typography.Text>
                </Typography.Text>
              }
            />
          </List.Item>
        )}
      />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Pagination {...pagination} />
      </div>

      <Modal
        title={t('feedbacks.detailTitle', 'Chi tiết phản ánh')}
        open={!!viewingFeedback}
        onCancel={() => setViewingFeedback(null)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: t('confirm.delete', 'Bạn có chắc chắn muốn xóa không?'),
                  onOk: () => {
                    onDelete(viewingFeedback._id);
                    setViewingFeedback(null);
                  }
                });
              }}
            >
              Xóa phản ánh
            </Button>
            <Button onClick={() => setViewingFeedback(null)}>Đóng</Button>
          </div>
        }
      >
        {viewingFeedback && (
          <Space direction="vertical" style={{ width: '100%', maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }} size="middle">
            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <Typography.Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>{viewingFeedback.title}</Typography.Text>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Avatar icon={<User size={16} />} />
                <div style={{ flex: 1 }}>
                  <Typography.Text strong>{viewingFeedback.student_id?.fullname || t('common.na')}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{new Date(viewingFeedback.createdAt).toLocaleString('vi-VN')}</Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    <FeedbackRichBody content={viewingFeedback.description} />
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Thread */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
              {/* Fallback for old data without replies array but has reply_content */}
              {!viewingFeedback.replies?.length && viewingFeedback.reply_content && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, alignSelf: 'flex-start', background: '#e6f7ff', padding: '12px 16px', borderRadius: '0 16px 16px 16px', border: '1px solid #91d5ff', maxWidth: '85%' }}>
                  <Avatar icon={<Shield size={16} />} style={{ background: '#1890ff' }} />
                  <div style={{ flex: 1 }}>
                    <Typography.Text strong>Ban quản lý (Phản hồi cũ)</Typography.Text>
                    <div style={{ marginTop: 8 }}>
                      <FeedbackRichBody content={viewingFeedback.reply_content} />
                    </div>
                  </div>
                </div>
              )}

              {/* Render Replies Array */}
              {viewingFeedback.replies?.map((reply, index) => {
                const isAdmin = reply.role === 'Admin';
                const isOwn = isAdmin && reply.user_id === currentUser?._id;
                return (
                  <div key={reply._id || index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 12, 
                    alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                    background: isAdmin ? '#e6f7ff' : '#f5f5f5',
                    padding: '12px 16px',
                    borderRadius: isAdmin ? '16px 0 16px 16px' : '0 16px 16px 16px',
                    border: isAdmin ? '1px solid #91d5ff' : '1px solid #d9d9d9',
                    maxWidth: '85%'
                  }}>
                    {!isAdmin && <Avatar icon={<User size={16} />} />}
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography.Text strong>{isAdmin ? 'Ban quản lý' : viewingFeedback.student_id?.fullname}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 16 }}>{new Date(reply.createdAt).toLocaleString('vi-VN')}</Typography.Text>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <FeedbackRichBody content={reply.content} />
                      </div>
                      <Button 
                        type="text" 
                        danger 
                        size="small" 
                        icon={<DeleteOutlined />} 
                        style={{ position: 'absolute', top: -4, right: -24 }}
                        onClick={() => {
                          Modal.confirm({
                            title: 'Xóa phản hồi này?',
                            onOk: async () => {
                              await onDeleteReply(viewingFeedback._id, reply._id);
                              // Update local state to remove it instantly to avoid UI flicker
                              setViewingFeedback(prev => ({
                                ...prev,
                                replies: prev.replies.filter(r => r._id !== reply._id)
                              }));
                            }
                          });
                        }}
                      />
                    </div>
                    {isAdmin && <Avatar icon={<Shield size={16} />} style={{ background: '#1890ff' }} />}
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <div style={{ marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <Typography.Text strong>Gửi phản hồi:</Typography.Text>
              <ReactQuill
                theme="snow"
                value={replyText}
                onChange={setReplyText}
                style={{ height: '100px', marginBottom: '50px', marginTop: 8 }}
                modules={{ toolbar: [['bold', 'italic', 'underline', 'strike'], [{'list': 'ordered'}, {'list': 'bullet'}], ['clean']] }}
              />
              <div style={{ textAlign: 'right' }}>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  disabled={!replyText || replyText.trim() === '' || replyText === '<p><br></p>'}
                  onClick={async () => {
                    await onSendReply(viewingFeedback._id, replyText);
                    setReplyText('');
                    // Local optimistic update could be done here, but loadTab will re-fetch data.
                    // For better UX we could close modal or wait for the refetch.
                    // Instead of closing, we can just let it sit. However viewingFeedback won't auto-update.
                    // We'd need to fetch the single feedback or close the modal. Let's close modal for simplicity.
                    setViewingFeedback(null);
                  }}
                >
                  Gửi
                </Button>
              </div>
            </div>
          </Space>
        )}
      </Modal>
    </>
  );
}
