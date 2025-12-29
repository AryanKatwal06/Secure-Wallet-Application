import React, { useState, useRef } from 'react';
import {
 View,
 Text,
 TextInput,
 TouchableOpacity,
 StyleSheet,
 Alert,
 Animated,
 KeyboardAvoidingView,
 Platform,
 ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/context/WalletContext';
import { ArrowUpCircle, IndianRupee } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, fontScale } from '@/lib/responsive';
const QUICK_AMOUNTS = [500, 1000, 2000, 5000];
export default function WithdrawScreen() {
 const router = useRouter();
 const { withdraw, user } = useWallet();
 const [amount, setAmount] = useState<string>('');
 const [isLoading, setIsLoading] = useState(false);
 const scaleAnim = useRef(new Animated.Value(1)).current;
 const walletBalance = user?.walletBalance ?? 0;
 const handleWithdraw = async () => {
 if (isLoading) return;
 const numAmount = Number(amount);
 if (!amount || isNaN(numAmount) || numAmount <= 0) {
 Alert.alert('Invalid amount', 'Please enter a valid amount');
 return;
 }
 if (numAmount > walletBalance) {
 Alert.alert('Insufficient balance', 'Not enough wallet balance');
 return;
 }
 setIsLoading(true);
 try {
 await withdraw(numAmount);
 await Haptics.notificationAsync(
 Haptics.NotificationFeedbackType.Success
 );
 Alert.alert(
 'Success',
 `₹${numAmount.toFixed(2)} withdrawn to bank`,
 [{ text: 'OK', onPress: () => router.back() }]
 );
 } catch (err: any) {
 await Haptics.notificationAsync(
 Haptics.NotificationFeedbackType.Error
 );
 Alert.alert('Failed', err?.message ?? 'Withdrawal failed');
 } finally {
 setIsLoading(false);
 }
 };
 const handleAmountChange = (text: string) => {
 const cleaned = text.replace(/[^0-9]/g, '');
 setAmount(cleaned);
 };
 const handleQuickAmount = (value: number) => {
 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
 setAmount(String(value));
 };
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
 <ArrowUpCircle size={scale(64)} color="#f59e0b" />
 </View>
 <Text style={styles.title}>Withdraw Money</Text>
 <Text style={styles.subtitle}>
 Wallet Balance: ₹{walletBalance.toFixed(2)}
 </Text>
 <View style={styles.inputWrapper}>
 <IndianRupee size={scale(22)} color="#64748b" />
 <TextInput
 value={amount}
 onChangeText={handleAmountChange}
 placeholder="0"
 placeholderTextColor="#475569"
 keyboardType="number-pad"
 style={styles.input}
 />
 </View>
 <View style={styles.quickGrid}>
 {QUICK_AMOUNTS.map((v) => (
 <TouchableOpacity
 key={v}
 onPress={() => handleQuickAmount(v)}
 style={[
 styles.quickButton,
 amount === String(v) && styles.quickActive,
 ]}
 >
 <Text
 style={[
 styles.quickText,
 amount === String(v) && styles.quickTextActive,
 ]}
 >
 ₹{v}
 </Text>
 </TouchableOpacity>
 ))}
 </View>
 <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
 <TouchableOpacity
 disabled={isLoading}
 onPress={handleWithdraw}
 onPressIn={pressIn}
 onPressOut={pressOut}
 style={[styles.button, isLoading && styles.disabled]}
 activeOpacity={0.9}
 >
 <LinearGradient
 colors={['#f59e0b', '#d97706']}
 style={styles.buttonGradient}
 >
 <Text style={styles.buttonText}>
 {isLoading ? 'Processing...' : 'Withdraw'}
 </Text>
 </LinearGradient>
 </TouchableOpacity>
 </Animated.View>
 </ScrollView>
 </KeyboardAvoidingView>
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
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: 'rgba(245,158,11,0.12)',
 marginBottom: verticalScale(24),
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
 inputWrapper: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: 'rgba(255,255,255,0.05)',
 borderRadius: scale(18),
 paddingHorizontal: scale(20),
 marginBottom: verticalScale(24),
 borderWidth: 2,
 borderColor: 'rgba(245,158,11,0.35)',
 },
 input: {
 flex: 1,
 fontSize: fontScale(30),
 color: '#fff',
 paddingVertical: verticalScale(18),
 marginLeft: scale(8),
 fontWeight: '800',
 },
 quickGrid: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: verticalScale(32),
 },
 quickButton: {
 paddingVertical: verticalScale(12),
 paddingHorizontal: scale(22),
 borderRadius: scale(14),
 backgroundColor: 'rgba(255,255,255,0.06)',
 },
 quickActive: {
 backgroundColor: 'rgba(245,158,11,0.25)',
 },
 quickText: {
 color: '#94a3b8',
 fontWeight: '700',
 },
 quickTextActive: {
 color: '#f59e0b',
 },
 button: {
 borderRadius: scale(18),
 overflow: 'hidden',
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
 fontWeight: '800',
 },
});