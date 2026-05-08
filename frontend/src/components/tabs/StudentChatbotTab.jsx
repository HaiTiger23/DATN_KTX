import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Flex, Input, Space, Typography } from 'antd';
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
        const res = await sendMessage(msg);
        setMessages((prev) => prev.filter((m) => m.id !== tid));
        setMessages((prev) => [...prev, { id: `b-${Date.now()}`, role: 'bot', text: res.reply }]);
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
    <Card
      styles={{ body: { padding: 0 } }}
      style={{ maxWidth: 800, margin: '0 auto', height: 'min(70vh, 640px)', display: 'flex', flexDirection: 'column' }}
    >
      <Flex vertical style={{ flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {messages.map((m) => (
              <Bubble key={m.id} role={m.role} text={m.text} />
            ))}
            <div ref={bottomRef} />
          </Space>
        </div>
        <div style={{ padding: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Space wrap size="small" style={{ marginBottom: 8 }}>
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
          <Space.Compact style={{ width: '100%' }}>
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
      </Flex>
    </Card>
  );
}

function Bubble({ role, text }) {
  const isUser = role === 'user';
  const isError = role === 'error';
  const isTyping = role === 'typing';

  const style = isUser
    ? {
        alignSelf: 'flex-end',
        maxWidth: '85%',
        background: '#4F46E5',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: 12,
      }
    : isError
      ? {
          alignSelf: 'flex-start',
          maxWidth: '85%',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          color: '#a8071a',
          padding: '12px 16px',
          borderRadius: 12,
          whiteSpace: 'pre-wrap',
        }
      : {
          alignSelf: 'flex-start',
          maxWidth: '85%',
          background: '#fafafa',
          border: '1px solid #f0f0f0',
          padding: '12px 16px',
          borderRadius: 12,
          whiteSpace: 'pre-wrap',
          fontStyle: isTyping ? 'italic' : 'normal',
          color: isTyping ? 'rgba(0,0,0,0.45)' : undefined,
        };

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', width: '100%' }}>
      <Typography.Text style={style}>{text}</Typography.Text>
    </div>
  );
}
