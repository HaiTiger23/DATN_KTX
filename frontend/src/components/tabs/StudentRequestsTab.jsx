import { formatDate } from '../../api';

export default function StudentRequestsTab({ requests }) {
  if (requests.length === 0) {
    return <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>Bạn chưa có đơn đăng ký nào</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Mã phòng</th>
            <th>Tòa nhà</th>
            <th>Loại đơn</th>
            <th>Ngày gửi</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r._id}>
              <td>
                <strong>{r.room_id?.room_code || 'N/A'}</strong>
              </td>
              <td>{r.room_id?.building || 'N/A'}</td>
              <td>{r.type === 'Cancellation' ? 'Hủy hợp đồng' : 'Đăng ký phòng'}</td>
              <td>{formatDate(r.createdAt)}</td>
              <td>
                <span className={`badge badge-${r.status}`}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
