import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OfflineTransaction } from '@/types/wallet';
const OFFLINE_TRANSACTIONS_KEY = 'offline_transactions';
const SHADOW_BALANCE_KEY = 'shadow_balance';
const LAST_KNOWN_BALANCE_KEY = 'last_known_balance';
export const OfflineStorageUtils = {
 async getOfflineTransactions(): Promise<OfflineTransaction[]> {
 try {
 const stored = await AsyncStorage.getItem(OFFLINE_TRANSACTIONS_KEY);
 return stored ? JSON.parse(stored) : [];
 } catch {
 return [];
 }
 },
 async addOfflineTransaction(transaction: OfflineTransaction): Promise<void> {
 const transactions = await this.getOfflineTransactions();
 transactions.push(transaction);
 await AsyncStorage.setItem(
 OFFLINE_TRANSACTIONS_KEY,
 JSON.stringify(transactions)
 );
 },
 async updateOfflineTransactionStatus(
 clientTxnId: string,
 status: 'PENDING' | 'SYNCED' | 'FAILED'
 ): Promise<void> {
 const transactions = await this.getOfflineTransactions();
 const updated = transactions.map((txn) =>
 txn.clientTransactionId === clientTxnId
 ? { ...txn, status }
 : txn
 );
 await AsyncStorage.setItem(
 OFFLINE_TRANSACTIONS_KEY,
 JSON.stringify(updated)
 );
 },
 async removeSyncedTransactions(): Promise<void> {
 const transactions = await this.getOfflineTransactions();
 const pending = transactions.filter(
 (txn) => txn.status !== 'SYNCED'
 );
 await AsyncStorage.setItem(
 OFFLINE_TRANSACTIONS_KEY,
 JSON.stringify(pending)
 );
 },
 async clearAllOfflineTransactions(): Promise<void> {
 await AsyncStorage.removeItem(OFFLINE_TRANSACTIONS_KEY);
 },
 async getShadowBalance(): Promise<number> {
 const stored = await AsyncStorage.getItem(SHADOW_BALANCE_KEY);
 return stored ? Number(stored) : 0;
 },
 async setShadowBalance(balance: number): Promise<void> {
 await AsyncStorage.setItem(
 SHADOW_BALANCE_KEY,
 balance.toString()
 );
 },
 async getLastKnownBalance(): Promise<number> {
 const stored = await AsyncStorage.getItem(LAST_KNOWN_BALANCE_KEY);
 return stored ? Number(stored) : 0;
 },
 async setLastKnownBalance(balance: number): Promise<void> {
 await AsyncStorage.setItem(
 LAST_KNOWN_BALANCE_KEY,
 balance.toString()
 );
 },
 async debitShadowBalance(amount: number): Promise<boolean> {
 const current = await this.getShadowBalance();
 if (current < amount) return false;
 await this.setShadowBalance(current - amount);
 return true;
 },
};
export const OfflineTransactionUtils = {
 generateClientTransactionId(): string {
 return `OFFLINE_${Date.now()}_${Math.random()
 .toString(36)
 .slice(2, 10)}`;
 },
 generateTransactionSignature(transaction: {
 clientTransactionId: string;
 type: string;
 amount: number;
 clientTimestamp: number;
 receiverId: string;
 }): string {
 return [
 transaction.clientTransactionId,
 transaction.type,
 transaction.amount,
 transaction.clientTimestamp,
 transaction.receiverId,
 ].join('|');
 },
 async createOfflineTransaction(
 receiverId: string,
 receiverUsername: string,
 amount: number
 ): Promise<OfflineTransaction> {
 const clientTransactionId = this.generateClientTransactionId();
 const clientTimestamp = Date.now();
 const signature = this.generateTransactionSignature({
 clientTransactionId,
 type: 'TRANSFER',
 amount,
 clientTimestamp,
 receiverId,
 });
 return {
 clientTransactionId,
 type: 'TRANSFER',
 receiverId,
 receiverUsername,
 amount,
 clientTimestamp,
 signature,
 status: 'PENDING',
 };
 },
 validateOfflineTransaction(
 transaction: OfflineTransaction,
 limits: {
 maxTransactionAmount: number;
 maxDailySpend: number;
 shadowBalance: number;
 }
 ): { valid: boolean; reason?: string } {
 if (transaction.amount <= 0) {
 return { valid: false, reason: 'Invalid amount' };
 }
 if (transaction.amount > limits.maxTransactionAmount) {
 return {
 valid: false,
 reason: `Exceeds offline limit of ${limits.maxTransactionAmount}`,
 };
 }
 if (limits.shadowBalance < transaction.amount) {
 return {
 valid: false,
 reason: 'Insufficient shadow balance',
 };
 }
 return { valid: true };
 },
};
export const OfflineConfig = {
 MAX_TRANSACTION_AMOUNT: 5000,
 MAX_DAILY_SPEND: 15000,
 MAX_TRANSACTION_COUNT: 20,
};