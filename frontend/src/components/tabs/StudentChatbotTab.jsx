import { useCallback, useRef, useState } from 'react';

export default function StudentChatbotTab({ sendMessage }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Xin chào! Tôi là trợ lý ảo KTX. Tôi có thể giúp gì cho bạn dựa trên Cơ sở tri thức?',
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

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
      setMessages((prev) => [...prev, { id: tid, role: 'typing', text: 'Đang suy nghĩ...' }]);
      scrollToBottom();

      try {
        const res = await sendMessage(msg);
        setMessages((prev) => prev.filter((m) => m.id !== tid));
        setMessages((prev) => [...prev, { id: `b-${Date.now()}`, role: 'bot', text: res.reply }]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi';
        setMessages((prev) => prev.filter((m) => m.id !== tid));
        setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'error', text: message }]);
      }
      scrollToBottom();
    },
    [input, sendMessage],
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: 800,
        margin: '0 auto',
        background: 'var(--glass-bg)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--glass-border)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={
              m.role === 'user'
                ? {
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: 8,
                    alignSelf: 'flex-end',
                    maxWidth: '80%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }
                : m.role === 'error'
                  ? {
                      background: '#FEE2E2',
                      color: '#991B1B',
                      padding: '1rem',
                      borderRadius: 8,
                      alignSelf: 'flex-start',
                      maxWidth: '80%',
                      whiteSpace: 'pre-wrap',
                    }
                  : {
                      background: 'white',
                      padding: '1rem',
                      borderRadius: 8,
                      alignSelf: 'flex-start',
                      maxWidth: '80%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      fontStyle: m.role === 'typing' ? 'italic' : 'normal',
                      color: m.role === 'typing' ? '#666' : undefined,
                      whiteSpace: 'pre-wrap',
                    }
            }
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.5)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
          <button
            type="button"
            className="badge badge-Available"
            style={{ cursor: 'pointer', background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', border: 'none' }}
            onClick={() => sendChat('Ký túc xá có những tiện ích gì?')}
          >
            Ký túc xá có tiện ích gì?
          </button>
          <button
            type="button"
            className="badge badge-Available"
            style={{ cursor: 'pointer', background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', border: 'none' }}
            onClick={() => sendChat('Quy định giờ giấc ra vào thế nào?')}
          >
            Quy định giờ giấc?
          </button>
          <button
            type="button"
            className="badge badge-Available"
            style={{ cursor: 'pointer', background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', border: 'none' }}
            onClick={() => sendChat('Có được nấu ăn trong phòng không?')}
          >
            Được nấu ăn không?
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Nhập câu hỏi của bạn..."
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 99, border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendChat();
            }}
          />
          <button type="button" className="btn btn-primary" style={{ borderRadius: 99 }} onClick={() => sendChat()}>
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
