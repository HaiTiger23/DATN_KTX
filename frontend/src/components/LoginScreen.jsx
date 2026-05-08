import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../api';
import { useToast } from '../context/ToastContext';

export default function LoginScreen() {
  const api = useApi();
  const { showToast } = useToast();
  const { loginSuccess, registerSuccess } = useAuth();
  const [mode, setMode] = useState('login');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regFullname, setRegFullname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMssv, setRegMssv] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const data = await api('/auth/login', 'POST', { email, password });
      loginSuccess(data);
    } catch {
      // toast handled in fetchAPI
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const data = await fetchAPI(
        '/auth/register',
        'POST',
        {
          fullname: regFullname,
          email: regEmail,
          password: regPassword,
          mssv: regMssv,
        },
        showToast,
      );
      registerSuccess(data);
    } catch {
      // handled
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <div id="login-screen" className="screen active">
      <div className="login-card glass">
        <div className="logo">
          <div className="icon">🏢</div>
          <h2>KTX Manager</h2>
        </div>
        <p className="subtitle">
          {mode === 'login' ? 'Đăng nhập hệ thống quản lý' : 'Tạo tài khoản sinh viên'}
        </p>

        {mode === 'login' ? (
          <form id="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                placeholder="admin@dorm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" id="login-btn" disabled={loginLoading}>
              <span className={loginLoading ? 'hidden' : ''}>Đăng nhập</span>
              <div className={`loader ${loginLoading ? '' : 'hidden'}`} />
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => setMode('register')}
                style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Đăng ký sinh viên
              </button>
            </div>
          </form>
        ) : (
          <form id="register-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Họ tên (*)</label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={regFullname}
                onChange={(e) => setRegFullname(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email (*)</label>
              <input
                type="email"
                required
                placeholder="sv@dorm.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu (*)</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>MSSV</label>
              <input type="text" placeholder="SV001" value={regMssv} onChange={(e) => setRegMssv(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={registerLoading}>
              <span className={registerLoading ? 'hidden' : ''}>Đăng ký</span>
              <div className={`loader ${registerLoading ? '' : 'hidden'}`} />
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
