export default function ProfileTab({ user, form, setForm, onSave }) {
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="card-header">
        <div className="card-title">Cập nhật hồ sơ</div>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label>Họ tên</label>
          <input type="text" value={form.fullname} onChange={(e) => setForm((f) => ({ ...f, fullname: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>SĐT</label>
          <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} disabled={isAdmin} />
        </div>
        <div className="form-group">
          <label>Địa chỉ</label>
          <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} disabled={isAdmin} />
        </div>
        <div className="form-group">
          <label>Mật khẩu mới (Bỏ trống nếu không đổi)</label>
          <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Nhập pass mới..." />
        </div>
        <button type="button" className="btn btn-primary" onClick={onSave}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
