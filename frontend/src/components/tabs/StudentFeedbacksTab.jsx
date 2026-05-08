export default function StudentFeedbacksTab({ feedbacks }) {
  if (feedbacks.length === 0) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Bạn chưa gửi phản hồi nào</p>;
  }

  return (
    <div className="grid-cards">
      {feedbacks.map((f) => (
        <div key={f._id} className="card">
          <div className="card-header">
            <div className="card-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.title}>
              {f.title}
            </div>
            <span className={`badge badge-${f.status}`}>{f.status === 'Pending' ? 'Chờ xử lý' : 'Đã phản hồi'}</span>
          </div>
          <div className="card-body">
            <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.02)', padding: '0.5rem', borderRadius: 4, fontSize: '0.85rem' }}>{f.description}</div>
            {f.reply_content ? (
              <div
                style={{
                  marginTop: '0.5rem',
                  background: 'rgba(79,70,229,0.05)',
                  color: 'var(--primary)',
                  padding: '0.5rem',
                  borderRadius: 4,
                  fontSize: '0.85rem',
                }}
              >
                <strong>Admin:</strong> {f.reply_content}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
