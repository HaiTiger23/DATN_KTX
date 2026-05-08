export default function AdminStudentsTab({ students, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ Tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>
                <strong>{s.mssv || 'N/A'}</strong>
              </td>
              <td>{s.fullname}</td>
              <td>{s.email}</td>
              <td>{s.phone || 'N/A'}</td>
              <td>
                <span className={`badge badge-${s.status}`}>{s.status}</span>
              </td>
              <td className="actions" style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => onEdit(s)}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)' }}
                  onClick={() => onDelete(s._id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
