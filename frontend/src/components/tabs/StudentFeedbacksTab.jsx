import { useState } from 'react';
import { Card, Col, Row, Tag, Typography, Button, Modal, Space, Avatar } from 'antd';
import { MessageOutlined, SendOutlined, DeleteOutlined } from '@ant-design/icons';
import { User, Shield } from 'lucide-react';
import FeedbackRichBody from '../FeedbackRichBody';
import { useLanguage } from '../../context/LanguageContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function statusColor(status) {
  return status === 'Pending' ? 'processing' : 'success';
}

export default function StudentFeedbacksTab({ feedbacks, onSendReply, onDeleteReply, pagination, currentUser }) {
  const { t } = useLanguage();
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');

  if (feedbacks.length === 0) {
    return (
      <Typography.Paragraph type="secondary" className="ktx-tab-empty">
        {t('studentFeedbacks.empty')}
      </Typography.Paragraph>
    );
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        {feedbacks.map((f) => (
          <Col xs={24} md={12} key={f._id}>
            <Card
              title={
                <Typography.Text ellipsis title={f.title}>
                  {f.title}
                </Typography.Text>
              }
              extra={<Tag color={statusColor(f.status)}>{f.status === 'Pending' ? t('feedbacks.pending') : t('feedbacks.replied')}</Tag>}
              actions={[
                <Button type="link" icon={<MessageOutlined />} onClick={() => setViewingFeedback(f)}>
                  {t('feedbacks.viewDetails')}
                </Button>
              ]}
            >
              <div className="ktx-tab-p-last">
                <FeedbackRichBody content={f.description} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={viewingFeedback?.title}
        open={!!viewingFeedback}
        onCancel={() => setViewingFeedback(null)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setViewingFeedback(null)}>
            Đóng
          </Button>
        ]}
      >
        {viewingFeedback && (
          <Space direction="vertical" style={{ width: '100%', maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }} size="middle">
            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Avatar icon={<User size={16} />} />
                <div style={{ flex: 1 }}>
                  <Typography.Text strong>Bạn</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{new Date(viewingFeedback.createdAt).toLocaleString('vi-VN')}</Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    <FeedbackRichBody content={viewingFeedback.description} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
              {!viewingFeedback.replies?.length && viewingFeedback.reply_content && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, alignSelf: 'flex-start', background: '#e6f7ff', padding: '12px 16px', borderRadius: '0 16px 16px 16px', border: '1px solid #91d5ff', maxWidth: '85%' }}>
                  <Avatar icon={<Shield size={16} />} style={{ background: '#1890ff' }} />
                  <div style={{ flex: 1 }}>
                    <Typography.Text strong>Ban quản lý</Typography.Text>
                    <div style={{ marginTop: 8 }}>
                      <FeedbackRichBody content={viewingFeedback.reply_content} />
                    </div>
                  </div>
                </div>
              )}

              {viewingFeedback.replies?.map((reply, index) => {
                const isStudent = reply.role === 'Student';
                const isOwn = isStudent && reply.user_id === currentUser?._id;
                return (
                  <div key={reply._id || index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 12, 
                    alignSelf: isStudent ? 'flex-end' : 'flex-start',
                    background: isStudent ? '#f5f5f5' : '#e6f7ff',
                    padding: '12px 16px',
                    borderRadius: isStudent ? '16px 0 16px 16px' : '0 16px 16px 16px',
                    border: isStudent ? '1px solid #d9d9d9' : '1px solid #91d5ff',
                    maxWidth: '85%'
                  }}>
                    {!isStudent && <Avatar icon={<Shield size={16} />} style={{ background: '#1890ff' }} />}
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography.Text strong>{isStudent ? 'Bạn' : 'Ban quản lý'}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 16 }}>{new Date(reply.createdAt).toLocaleString('vi-VN')}</Typography.Text>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <FeedbackRichBody content={reply.content} />
                      </div>
                      {isOwn && (
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
                                setViewingFeedback(prev => ({
                                  ...prev,
                                  replies: prev.replies.filter(r => r._id !== reply._id)
                                }));
                              }
                            });
                          }}
                        />
                      )}
                    </div>
                    {isStudent && <Avatar icon={<User size={16} />} />}
                  </div>
                );
              })}
            </div>

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
