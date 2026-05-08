import { formatDate } from '../../api';

export default function StudentContractsTab({ contracts, onCancelContract }) {
  if (contracts.length === 0) {
    return <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>Bạn chưa có hợp đồng nào</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Mã phòng</th>
            <th>Tòa nhà</th>
            <th>Từ ngày</th>
            <th>Đến ngày</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c._id}>
              <td>
                <strong>{c.room_id?.room_code || 'N/A'}</strong>
              </td>
              <td>{c.room_id?.building || 'N/A'}</td>
              <td>{formatDate(c.start_date)}</td>
              <td>{formatDate(c.end_date)}</td>
              <td>
                <span className={`badge badge-${c.status}`}>{c.status}</span>
              </td>
              <td className="actions">
                {c.status === 'Active' ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)' }}
                    onClick={() => onCancelContract(c._id)}
                  >
                    Yêu cầu Hủy
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
