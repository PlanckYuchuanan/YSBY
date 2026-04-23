import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';

const API_BASE = 'http://localhost:4001';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icons: Record<string, string> = {
  Home: '🏠', Video: '🎬', Social: '📝', Chat: '💬', Shop: '🛒', Profile: '👤'
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name]}</Text>;
}

function LoginScreen({ navigation }: any) {
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
        window.location.reload();
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>YSBY</Text>
        <Text style={styles.slogan}>看视频 · 赚积分 · 兑好礼</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>手机号</Text>
        <TextInput style={styles.input} placeholder="请输入手机号" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={11} />
        <Text style={styles.label}>密码</Text>
        <TextInput style={styles.input} placeholder="请输入密码" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '登录中...' : '登录'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>还没有账号？立即注册</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RegisterScreen({ navigation }: any) {
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
        window.location.reload();
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
    <View style={styles.container}>
      <Text style={styles.title}>注册账号</Text>
      <Text style={styles.subtitle}>加入YSBY，开始赚积分</Text>
      <View style={styles.form}>
        <Text style={styles.label}>手机号</Text>
        <TextInput style={styles.input} placeholder="请输入手机号" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={11} />
        <Text style={styles.label}>昵称</Text>
        <TextInput style={styles.input} placeholder="请输入昵称（2-20个字符）" value={nickname} onChangeText={setNickname} maxLength={20} />
        <Text style={styles.label}>密码</Text>
        <TextInput style={styles.input} placeholder="请输入密码（至少6位）" value={password} onChangeText={setPassword} secureTextEntry />
        <Text style={styles.label}>确认密码</Text>
        <TextInput style={styles.input} placeholder="请再次输入密码" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '注册中...' : '注册'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>已有账号？立即登录</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);
  return (
    <View style={styles.screen}>
      <Text style={styles.welcome}>欢迎回来！</Text>
      {user && <Text style={styles.userInfo}>{user.nickname} - {user.points || 0} 积分</Text>}
    </View>
  );
}

function VideoScreen() { return <View style={styles.screen}><Text style={styles.placeholder}>🎬 视频流</Text></View>; }
function SocialScreen() { return <View style={styles.screen}><Text style={styles.placeholder}>📝 社群</Text></View>; }
function ChatScreen() { return <View style={styles.screen}><Text style={styles.placeholder}>💬 消息</Text></View>; }
function ShopScreen() { return <View style={styles.screen}><Text style={styles.placeholder}>🛒 商城</Text></View>; }
function ProfileScreen() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };
  return (
    <View style={styles.screen}>
      <Text style={styles.placeholder}>👤 个人中心</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  );
}

function AuthStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>;
}

function MainTabs() {
  return <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
    tabBarActiveTintColor: '#1890ff',
    tabBarInactiveTintColor: '#999',
    tabBarStyle: { height: 60, paddingBottom: 6 },
    tabBarLabelStyle: { fontSize: 11 }
  })}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
    <Tab.Screen name="Video" component={VideoScreen} options={{ title: '视频' }} />
    <Tab.Screen name="Social" component={SocialScreen} options={{ title: '社群' }} />
    <Tab.Screen name="Chat" component={ChatScreen} options={{ title: '消息' }} />
    <Tab.Screen name="Shop" component={ShopScreen} options={{ title: '商城' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '我的' }} />
  </Tab.Navigator>;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#1890ff" /><Text style={styles.loadingText}>加载中...</Text></View>;
  }

  return <NavigationContainer><Stack.Navigator screenOptions={{ headerShown: false }}>
    {isAuthenticated ? <Stack.Screen name="Main" component={MainTabs} /> : <Stack.Screen name="Auth" component={AuthStack} />}
  </Stack.Navigator></NavigationContainer>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#1890ff', marginBottom: 12 },
  slogan: { fontSize: 14, color: '#999' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 32 },
  form: { gap: 16 },
  label: { fontSize: 14, color: '#333', fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#1890ff', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  linkBtn: { alignItems: 'center', marginTop: 24 },
  linkText: { fontSize: 14, color: '#1890ff', fontWeight: '500' },
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  placeholder: { fontSize: 24 },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  userInfo: { fontSize: 16, color: '#666' },
  logoutBtn: { marginTop: 40, padding: 16, backgroundColor: '#ff4d4f', borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#999' }
});
