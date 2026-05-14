import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input, Space, Typography, Avatar, Tag } from 'antd';
import { SendOutlined, RobotOutlined, DatabaseOutlined } from '@ant-design/icons';
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
    [input, messages, sendMessage, t],
  );

  return (
    <div className="gemini-chat-container">
      <div className="gemini-chat-scroll">
        <div className="gemini-chat-inner">
          <div className="gemini-chat-messages">
            {messages.map((m) => (
              <Bubble key={m.id} role={m.role} text={m.text} actions={m.actions} t={t} />
            ))}
            <div ref={bottomRef} style={{ height: 20 }} />
          </div>
        </div>
      </div>
      
      <div className="gemini-chat-footer">
        <div className="gemini-chat-inner">
          <Space wrap size="small" className="gemini-chat-quick-row">
            <Button shape="round" className="gemini-quick-btn" onClick={() => sendChat(t('chat.quickAsk1'))}>
              {t('chat.quick1')}
            </Button>
            <Button shape="round" className="gemini-quick-btn" onClick={() => sendChat(t('chat.quickAsk2'))}>
              {t('chat.quick2')}
            </Button>
            <Button shape="round" className="gemini-quick-btn" onClick={() => sendChat(t('chat.quickAsk3'))}>
              {t('chat.quick3')}
            </Button>
          </Space>
          <div className="gemini-input-wrapper">
            <Input
              className="gemini-input"
              placeholder={t('chat.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={() => sendChat()}
              bordered={false}
              suffix={
                <Button 
                  type="text" 
                  shape="circle"
                  icon={<SendOutlined style={{ fontSize: 18, color: input.trim() ? '#1a73e8' : '#9aa0a6' }} />} 
                  onClick={() => sendChat()}
                  disabled={!input.trim()}
                />
              }
            />
          </div>
          <Typography.Text type="secondary" className="gemini-disclaimer">
            Gemini can make mistakes. Consider verifying important information.
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, text, actions, t }) {
  const isUser = role === 'user';
  const isError = role === 'error';
  const isTyping = role === 'typing';

  const getActionLabel = (name) => {
    if (name === 'checkRoomAvailability') return t('settings.agentCheckRoom');
    if (name === 'checkContractStatus') return t('settings.agentCheckContract');
    return name;
  };

  if (isUser) {
    return (
      <div className="gemini-message-row user">
        <div className="gemini-user-bubble">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className={`gemini-message-row bot ${isError ? 'error' : ''}`}>
      <Avatar 
        className={`gemini-bot-avatar ${isTyping ? 'typing' : ''}`} 
        icon={<RobotOutlined spin={isTyping} />} 
      />
      <div className="gemini-bot-content">
        {actions && actions.length > 0 && (
          <div className="gemini-bot-actions">
            <Tag color="geekblue" icon={<DatabaseOutlined />} style={{ borderRadius: 16 }}>
              {t('chat.system')}: {actions.map(a => getActionLabel(a)).join(', ')}
            </Tag>
          </div>
        )}
        <Typography.Paragraph className={`gemini-bot-text ${isTyping ? 'pulse' : ''}`}>
          {text.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </Typography.Paragraph>
      </div>
    </div>
  );
}
