import { useState } from 'react';
import { List, Typography, Space, Badge, Modal } from 'antd';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../api';

export default function StudentNotificationsTab({ notifications, onRead }) {
  const { t } = useLanguage();
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = (notif) => {
    setSelectedNotif(notif);
    setModalOpen(true);
    if (!notif.isRead) {
      onRead(notif._id);
    }
  };

  return (
    <div className="ktx-tab-content">
      <List
        className="ktx-notification-list"
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: t('notifications.empty') }}
        renderItem={(item) => (
          <List.Item
            className={`ktx-notification-item ${item.isRead ? 'read' : 'unread'}`}
            onClick={() => handleClick(item)}
            style={{ cursor: 'pointer', padding: '16px', background: item.isRead ? '#fafafa' : '#fff', borderBottom: '1px solid #f0f0f0' }}
          >
            <List.Item.Meta
              title={
                <Space>
                  {!item.isRead && <Badge status="processing" />}
                  <Typography.Text strong={!item.isRead}>{item.title}</Typography.Text>
                </Space>
              }
              description={formatDate(item.createdAt)}
            />
          </List.Item>
        )}
      />

      <Modal
        title={selectedNotif?.title}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
      >
        <div style={{ marginTop: 16 }}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            {formatDate(selectedNotif?.createdAt)}
          </Typography.Text>
          <div
            className="ql-editor"
            style={{ padding: 0 }}
            dangerouslySetInnerHTML={{ __html: selectedNotif?.content || '' }}
          />
        </div>
      </Modal>
    </div>
  );
}
