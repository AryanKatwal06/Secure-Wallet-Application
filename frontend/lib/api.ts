import { Platform } from 'react-native';
import type {
 AuthResponse,
 TransactionResponse,
 BalanceResponse,
 TransactionHistoryResponse,
 SyncResponse,
} from '@/types/wallet';
const API_BASE_URL =
 Platform.OS === 'web'
 ? '/api'
 : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
async function request<T>(
 endpoint: string,
 options: RequestInit = {}
): Promise<T> {
 const response = await fetch(`${API_BASE_URL}${endpoint}`, {
 ...options,
 headers: {
 'Content-Type': 'application/json',
 ...(options.headers || {}),
 },
 });
 const data = await response.json();
 if (!response.ok || data.success === false) {
 throw new Error(data.message || data.error || 'Request failed');
 }
 return data as T;
}
export const walletApi = {
 register(username: string, pin: string): Promise<AuthResponse> {
 return request('/auth/register', {
 method: 'POST',
 body: JSON.stringify({ username, pin }),
 });
 },
 login(username: string, pin: string): Promise<AuthResponse> {
 return request('/auth/login', {
 method: 'POST',
 body: JSON.stringify({ username, pin }),
 });
 },
 verifyPin(token: string, pin: string): Promise<AuthResponse> {
 return request('/auth/verify-pin', {
 method: 'POST',
 headers: {
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({ pin }),
 });
 },
 getBalance(token: string): Promise<BalanceResponse> {
 return request('/wallet/balance', {
 method: 'GET',
 headers: {
 Authorization: `Bearer ${token}`,
 },
 });
 },
 addMoney(token: string, amount: number): Promise<TransactionResponse> {
 return request('/wallet/add-money', {
 method: 'POST',
 headers: {
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({ amount }),
 });
 },
 withdraw(token: string, amount: number): Promise<TransactionResponse> {
 return request('/wallet/withdraw', {
 method: 'POST',
 headers: {
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({ amount }),
 });
 },
 transfer(
 token: string,
 receiverUsername: string,
 amount: number
 ): Promise<TransactionResponse> {
 return request('/wallet/transfer', {
 method: 'POST',
 headers: {
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({ receiverUsername, amount }),
 });
 },
 getTransactionHistory(
 token: string
 ): Promise<TransactionHistoryResponse> {
 return request('/transactions/history', {
 method: 'GET',
 headers: {
 Authorization: `Bearer ${token}`,
 },
 });
 },
 getBankBalance(token: string): Promise<BalanceResponse> {
 return request('/bank/balance', {
 method: 'GET',
 headers: {
 Authorization: `Bearer ${token}`,
 },
 });
 },
 syncOfflineTransactions(
 token: string,
 transactions: any[]
 ): Promise<SyncResponse> {
 return request('/offline/sync', {
 method: 'POST',
 headers: {
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({ transactions }),
 });
 },
};