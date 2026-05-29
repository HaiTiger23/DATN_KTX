import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input, Space, Typography, Avatar, Tag } from 'antd';
import { SendOutlined, RobotOutlined, DatabaseOutlined, MessageOutlined, CloseOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';

export default function AiChatWidget({ api, chatEndpoint = '/student/chat', isAdmin = false }) {
  const { locale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Auto-scroll when messages change
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const initChat = useCallback(() => {
    if (messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'bot', text: t('chat.welcome') }]);
    }
  }, [messages.length, t]);

  useEffect(() => {
    if (isOpen) {
      initChat();
    }
  }, [isOpen, initChat]);

  const sendMessage = async (msg, history) => {
    return api(chatEndpoint, 'POST', { message: msg, history });
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
    [input, messages, t, api],
  );

  return (
    <div className="ktx-ai-widget-container">
      {/* Nút bấm (Bubble) */}
      {!isOpen && (
        <Button 
          type="primary" 
          shape="circle" 
          size="large"
          className="ktx-ai-widget-button"
          icon={<MessageOutlined style={{ fontSize: 24 }} />}
          onClick={() => setIsOpen(true)}
        />
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="ktx-ai-widget-window">
          {/* Header */}
          <div className="ktx-ai-widget-header">
            <Space>
              <RobotOutlined style={{ fontSize: 20 }} />
              <Typography.Text strong style={{ color: '#fff', fontSize: 16 }}>KTX Assistant</Typography.Text>
            </Space>
            <Button 
              type="text" 
              icon={<CloseOutlined style={{ color: '#fff' }} />} 
              onClick={() => setIsOpen(false)} 
            />
          </div>

          {/* Body */}
          <div className="gemini-chat-scroll" style={{ flex: 1 }}>
            <div className="gemini-chat-inner">
              <div className="gemini-chat-messages">
                {messages.map((m) => (
                  <Bubble key={m.id} role={m.role} text={m.text} actions={m.actions} t={t} />
                ))}
                <div ref={bottomRef} style={{ height: 20 }} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="gemini-chat-footer">
            <div className="gemini-chat-inner" style={{ padding: '10px' }}>
              <Space wrap size="small" className="gemini-chat-quick-row" style={{ marginBottom: 8, justifyContent: 'center' }}>
                {isAdmin ? (
                  <>
                    <Button size="small" shape="round" className="gemini-quick-btn" onClick={() => sendChat("Thống kê hệ thống hiện tại")}>
                      Thống kê KTX
                    </Button>
                    <Button size="small" shape="round" className="gemini-quick-btn" onClick={() => sendChat("Có đơn yêu cầu hay phản ánh nào đang chờ không?")}>
                      Việc cần làm
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="small" shape="round" className="gemini-quick-btn" onClick={() => sendChat(t('chat.quickAsk1'))}>
                      {t('chat.quick1')}
                    </Button>
                    <Button size="small" shape="round" className="gemini-quick-btn" onClick={() => sendChat(t('chat.quickAsk2'))}>
                      {t('chat.quick2')}
                    </Button>
                    <Button size="small" shape="round" className="gemini-quick-btn" onClick={() => sendChat(t('chat.quickAsk3'))}>
                      {t('chat.quick3')}
                    </Button>
                  </>
                )}
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
            </div>
          </div>
        </div>
      )}
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
    if (name === 'getSystemStats') return 'Thống kê hệ thống';
    if (name === 'searchStudent') return 'Tìm kiếm sinh viên';
    if (name === 'getPendingTasks') return 'Tra cứu công việc';
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
