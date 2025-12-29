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
import { UserPlus, Lock, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { scale, verticalScale, fontScale } from '@/lib/responsive';
export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [scaleAnim] = useState(new Animated.Value(1));
  const router = useRouter();
  const { register, isLoading } = useWallet();
  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }
    if (pin.length !== 6) {
      Alert.alert('Error', 'PIN must be 6 digits');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }
    try {
      await register(username.trim(), pin);
      router.replace('/dashboard');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      Alert.alert('Registration Failed', message);
    }
  };
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  const isPinValid = pin.length === 6;
  const isPinMatch = pin === confirmPin && confirmPin.length === 6;
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <UserPlus size={scale(48)} color="#10b981" strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join SecureWallet</Text>
            </View>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username"
                  placeholderTextColor="#666"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Create PIN</Text>
                <View style={styles.pinInputContainer}>
                  <Lock size={scale(20)} color="#666" />
                  <TextInput
                    style={styles.pinInput}
                    placeholder="6-digit PIN"
                    placeholderTextColor="#666"
                    value={pin}
                    onChangeText={(text) =>
                      setPin(text.replace(/[^0-9]/g, '').slice(0, 6))
                    }
                    keyboardType="number-pad"
                    secureTextEntry
                  />
                  {isPinValid && <Check size={scale(20)} color="#10b981" />}
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm PIN</Text>
                <View style={styles.pinInputContainer}>
                  <Lock size={scale(20)} color="#666" />
                  <TextInput
                    style={styles.pinInput}
                    placeholder="Re-enter PIN"
                    placeholderTextColor="#666"
                    value={confirmPin}
                    onChangeText={(text) =>
                      setConfirmPin(text.replace(/[^0-9]/g, '').slice(0, 6))
                    }
                    keyboardType="number-pad"
                    secureTextEntry
                  />
                  {isPinMatch && <Check size={scale(20)} color="#10b981" />}
                </View>
              </View>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#34d399', '#10b981', '#059669']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Creating...' : 'Register'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>
                  Already have an account?{' '}
                  <Text style={styles.linkTextBold}>Login</Text>
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
    backgroundColor: 'rgba(16,185,129,0.1)',
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
  buttonDisabled: {
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
    color: '#10b981',
    fontWeight: '700',
  },
});