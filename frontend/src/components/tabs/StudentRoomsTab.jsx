import { useMemo, useState } from 'react';
import { formatMoney } from '../../api';

export default function StudentRoomsTab({ rooms, onRegister }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  const filtered = useMemo(() => {
    let list = rooms.filter((r) => {
      const available = r.capacity - r.current_people;
      if (available <= 0) return false;
      const q = search.toLowerCase();
      return r.room_code.toLowerCase().includes(q) || r.building.toLowerCase().includes(q);
    });
    if (sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [rooms, search, sort]);

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm mã phòng, tòa nhà..."
          style={{ flex: 1, minWidth: 200, padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', outline: 'none', background: 'white' }}
        >
          <option value="default">Sắp xếp mặc định</option>
          <option value="price_asc">Giá: Thấp đến cao</option>
          <option value="price_desc">Giá: Cao đến thấp</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Không tìm thấy phòng phù hợp</p>
      ) : (
        <div className="grid-cards">
          {filtered.map((r) => {
            const available = r.capacity - r.current_people;
            return (
              <div key={r._id} className="card">
                <div className="card-header">
                  <div className="card-title">Phòng {r.room_code}</div>
                  <span className="badge badge-Available">Khả dụng</span>
                </div>
                <div className="card-body">
                  <div>
                    🏢 Tòa nhà: <strong>{r.building}</strong>
                  </div>
                  <div>
                    👥 Chỗ trống:{' '}
                    <strong style={{ color: 'var(--success)' }}>
                      {available}/{r.capacity}
                    </strong>
                  </div>
                  <div>
                    💰 Giá: <strong>{formatMoney(r.price)}/tháng</strong>
                  </div>
                </div>
                <div className="card-footer">
                  <button type="button" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: '100%' }} onClick={() => onRegister(r._id)}>
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
