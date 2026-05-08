export default function AdminKnowledgeTab({ items, onDelete }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Câu hỏi</th>
            <th>Câu trả lời</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center' }}>
                Chưa có dữ liệu
              </td>
            </tr>
          ) : null}
          {items.map((item) => (
            <tr key={item._id}>
              <td style={{ maxWidth: 200 }}>
                <strong>{item.question}</strong>
              </td>
              <td style={{ maxWidth: 300 }}>{item.answer}</td>
              <td className="actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)' }}
                  onClick={() => onDelete(item._id)}
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
