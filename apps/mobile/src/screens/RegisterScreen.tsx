import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { userApi } from '../services/api';
import { useAuthStore } from '../store/auth';
import { RootStackParamList } from '../navigation/AppNavigator';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { setToken } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone) {
      Alert.alert('错误', '请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Alert.alert('错误', '请输入正确的手机号');
      return;
    }

    setSendingCode(true);
    try {
      const response = await userApi.sendCode(phone);
      Alert.alert('提示', response.message || '验证码已发送');
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Send code error:', err);
      Alert.alert('错误', '发送失败，请稍后重试');
    } finally {
      setSendingCode(false);
    }
  };

  // 注册
  const handleRegister = async () => {
    // 验证表单
    if (!phone || !password || !nickname) {
      Alert.alert('错误', '请填写所有必填项');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Alert.alert('错误', '请输入正确的手机号');
      return;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码至少6位');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('错误', '两次密码输入不一致');
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      Alert.alert('错误', '昵称长度应为2-20个字符');
      return;
    }

    setLoading(true);
    try {
      const response = await userApi.register({
        phone,
        password,
        nickname,
        code: code || undefined, // 开发模式可以跳过验证码
      });

      if (response.code === 0) {
        // 注册成功，保存 token 和用户信息
        await setToken(response.data.token, response.data.user);
      } else {
        Alert.alert('注册失败', response.message);
      }
    } catch (err: any) {
      console.error('Register error:', err);
      Alert.alert('错误', '网络连接失败，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>注册账号</Text>
            <Text style={styles.subtitle}>加入YSBY，开始赚积分</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>手机号</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入手机号"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>验证码</Text>
              <View style={styles.codeRow}>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="请输入验证码"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={[styles.codeButton, countdown > 0 && styles.codeButtonDisabled]}
                  onPress={handleSendCode}
                  disabled={sendingCode || countdown > 0}
                >
                  {sendingCode ? (
                    <ActivityIndicator size="small" color="#1890ff" />
                  ) : (
                    <Text style={styles.codeButtonText}>
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>昵称</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入昵称（2-20个字符）"
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入密码（至少6位）"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>确认密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>注册</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>已有账号？</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>立即登录</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  form: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  codeInput: {
    flex: 1,
  },
  codeButton: {
    width: 120,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  codeButtonText: {
    color: '#1890ff',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#1890ff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#a0d2ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    fontSize: 14,
    color: '#1890ff',
    fontWeight: '500',
  },
});
