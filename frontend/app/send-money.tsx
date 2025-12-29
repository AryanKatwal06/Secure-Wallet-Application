import React, { useMemo, useRef, useState } from 'react';
import {
 View,
 Text,
 TextInput,
 TouchableOpacity,
 StyleSheet,
 Animated,
 KeyboardAvoidingView,
 Platform,
 ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/context/WalletContext';
import { Send, User, IndianRupee } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import PinConfirmModal from '@/components/PinConfirmModal';
import TransactionSuccess from '@/components/TransactionSuccess';
import { scale, verticalScale, fontScale } from '@/lib/responsive';
export default function SendMoneyScreen() {
 const router = useRouter();
 const { transfer, user } = useWallet();
 const [username, setUsername] = useState('');
 const [amount, setAmount] = useState('');
 const [loading, setLoading] = useState(false);
 const [pinVisible, setPinVisible] = useState(false);
 const [showSuccess, setShowSuccess] = useState(false);
 const scaleAnim = useRef(new Animated.Value(1)).current;
 const walletBalance = user?.walletBalance ?? 0;
 const numericAmount = Number(amount);
 const isValid = useMemo(() => {
 return (
 username.trim().length > 0 &&
 numericAmount > 0 &&
 numericAmount <= walletBalance &&
 username.trim() !== user?.username
 );
 }, [username, numericAmount, walletBalance, user?.username]);
 const pressIn = () =>
 Animated.spring(scaleAnim, {
 toValue: 0.96,
 useNativeDriver: true,
 }).start();
 const pressOut = () =>
 Animated.spring(scaleAnim, {
 toValue: 1,
 friction: 4,
 useNativeDriver: true,
 }).start();
 const executeTransfer = async () => {
 setPinVisible(false);
 setLoading(true);
 await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
 try {
 await transfer(username.trim(), numericAmount);
 await Haptics.notificationAsync(
 Haptics.NotificationFeedbackType.Success
 );
 setShowSuccess(true);
 setTimeout(() => {
 setShowSuccess(false);
 router.back();
 }, 1500);
 } catch {
 await Haptics.notificationAsync(
 Haptics.NotificationFeedbackType.Error
 );
 } finally {
 setLoading(false);
 }
 };
 return (
 <SafeAreaView style={styles.safe}>
 <StatusBar style="light" />
 <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
 <KeyboardAvoidingView
 style={{ flex: 1 }}
 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
 keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
 >
 <ScrollView
 contentContainerStyle={styles.content}
 keyboardShouldPersistTaps="handled"
 showsVerticalScrollIndicator={false}
 >
 <View style={styles.iconContainer}>
 <Send size={scale(60)} color="#3b82f6" />
 </View>
 <Text style={styles.title}>Send Money</Text>
 <Text style={styles.subtitle}>
 Wallet Balance: ₹{walletBalance.toFixed(2)}
 </Text>
 <View style={styles.card}>
 <View style={styles.inputWrapper}>
 <User size={scale(20)} color="#64748b" />
 <TextInput
 value={username}
 onChangeText={setUsername}
 placeholder="Recipient username"
 placeholderTextColor="#475569"
 autoCapitalize="none"
 style={styles.input}
 returnKeyType="next"
 />
 </View>
 <View style={styles.inputWrapper}>
 <IndianRupee size={scale(20)} color="#64748b" />
 <TextInput
 value={amount}
 onChangeText={(t) =>
 setAmount(t.replace(/[^0-9]/g, ''))
 }
 placeholder="Amount"
 placeholderTextColor="#475569"
 keyboardType="number-pad"
 style={styles.input}
 />
 </View>
 {username === user?.username && (
 <Text style={styles.error}>
 You cannot send money to yourself
 </Text>
 )}
 </View>
 <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
 <TouchableOpacity
 disabled={!isValid || loading}
 onPress={() => setPinVisible(true)}
 onPressIn={pressIn}
 onPressOut={pressOut}
 activeOpacity={0.9}
 style={[
 styles.button,
 (!isValid || loading) && styles.disabled,
 ]}
 >
 <LinearGradient
 colors={['#3b82f6', '#2563eb']}
 style={styles.buttonGradient}
 >
 <Text style={styles.buttonText}>
 {loading ? 'Sending...' : 'Send Money'}
 </Text>
 </LinearGradient>
 </TouchableOpacity>
 </Animated.View>
 </ScrollView>
 </KeyboardAvoidingView>
 <PinConfirmModal
 visible={pinVisible}
 onClose={() => setPinVisible(false)}
 onSuccess={executeTransfer}
 />
 {showSuccess && (
 <TransactionSuccess
 message={`₹${numericAmount.toFixed(2)} sent to @${username}`}
 />
 )}
 </LinearGradient>
 </SafeAreaView>
 );
}
const styles = StyleSheet.create({
 safe: {
 flex: 1,
 backgroundColor: '#0f172a',
 },
 container: {
 flex: 1,
 },
 content: {
 flexGrow: 1,
 justifyContent: 'center',
 paddingHorizontal: scale(24),
 maxWidth: 520,
 width: '100%',
 alignSelf: 'center',
 },
 iconContainer: {
 width: scale(120),
 height: scale(120),
 borderRadius: scale(60),
 alignSelf: 'center',
 backgroundColor: 'rgba(59,130,246,0.12)',
 justifyContent: 'center',
 alignItems: 'center',
 marginBottom: verticalScale(20),
 },
 title: {
 fontSize: fontScale(32),
 fontWeight: '800',
 color: '#fff',
 textAlign: 'center',
 },
 subtitle: {
 color: '#94a3b8',
 textAlign: 'center',
 marginBottom: verticalScale(28),
 },
 card: {
 backgroundColor: 'rgba(255,255,255,0.04)',
 borderRadius: scale(18),
 padding: scale(20),
 gap: scale(16),
 marginBottom: verticalScale(32),
 },
 inputWrapper: {
 flexDirection: 'row',
 alignItems: 'center',
 gap: scale(12),
 backgroundColor: 'rgba(255,255,255,0.05)',
 paddingHorizontal: scale(16),
 borderRadius: scale(14),
 borderWidth: 1,
 borderColor: 'rgba(255,255,255,0.08)',
 },
 input: {
 flex: 1,
 color: '#fff',
 fontSize: fontScale(16),
 paddingVertical: verticalScale(14),
 },
 error: {
 color: '#ef4444',
 fontSize: fontScale(12),
 },
 button: {
 borderRadius: scale(16),
 overflow: 'hidden',
 },
 disabled: {
 opacity: 0.5,
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
});