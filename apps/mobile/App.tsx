import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:4001';

const icons: Record<string, string> = {
  Home: '🏠', Video: '🎬', Social: '📝', Chat: '💬', Shop: '🛒', Profile: '👤'
};

function LoginScreen({ onLogin, onNavigate }: { onLogin: () => void; onNavigate: (screen: string) => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) return alert('请填写手机号和密码');
    if (!/^1[3-9]\d{9}$/.test(phone)) return alert('请输入正确的手机号');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (data.code === 0) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        onLogin();
      } else {
        alert(data.message || '登录失败');
      }
    } catch (e) {
      alert('网络连接失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#fff', padding: '0 24px', paddingTop: 80 }}>
      <div style={{ alignItems: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 'bold', color: '#1890ff', marginBottom: 12 }}>YSBY</h1>
        <p style={{ fontSize: 14, color: '#999' }}>看视频 · 赚积分 · 兑好礼</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#333', fontWeight: '500' }}>手机号</label>
          <input style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '14px 16px', fontSize: 16, backgroundColor: '#fafafa' }} placeholder="请输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={11} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#333', fontWeight: '500' }}>密码</label>
          <input type="password" style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '14px 16px', fontSize: 16, backgroundColor: '#fafafa' }} placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button style={{ backgroundColor: '#1890ff', borderRadius: 8, padding: '16px', alignItems: 'center', marginTop: 12, border: 'none', color: '#fff', fontSize: 17, fontWeight: '600', cursor: 'pointer' }} onClick={handleLogin} disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
        <button style={{ alignItems: 'center', marginTop: 24, background: 'none', border: 'none', color: '#1890ff', fontSize: 14, fontWeight: '500', cursor: 'pointer' }} onClick={() => onNavigate('register')}>
          还没有账号？立即注册
        </button>
      </div>
    </div>
  );
}

function RegisterScreen({ onLogin, onNavigate }: { onLogin: () => void; onNavigate: (screen: string) => void }) {
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!phone || !nickname || !password) return alert('请填写所有必填项');
    if (!/^1[3-9]\d{9}$/.test(phone)) return alert('请输入正确的手机号');
    if (password.length < 6) return alert('密码至少6位');
    if (password !== confirmPassword) return alert('两次密码输入不一致');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, nickname })
      });
      const data = await res.json();
      if (data.code === 0) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        onLogin();
      } else {
        alert(data.message || '注册失败');
      }
    } catch (e) {
      alert('网络连接失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#fff', padding: '0 24px', paddingTop: 80 }}>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>注册账号</h1>
      <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>加入YSBY，开始赚积分</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#333', fontWeight: '500' }}>手机号</label>
          <input style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '14px 16px', fontSize: 16, backgroundColor: '#fafafa' }} placeholder="请输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={11} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#333', fontWeight: '500' }}>昵称</label>
          <input style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '14px 16px', fontSize: 16, backgroundColor: '#fafafa' }} placeholder="请输入昵称（2-20个字符）" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#333', fontWeight: '500' }}>密码</label>
          <input type="password" style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '14px 16px', fontSize: 16, backgroundColor: '#fafafa' }} placeholder="请输入密码（至少6位）" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#333', fontWeight: '500' }}>确认密码</label>
          <input type="password" style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '14px 16px', fontSize: 16, backgroundColor: '#fafafa' }} placeholder="请再次输入密码" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <button style={{ backgroundColor: '#1890ff', borderRadius: 8, padding: '16px', alignItems: 'center', marginTop: 12, border: 'none', color: '#fff', fontSize: 17, fontWeight: '600', cursor: 'pointer' }} onClick={handleRegister} disabled={loading}>
          {loading ? '注册中...' : '注册'}
        </button>
        <button style={{ alignItems: 'center', marginTop: 24, background: 'none', border: 'none', color: '#1890ff', fontSize: 14, fontWeight: '500', cursor: 'pointer' }} onClick={() => onNavigate('login')}>
          已有账号？立即登录
        </button>
      </div>
    </div>
  );
}

function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>欢迎回来！</h2>
      {user && <p style={{ fontSize: 16, color: '#666' }}>{user.nickname} - {user.points || 0} 积分</p>}
    </div>
  );
}

function PlaceholderScreen({ name }: { name: string }) {
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <span style={{ fontSize: 24 }}>{icons[name]} {name === 'Home' ? '首页' : name === 'Video' ? '视频' : name === 'Social' ? '社群' : name === 'Chat' ? '消息' : name === 'Shop' ? '商城' : '我的'}</span>
    </div>
  );
}

function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <span style={{ fontSize: 24 }}>👤 我的</span>
      <button style={{ marginTop: 40, padding: 16, backgroundColor: '#ff4d4f', borderRadius: 8, border: 'none', color: '#fff', fontSize: 16, fontWeight: '600', cursor: 'pointer' }} onClick={onLogout}>
        退出登录
      </button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<'loading' | 'login' | 'register' | 'main'>('loading');
  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    const token = localStorage.getItem('token');
    setScreen(token ? 'main' : 'login');
  }, []);

  const handleLogin = () => window.location.reload();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };
  const navigate = (s: string) => setScreen(s as 'login' | 'register');

  if (screen === 'loading') {
    return (
      <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <div style={{ fontSize: 24 }}>加载中...</div>
      </div>
    );
  }

  if (screen === 'login') {
    return <LoginScreen onLogin={handleLogin} onNavigate={navigate} />;
  }

  if (screen === 'register') {
    return <RegisterScreen onLogin={handleLogin} onNavigate={navigate} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff' }}>
      <div style={{ flex: 1 }}>
        {activeTab === 'Home' && <HomeScreen />}
        {activeTab === 'Video' && <PlaceholderScreen name="Video" />}
        {activeTab === 'Social' && <PlaceholderScreen name="Social" />}
        {activeTab === 'Chat' && <PlaceholderScreen name="Chat" />}
        {activeTab === 'Shop' && <PlaceholderScreen name="Shop" />}
        {activeTab === 'Profile' && <ProfileScreen onLogout={handleLogout} />}
      </div>
      <div style={{ display: 'flex', height: 60, borderTop: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
        {['Home', 'Video', 'Social', 'Chat', 'Shop', 'Profile'].map((tab) => (
          <button
            key={tab}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === tab ? '#1890ff' : '#999' }}
            onClick={() => setActiveTab(tab)}
          >
            <span style={{ fontSize: 22, opacity: activeTab === tab ? 1 : 0.5 }}>{icons[tab]}</span>
            <div style={{ fontSize: 11, marginTop: 4 }}>{tab === 'Home' ? '首页' : tab === 'Video' ? '视频' : tab === 'Social' ? '社群' : tab === 'Chat' ? '消息' : tab === 'Shop' ? '商城' : '我的'}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
