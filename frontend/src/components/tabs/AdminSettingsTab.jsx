export default function AdminSettingsTab({ geminiKey, setGeminiKey, onSave }) {
  return (
    <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="card-header">
        <div className="card-title">Cài đặt API AI</div>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label>Gemini API Key</label>
          <input
            type="password"
            id="gemini-key"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="Nhập API Key của Google Gemini..."
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={onSave}>
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
}
