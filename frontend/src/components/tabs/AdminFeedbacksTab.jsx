export default function AdminFeedbacksTab({ feedbacks, onReply }) {
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
            <div>
              👨‍🎓 Từ: <strong>{f.student_id?.fullname || 'N/A'}</strong>
            </div>
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
          {f.status === 'Pending' ? (
            <div className="card-footer">
              <button type="button" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => onReply(f._id)}>
                Trả lời
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
