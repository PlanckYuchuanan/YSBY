import React, { useState, useEffect } from 'react';

// API 地址策略：
// - 本地开发模式 (vite dev) → http://localhost:4000
// - 生产模式 (vite build) → /api (nginx 代理到 gateway:4000)
const API_BASE = (() => {
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }
  return '/api';
})();

const icons: Record<string, string> = {
  Video: '🎬', Health: '💊', Message: '💬', Profile: '👤'
};

// 用户信息类型
interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'secret';
  birthday?: string;
  location?: string;
  location_code?: string;
  points?: number;
}

// 登录页
function LoginScreen({ onLogin, onNavigate }: { onLogin: () => void; onNavigate: (screen: string) => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) return alert('请填写手机号和密码');
    if (!/^1[3-9]\d{9}$/.test(phone)) return alert('请输入正确的手机号');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/login`, {
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
        <h1 style={{ fontSize: 40, fontWeight: 'bold', color: '#06b6a8', marginBottom: 12 }}>益寿巴渝</h1>
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
        <button style={{ backgroundColor: '#06b6a8', borderRadius: 8, padding: '16px', alignItems: 'center', marginTop: 12, border: 'none', color: '#fff', fontSize: 17, fontWeight: '600', cursor: 'pointer' }} onClick={handleLogin} disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
        <button style={{ alignItems: 'center', marginTop: 24, background: 'none', border: 'none', color: '#06b6a8', fontSize: 14, fontWeight: '500', cursor: 'pointer' }} onClick={() => onNavigate('register')}>
          还没有账号？立即注册
        </button>
      </div>
    </div>
  );
}

// 注册页
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
      const res = await fetch(`${API_BASE}/api/user/register`, {
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
      <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>加入益寿巴渝，开始赚积分</p>
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
        <button style={{ backgroundColor: '#06b6a8', borderRadius: 8, padding: '16px', alignItems: 'center', marginTop: 12, border: 'none', color: '#fff', fontSize: 17, fontWeight: '600', cursor: 'pointer' }} onClick={handleRegister} disabled={loading}>
          {loading ? '注册中...' : '注册'}
        </button>
        <button style={{ alignItems: 'center', marginTop: 24, background: 'none', border: 'none', color: '#06b6a8', fontSize: 14, fontWeight: '500', cursor: 'pointer' }} onClick={() => onNavigate('login')}>
          已有账号？立即登录
        </button>
      </div>
    </div>
  );
}

// 占位页面
function PlaceholderScreen({ name }: { name: string }) {
  const labels: Record<string, string> = {
    Video: '视频', Health: '健康', Message: '消息', Profile: '我的'
  };
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <span style={{ fontSize: 24 }}>{icons[name]} {labels[name] || name}</span>
    </div>
  );
}

// 健康页面
function HealthScreen() {
  const items = [
    {
      icon: '🏥',
      label: '健康社区',
      desc: '分享健康心得，交流养生经验',
      gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
    },
    {
      icon: '📊',
      label: '健康账户',
      desc: '记录健康数据，管理个人档案',
      gradient: 'linear-gradient(135deg, #06b6a8 0%, #059669 100%)',
    },
    {
      icon: '👨‍👩‍👧‍👦',
      label: '健康社群',
      desc: '加入健康小组，共同健康管理',
      gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
    },
    {
      icon: '🎉',
      label: '健康活动',
      desc: '参与健康活动，赢取健康积分',
      gradient: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
    },
  ];

  return (
    <div style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      {/* 顶部标题栏 */}
      <div style={{
        background: 'linear-gradient(135deg, #52b788 0%, #40916c 50%, #2d6a4f 100%)',
        padding: '32px 20px 80px',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 6 }}>健康中心</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>科学养生 · 健康生活</div>
        </div>

        {/* 健康数据概览卡片 */}
        <div style={{
          position: 'absolute',
          bottom: -56,
          left: 20,
          right: 20,
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: '20px 16px',
          display: 'flex',
          justifyContent: 'space-around',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          {[
            { val: '8,432', unit: '步', label: '今日步数', color: '#52b788' },
            { val: '1.8', unit: 'L', label: '饮水量', color: '#06b6a8' },
            { val: '7.5', unit: 'h', label: '睡眠时长', color: '#722ed1' },
            { val: '36.8', unit: '℃', label: '体温', color: '#fa541c' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: stat.color }}>
                {stat.val}<span style={{ fontSize: 11, fontWeight: 'normal' }}>{stat.unit}</span>
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 功能入口 */}
      <div style={{ marginTop: 80, padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.label}
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: '20px 16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: item.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                marginBottom: 12,
              }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: '#999', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 健康提示卡片 */}
        <div style={{
          marginTop: 16,
          background: 'linear-gradient(135deg, #e8f8f2 0%, #d0f0e6 100%)',
          borderRadius: 16,
          padding: '20px',
          border: '1px solid #b7eb8f',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <span style={{ fontSize: 14, fontWeight: '600', color: '#389e0d' }}>今日健康建议</span>
          </div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.8, paddingLeft: 30 }}>
            早起喝一杯温水，促进肠道蠕动；<br />
            午餐后散步15分钟，助消化；<br />
            睡前避免使用电子产品，保证睡眠质量。
          </div>
        </div>
      </div>
    </div>
  );
}

// 地区数据类型
interface Area {
  id: string;
  name: string;
  level: number;
  parent_id: string | null;
}

// 个人资料详情页
function ProfileDetailScreen({ user, onBack, onUpdate }: { user: User; onBack: () => void; onUpdate: (u: User) => void }) {
  const [form, setForm] = useState<User>({ ...user });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  // 地区选择器状态
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [provinces, setProvinces] = useState<Area[]>([]);
  const [cities, setCities] = useState<Area[]>([]);
  const [districts, setDistricts] = useState<Area[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [areaStep, setAreaStep] = useState<1 | 2 | 3>(1);

  // 加载省份列表
  const loadProvinces = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/areas?level=1`);
      const data = await res.json();
      if (data.code === 0) setProvinces(data.data);
    } catch (e) { console.error(e); }
  };

  // 加载城市列表
  const loadCities = async (parentId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/user/areas?parent_id=${parentId}`);
      const data = await res.json();
      if (data.code === 0) setCities(data.data);
    } catch (e) { console.error(e); }
  };

  // 加载区县列表
  const loadDistricts = async (parentId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/user/areas?parent_id=${parentId}`);
      const data = await res.json();
      if (data.code === 0) setDistricts(data.data);
    } catch (e) { console.error(e); }
  };

  // 打开地区选择器
  const handleOpenAreaPicker = async () => {
    setShowAreaPicker(true);
    setAreaStep(1);
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedDistrict('');
    setCities([]);
    setDistricts([]);
    await loadProvinces();
  };

  // 选择省份
  const handleSelectProvince = async (id: string, name: string) => {
    setSelectedProvince(id);
    setSelectedCity('');
    setSelectedDistrict('');
    setCities([]);
    setDistricts([]);
    await loadCities(id);
    setAreaStep(2);
  };

  // 选择城市
  const handleSelectCity = async (id: string, name: string) => {
    setSelectedCity(id);
    setSelectedDistrict('');
    setDistricts([]);
    await loadDistricts(id);
    setAreaStep(3);
  };

  // 选择区县
  const handleSelectDistrict = (id: string, name: string) => {
    setSelectedDistrict(id);
    const provinceName = provinces.find(p => p.id === selectedProvince)?.name || '';
    const cityName = cities.find(c => c.id === selectedCity)?.name || '';
    setForm({ ...form, location: `${provinceName} ${cityName} ${name}`, location_code: id });
    setShowAreaPicker(false);
    setEditing(null);
  };

  // 返回上一步
  const handleBackArea = () => {
    if (areaStep === 3) {
      setAreaStep(2);
    } else if (areaStep === 2) {
      setAreaStep(1);
    } else {
      setShowAreaPicker(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/user/me/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.code === 0) {
        localStorage.setItem('user', JSON.stringify(data.data));
        onUpdate(data.data);
        alert('保存成功');
        setEditing(null);
      } else {
        alert(data.message || '保存失败');
      }
    } catch (e) {
      alert('网络错误');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = () => {
    // 模拟头像上传
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nickname)}&background=${randomColor.slice(1)}&color=fff&size=128`;
    setForm({ ...form, avatar: newAvatar });
    setEditing(null);
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* 顶部导航栏 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: '#06b6a8', cursor: 'pointer', padding: 0 }}>
          ← 返回
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: '#333' }}>编辑资料</div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: 'none', border: 'none', fontSize: 16, color: '#06b6a8', fontWeight: '600', cursor: 'pointer' }}
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div style={{ padding: 20 }}>
        {/* 头像 */}
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nickname)}&background=06b6a8&color=fff&size=128`}
              alt="头像"
              style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f0f0f0' }}
            />
            <button
              onClick={handleAvatarChange}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', backgroundColor: '#06b6a8', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}
            >
              ✎
            </button>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: '#999' }}>点击更换头像</p>
        </div>

        {/* 信息列表 */}
        <div style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
          {/* 昵称 */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ width: 80, fontSize: 15, color: '#666' }}>昵称</div>
            <div style={{ flex: 1 }}>
              {editing === 'nickname' ? (
                <input
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  onBlur={() => setEditing(null)}
                  autoFocus
                  style={{ width: '100%', border: '1px solid #06b6a8', borderRadius: 6, padding: '8px 12px', fontSize: 15 }}
                />
              ) : (
                <div style={{ fontSize: 15, color: '#333' }}>{form.nickname || '未设置'}</div>
              )}
            </div>
            <button onClick={() => setEditing('nickname')} style={{ background: 'none', border: 'none', color: '#06b6a8', cursor: 'pointer', fontSize: 14 }}>编辑</button>
          </div>

          {/* 性别 */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ width: 80, fontSize: 15, color: '#666' }}>性别</div>
            <div style={{ flex: 1, display: 'flex', gap: 12 }}>
              {['male', 'female', 'secret'].map((g) => (
                <button
                  key={g}
                  onClick={() => setForm({ ...form, gender: g as any })}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 20,
                    border: form.gender === g ? '1px solid #06b6a8' : '1px solid #e0e0e0',
                    backgroundColor: form.gender === g ? '#e0f7f5' : '#fafafa',
                    color: form.gender === g ? '#06b6a8' : '#666',
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  {g === 'male' ? '♂ 男' : g === 'female' ? '♀ 女' : '保密'}
                </button>
              ))}
            </div>
          </div>

          {/* 生日 */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ width: 80, fontSize: 15, color: '#666' }}>生日</div>
            <div style={{ flex: 1 }}>
              {editing === 'birthday' ? (
                <input
                  type="date"
                  value={form.birthday || ''}
                  onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                  onBlur={() => setEditing(null)}
                  style={{ width: '100%', border: '1px solid #06b6a8', borderRadius: 6, padding: '8px 12px', fontSize: 15 }}
                />
              ) : (
                <div style={{ fontSize: 15, color: '#333' }}>{form.birthday || '未设置'}</div>
              )}
            </div>
            <button onClick={() => setEditing('birthday')} style={{ background: 'none', border: 'none', color: '#06b6a8', cursor: 'pointer', fontSize: 14 }}>编辑</button>
          </div>

          {/* 所在地 */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ width: 80, fontSize: 15, color: '#666' }}>所在地</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: '#333' }}>{form.location || '未设置'}</div>
            </div>
            <button onClick={handleOpenAreaPicker} style={{ background: 'none', border: 'none', color: '#06b6a8', cursor: 'pointer', fontSize: 14 }}>选择</button>
          </div>

          {/* 手机号（不可编辑） */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px' }}>
            <div style={{ width: 80, fontSize: 15, color: '#666' }}>手机号</div>
            <div style={{ flex: 1, fontSize: 15, color: '#999' }}>{form.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</div>
          </div>
        </div>
      </div>

      {/* 地区选择器弹窗 */}
      {showAreaPicker && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end'
        }} onClick={() => setShowAreaPicker(false)}>
          <div style={{
            width: '100%', maxHeight: '70vh', backgroundColor: '#fff', borderRadius: '16px 16px 0 0',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            {/* 标题栏 */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
              <button onClick={handleBackArea} style={{ background: 'none', border: 'none', fontSize: 16, color: '#06b6a8', cursor: 'pointer' }}>← 返回</button>
              <div style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: '#333' }}>
                {areaStep === 1 ? '选择省份' : areaStep === 2 ? '选择城市' : '选择区县'}
              </div>
              <button onClick={() => setShowAreaPicker(false)} style={{ background: 'none', border: 'none', fontSize: 16, color: '#999', cursor: 'pointer' }}>✕</button>
            </div>
            {/* 选项列表 */}
            <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '8px 0' }}>
              {areaStep === 1 && provinces.map((p) => (
                <div key={p.id} onClick={() => handleSelectProvince(p.id, p.name)}
                  style={{ padding: '14px 20px', fontSize: 15, cursor: 'pointer', borderBottom: '1px solid #f5f5f5', color: '#333' }}>
                  {p.name}
                </div>
              ))}
              {areaStep === 2 && cities.map((c) => (
                <div key={c.id} onClick={() => handleSelectCity(c.id, c.name)}
                  style={{ padding: '14px 20px', fontSize: 15, cursor: 'pointer', borderBottom: '1px solid #f5f5f5', color: '#333' }}>
                  {c.name}
                </div>
              ))}
              {areaStep === 3 && districts.map((d) => (
                <div key={d.id} onClick={() => handleSelectDistrict(d.id, d.name)}
                  style={{ padding: '14px 20px', fontSize: 15, cursor: 'pointer', borderBottom: '1px solid #f5f5f5', color: '#333' }}>
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 我的页面
function ProfileScreen({ onLogout, onOpenDetail }: { onLogout: () => void; onOpenDetail: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) {
        setUser(JSON.parse(u));
      }
    } catch (e) {
      console.error('Failed to parse user:', e);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <div style={{ fontSize: 16, color: '#999' }}>加载中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <div style={{ fontSize: 16, color: '#999' }}>未登录</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* 顶部个人信息卡片 */}
      <div style={{ background: 'linear-gradient(135deg, #06b6a8 0%, #059669 100%)', padding: '32px 20px 48px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname)}&background=fff&color=06b6a8&size=128`}
            alt="头像"
            style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.5)', objectFit: 'cover', cursor: 'pointer' }}
            onClick={onOpenDetail}
          />
          <div style={{ flex: 1, color: '#fff' }}>
            <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>{user.nickname}</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>ID: {user.id?.slice(0, 8)}</div>
          </div>
          <button
            onClick={onOpenDetail}
            style={{ padding: '8px 16px', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontSize: 13, cursor: 'pointer' }}
          >
            编辑资料
          </button>
        </div>

        {/* 积分展示 */}
        <div style={{ position: 'absolute', bottom: -24, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-around', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#06b6a8' }}>{user.points || 0}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>我的积分</div>
          </div>
          <div style={{ width: 1, backgroundColor: '#eee' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#06b6a8' }}>0</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>我的收藏</div>
          </div>
          <div style={{ width: 1, backgroundColor: '#eee' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#06b6a8' }}>0</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>观看历史</div>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div style={{ marginTop: 48, padding: '0 20px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
          {[
            { icon: '🎯', label: '积分任务', desc: '每日签到、视频任务', color: '#06b6a8' },
            { icon: '📋', label: '我的订单', desc: '查看订单物流', color: '#06b6a8' },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: 'flex', alignItems: 'center', padding: '16px',
                borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#333' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{item.desc}</div>
              </div>
              <div style={{ color: '#ccc', fontSize: 14 }}>›</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: 12, marginTop: 16, overflow: 'hidden' }}>
          {[
            { icon: '⚙️', label: '设置', color: '#666' },
            { icon: '📖', label: '关于我们', color: '#666' },
            { icon: '❓', label: '帮助与反馈', color: '#666' },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: 'flex', alignItems: 'center', padding: '16px 20px',
                borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 20, marginRight: 12 }}>{item.icon}</span>
              <div style={{ flex: 1, fontSize: 15, color: '#333' }}>{item.label}</div>
              <div style={{ color: '#ccc', fontSize: 14 }}>›</div>
            </div>
          ))}
        </div>

        {/* 退出登录 */}
        <button
          onClick={onLogout}
          style={{
            width: '100%', marginTop: 24, padding: '14px', borderRadius: 12,
            backgroundColor: '#fff', border: 'none', color: '#ff4d4f',
            fontSize: 16, fontWeight: '500', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          退出登录
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<'loading' | 'login' | 'register' | 'main' | 'profileDetail'>('loading');
  const [activeTab, setActiveTab] = useState('Video');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    setScreen(token ? 'main' : 'login');
  }, []);

  const handleLogin = () => window.location.reload();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };
  const navigate = (s: string) => setScreen(s as 'login' | 'register');
  const handleOpenDetail = () => setScreen('profileDetail');
  const handleBackFromDetail = () => setScreen('main');
  const handleUserUpdate = (u: User) => setUser(u);

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
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 60 }}>
        {activeTab === 'Video' && <PlaceholderScreen name="Video" />}
        {activeTab === 'Health' && <HealthScreen />}
        {activeTab === 'Message' && <PlaceholderScreen name="Message" />}
        {activeTab === 'Profile' && screen === 'profileDetail' ? (
          <ProfileDetailScreen user={user!} onBack={handleBackFromDetail} onUpdate={handleUserUpdate} />
        ) : activeTab === 'Profile' ? (
          <ProfileScreen onLogout={handleLogout} onOpenDetail={handleOpenDetail} />
        ) : null}
      </div>
      {screen === 'main' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          height: 60,
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#fff',
          zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {['Video', 'Health', 'Message', 'Profile'].map((tab) => (
            <button
              key={tab}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === tab ? '#06b6a8' : '#999' }}
              onClick={() => setActiveTab(tab)}
            >
              <span style={{ fontSize: 22, opacity: activeTab === tab ? 1 : 0.5 }}>{icons[tab]}</span>
              <div style={{ fontSize: 11, marginTop: 4 }}>{tab === 'Video' ? '视频' : tab === 'Health' ? '健康' : tab === 'Message' ? '消息' : '我的'}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
