import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Input, Space, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useLanguage } from '../../context/LanguageContext';

export default function StudentChatbotTab({ sendMessage }) {
  const { locale, t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([{ id: 'welcome', role: 'bot', text: t('chat.welcome') }]);
  }, [locale, t]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const sendChat = useCallback(
    async (textOverride) => {
      const raw = textOverride !== undefined ? textOverride : input;
      const msg = raw.trim();
      if (!msg) return;

      const userId = `u-${Date.now()}`;
      setMessages((prev) => [...prev, { id: userId, role: 'user', text: msg }]);
      if (textOverride === undefined) setInput('');
      scrollToBottom();

      const tid = `typing-${Date.now()}`;
      setMessages((prev) => [...prev, { id: tid, role: 'typing', text: t('chat.thinking') }]);
      scrollToBottom();

      try {
        const history = messages
          .filter(m => m.role === 'user' || m.role === 'bot')
          .map(m => ({ role: m.role, text: m.text }));
          
        const res = await sendMessage(msg, history);
        setMessages((prev) => prev.filter((m) => m.id !== tid));
        setMessages((prev) => [...prev, { 
          id: `b-${Date.now()}`, 
          role: 'bot', 
          text: res.reply,
          actions: res.actions 
        }]);
      } catch (err) {
        const message = err instanceof Error ? err.message : t('chat.error');
        setMessages((prev) => prev.filter((m) => m.id !== tid));
        setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'error', text: message }]);
      }
      scrollToBottom();
    },
    [input, sendMessage, t],
  );

  return (
    <Card className="ktx-chat-card">
      <div className="ktx-chat-flex-col">
        <div className="ktx-chat-scroll">
          <Space orientation="vertical" size="middle" className="ktx-chat-messages">
            {messages.map((m) => (
              <Bubble key={m.id} role={m.role} text={m.text} actions={m.actions} />
            ))}
            <div ref={bottomRef} />
          </Space>
        </div>
        <div className="ktx-chat-footer">
          <Space wrap size="small" className="ktx-chat-quick-row">
            <Button size="small" type="default" onClick={() => sendChat(t('chat.quickAsk1'))}>
              {t('chat.quick1')}
            </Button>
            <Button size="small" type="default" onClick={() => sendChat(t('chat.quickAsk2'))}>
              {t('chat.quick2')}
            </Button>
            <Button size="small" type="default" onClick={() => sendChat(t('chat.quickAsk3'))}>
              {t('chat.quick3')}
            </Button>
          </Space>
          <Space.Compact className="ktx-chat-compact">
            <Input
              placeholder={t('chat.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={() => sendChat()}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={() => sendChat()}>
              {t('chat.send')}
            </Button>
          </Space.Compact>
        </div>
      </div>
    </Card>
  );
}

import { DatabaseOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

function Bubble({ role, text, actions }) {
  const isUser = role === 'user';
  const isError = role === 'error';
  const isTyping = role === 'typing';

  let bubbleClass = 'ktx-chat-bubble';
  if (isUser) bubbleClass += ' ktx-chat-bubble--user';
  else if (isError) bubbleClass += ' ktx-chat-bubble--error';
  else {
    bubbleClass += ' ktx-chat-bubble--bot';
    if (isTyping) bubbleClass += ' ktx-chat-bubble--typing';
  }

  const getActionLabel = (name) => {
    if (name === 'checkRoomAvailability') return 'Tra cứu phòng trống';
    if (name === 'checkContractStatus') return 'Kiểm tra hợp đồng';
    if (name === 'createMaintenanceRequest') return 'Gửi yêu cầu sửa chữa';
    return name;
  };

  return (
    <div className={`ktx-chat-row ${isUser ? 'ktx-chat-row--end' : 'ktx-chat-row--start'}`}>
      <div className={isUser ? '' : 'ktx-chat-bot-wrap'}>
        {actions && actions.length > 0 && (
          <div className="ktx-chat-action-badge">
            <Tag color="blue" icon={<DatabaseOutlined />}>
              Hệ thống: {actions.map(a => getActionLabel(a)).join(', ')}
            </Tag>
          </div>
        )}
        <Typography.Text className={bubbleClass}>{text}</Typography.Text>
      </div>
    </div>
  );
}
