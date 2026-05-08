import { formatDate, formatMoney } from '../../api';

export default function AdminRoomsTab({ rooms, onToggleStatus, onEdit }) {
  return (
    <div className="grid-cards">
      {rooms.map((r) => {
        const available = r.capacity - r.current_people;
        return (
          <div key={r._id} className="card">
            <div className="card-header">
              <div className="card-title">Phòng {r.room_code}</div>
              <span className={`badge badge-${r.status}`}>{r.status === 'Available' ? 'Khả dụng' : 'Bảo trì'}</span>
            </div>
            <div className="card-body">
              <div>
                🏢 Tòa nhà: <strong>{r.building}</strong>
              </div>
              <div>
                👥 Chỗ trống:{' '}
                <strong>
                  {available}/{r.capacity}
                </strong>
              </div>
              <div>
                💰 Giá: <strong>{formatMoney(r.price)}/tháng</strong>
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => onToggleStatus(r._id, r.status)}
              >
                Đổi trạng thái
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => onEdit(r)}
              >
                Sửa
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
