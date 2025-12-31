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
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/context/WalletContext';
import { Wallet, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { scale, verticalScale, fontScale } from '@/lib/responsive';
export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const scaleAnim = useState(new Animated.Value(1))[0];
  const router = useRouter();
  const { login, isLoading } = useWallet();
  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }
    if (pin.length !== 6) {
      Alert.alert('Error', 'PIN must be 6 digits');
      return;
    }
    try {
      await login(username.trim(), pin);
      router.replace('/dashboard');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid credentials';
      Alert.alert('Login Failed', message);
    }
  };
  const pressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  const pressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Wallet size={scale(48)} color="#4f46e5" strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>SecureWallet</Text>
              <Text style={styles.subtitle}>Your Digital Vault</Text>
            </View>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  placeholderTextColor="#666"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>PIN</Text>
                <View style={styles.pinInputContainer}>
                  <Lock size={scale(20)} color="#666" />
                  <TextInput
                    style={styles.pinInput}
                    placeholder="6-digit PIN"
                    placeholderTextColor="#666"
                    value={pin}
                    onChangeText={(t) =>
                      setPin(t.replace(/[^0-9]/g, '').slice(0, 6))
                    }
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={6}
                    returnKeyType="done"
                  />
                </View>
              </View>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.disabled]}
                  onPress={handleLogin}
                  onPressIn={pressIn}
                  onPressOut={pressOut}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#6366f1', '#4f46e5', '#4338ca']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity
                onPress={() => router.push('/auth/register')}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>
                  Don&apos;t have an account?{' '}
                  <Text style={styles.linkTextBold}>Register</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(24),
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(48),
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: 'rgba(79,70,229,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: fontScale(32),
    fontWeight: '800',
    color: '#fff',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: fontScale(16),
    color: '#9ca3af',
    fontWeight: '500',
  },
  form: {
    gap: verticalScale(20),
  },
  inputContainer: {
    gap: verticalScale(8),
  },
  label: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#e5e7eb',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: scale(12),
    padding: scale(16),
    fontSize: fontScale(16),
    color: '#fff',
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    gap: scale(12),
  },
  pinInput: {
    flex: 1,
    paddingVertical: scale(16),
    fontSize: fontScale(16),
    color: '#fff',
  },
  button: {
    borderRadius: scale(12),
    overflow: 'hidden',
    marginTop: verticalScale(12),
  },
  disabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: verticalScale(18),
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: fontScale(18),
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },
  linkText: {
    color: '#9ca3af',
    fontSize: fontScale(14),
  },
  linkTextBold: {
    color: '#6366f1',
    fontWeight: '700',
  },
});