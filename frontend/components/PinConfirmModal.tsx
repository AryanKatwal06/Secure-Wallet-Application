import React, { useRef, useState } from 'react';
import {
 View,
 Text,
 StyleSheet,
 Modal,
 TouchableOpacity,
 Animated,
 TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Lock } from 'lucide-react-native';
import { useWallet } from '@/context/WalletContext';
import { walletApi } from '@/lib/api';
interface Props {
 visible: boolean;
 onClose: () => void;
 onSuccess: () => Promise<void>;
}
export default function PinConfirmModal({
 visible,
 onClose,
 onSuccess,
}: Props) {
 const { token } = useWallet();
 const [pin, setPin] = useState('');
 const [loading, setLoading] = useState(false);
 const shakeAnim = useRef(new Animated.Value(0)).current;
 const shake = () => {
 Animated.sequence([
 Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
 Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
 Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
 ]).start();
 };
 const verify = async () => {
 if (pin.length !== 6 || loading) return;
 setLoading(true);
 await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
 try {
 await walletApi.verifyPin(token!, pin);
 await Haptics.notificationAsync(
 Haptics.NotificationFeedbackType.Success
 );
 setPin('');
 onClose();
 await onSuccess();
 } catch {
 await Haptics.notificationAsync(
 Haptics.NotificationFeedbackType.Error
 );
 shake();
 setPin('');
 } finally {
 setLoading(false);
 }
 };
 return (
 <Modal visible={visible} transparent animationType="slide">
 <View style={styles.overlay}>
 <Animated.View
 style={[
 styles.sheet,
 { transform: [{ translateX: shakeAnim }] },
 ]}
 >
 <LinearGradient
 colors={['#020617', '#020617']}
 style={styles.content}
 >
 <View style={styles.icon}>
 <Lock size={28} color="#6366f1" />
 </View>
 <Text style={styles.title}>Confirm PIN</Text>
 <Text style={styles.subtitle}>
 Enter your 6-digit PIN to continue
 </Text>
 <TextInput
 value={pin}
 onChangeText={(t) => setPin(t.replace(/[^0-9]/g, '').slice(0, 6))}
 keyboardType="number-pad"
 secureTextEntry
 style={styles.pinInput}
 />
 <TouchableOpacity
 disabled={pin.length !== 6 || loading}
 onPress={verify}
 style={[
 styles.button,
 pin.length !== 6 && styles.disabled,
 ]}
 >
 <Text style={styles.buttonText}>
 {loading ? 'Verifying...' : 'Confirm'}
 </Text>
 </TouchableOpacity>
 <TouchableOpacity onPress={onClose}>
 <Text style={styles.cancel}>Cancel</Text>
 </TouchableOpacity>
 </LinearGradient>
 </Animated.View>
 </View>
 </Modal>
 );
}
const styles = StyleSheet.create({
 overlay: {
 flex: 1,
 justifyContent: 'flex-end',
 backgroundColor: 'rgba(0,0,0,0.5)',
 },
 sheet: {
 borderTopLeftRadius: 24,
 borderTopRightRadius: 24,
 overflow: 'hidden',
 },
 content: {
 padding: 24,
 },
 icon: {
 alignSelf: 'center',
 width: 56,
 height: 56,
 borderRadius: 28,
 backgroundColor: 'rgba(99,102,241,0.15)',
 justifyContent: 'center',
 alignItems: 'center',
 marginBottom: 16,
 },
 title: {
 fontSize: 22,
 fontWeight: '800',
 color: '#fff',
 textAlign: 'center',
 },
 subtitle: {
 color: '#94a3b8',
 textAlign: 'center',
 marginBottom: 20,
 },
 pinInput: {
 backgroundColor: 'rgba(255,255,255,0.05)',
 borderRadius: 14,
 padding: 16,
 fontSize: 20,
 textAlign: 'center',
 color: '#fff',
 letterSpacing: 8,
 marginBottom: 20,
 },
 button: {
 backgroundColor: '#6366f1',
 paddingVertical: 14,
 borderRadius: 14,
 alignItems: 'center',
 },
 disabled: {
 opacity: 0.5,
 },
 buttonText: {
 color: '#fff',
 fontWeight: '700',
 fontSize: 16,
 },
 cancel: {
 textAlign: 'center',
 marginTop: 16,
 color: '#94a3b8',
 },
});