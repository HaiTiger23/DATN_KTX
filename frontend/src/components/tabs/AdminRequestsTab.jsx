import { formatDate } from '../../api';

export default function AdminRequestsTab({ requests, onHandle }) {
  if (requests.length === 0) {
    return <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>Không có đơn đăng ký chờ duyệt</p>;
  }

  return (
    <div className="grid-cards">
      {requests.map((r) => (
        <div key={r._id} className="card">
          <div className="card-header">
            <div className="card-title">{r.type === 'Cancellation' ? 'Yêu cầu Hủy Hợp đồng' : 'Đơn đăng ký phòng'}</div>
            <span className="badge badge-Pending">Chờ duyệt</span>
          </div>
          <div className="card-body">
            <div>
              👨‍🎓 SV:{' '}
              <strong>
                {r.student_id?.fullname || 'N/A'} ({r.student_id?.mssv || 'N/A'})
              </strong>
            </div>
            <div>
              🛏️ Phòng:{' '}
              <strong>
                {r.room_id?.room_code || 'N/A'} - {r.room_id?.building || 'N/A'}
              </strong>
            </div>
            {r.type !== 'Cancellation' ? (
              <div>
                ⏳ Thời hạn: <strong>{r.months || 6} tháng</strong>
              </div>
            ) : null}
            <div>
              📅 Ngày gửi: <strong>{formatDate(r.createdAt)}</strong>
            </div>
          </div>
          <div className="card-footer">
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--danger)' }}
              onClick={() => onHandle(r._id, 'reject')}
            >
              Từ chối
            </button>
            <button type="button" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => onHandle(r._id, 'approve')}>
              Duyệt
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
