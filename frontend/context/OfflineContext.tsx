import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletApi } from '@/lib/api';
import {
 OfflineStorageUtils,
 OfflineTransactionUtils,
 OfflineConfig,
} from '@/lib/offlineUtils';
import type { OfflineTransaction, SyncResponse } from '@/types/wallet';
interface OfflineState {
 isOnline: boolean;
 isOfflineModeEnabled: boolean;
 offlineTransactions: OfflineTransaction[];
 shadowBalance: number;
 pendingTransactionCount: number;
 isSyncing: boolean;
 syncOfflineTransactions: () => Promise<void>;
 transferOffline: (
 receiverId: string,
 receiverUsername: string,
 amount: number
 ) => Promise<void>;
 getOfflineLimits: () => {
 maxTransactionAmount: number;
 maxDailySpend: number;
 maxTransactionCount: number;
 };
}
export const [OfflineProvider, useOffline] =
 createContextHook<OfflineState>(() => {
 const queryClient = useQueryClient();
 const [isOnline, setIsOnline] = useState(true);
 useEffect(() => {
 const unsubscribe = NetInfo.addEventListener(
 (state: NetInfoState) => {
 const online =
 state.isConnected === true &&
 state.isInternetReachable === true;
 setIsOnline(online);
 if (online) {
 queryClient.invalidateQueries({
 queryKey: ['offlineTransactions'],
 });
 }
 }
 );
 return () => unsubscribe();
 }, [queryClient]);
 const { data: offlineTransactions = [] } = useQuery({
 queryKey: ['offlineTransactions'],
 queryFn: OfflineStorageUtils.getOfflineTransactions,
 });
 const { data: shadowBalance = 0 } = useQuery({
 queryKey: ['shadowBalance'],
 queryFn: OfflineStorageUtils.getShadowBalance,
 });
 const syncMutation = useMutation({
 mutationFn: async (token: string) => {
 const transactions =
 await OfflineStorageUtils.getOfflineTransactions();
 const pending = transactions.filter(
 (t) => t.status === 'PENDING'
 );
 if (pending.length === 0) {
 return {
 success: true,
 syncedTransactions: [],
 failures: [],
 } as SyncResponse;
 }
 return walletApi.syncOfflineTransactions(token, pending);
 },
 onSuccess: async (result) => {
 if (result.syncedTransactions?.length) {
 for (const synced of result.syncedTransactions) {
 await OfflineStorageUtils.updateOfflineTransactionStatus(
 synced.clientTransactionId,
 'SYNCED'
 );
 }
 const last =
 result.syncedTransactions[
 result.syncedTransactions.length - 1
 ];
 await OfflineStorageUtils.setShadowBalance(
 last.newBalance
 );
 await OfflineStorageUtils.setLastKnownBalance(
 last.newBalance
 );
 }
 if (result.failures?.length) {
 for (const failure of result.failures) {
 await OfflineStorageUtils.updateOfflineTransactionStatus(
 failure.clientTransactionId,
 'FAILED'
 );
 }
 }
 await OfflineStorageUtils.removeSyncedTransactions();
 queryClient.invalidateQueries();
 },
 });
 const transferOfflineMutation = useMutation({
 mutationFn: async ({
 receiverId,
 receiverUsername,
 amount,
 }: {
 receiverId: string;
 receiverUsername: string;
 amount: number;
 }) => {
 const shadow =
 await OfflineStorageUtils.getShadowBalance();
 const transactions =
 await OfflineStorageUtils.getOfflineTransactions();
 const pendingCount = transactions.filter(
 (t) => t.status === 'PENDING'
 ).length;
 if (pendingCount >= OfflineConfig.MAX_TRANSACTION_COUNT) {
 throw new Error(
 'Maximum offline transaction count reached'
 );
 }
 const now = Date.now();
 const dayStart = now - 24 * 60 * 60 * 1000;
 const dailySpend = transactions
 .filter((t) => t.clientTimestamp >= dayStart)
 .reduce((sum, t) => sum + t.amount, 0);
 if (
 dailySpend + amount >
 OfflineConfig.MAX_DAILY_SPEND
 ) {
 throw new Error(
 `Exceeds daily offline limit of ${OfflineConfig.MAX_DAILY_SPEND}`
 );
 }
 if (amount > OfflineConfig.MAX_TRANSACTION_AMOUNT) {
 throw new Error(
 `Exceeds offline transaction limit of ${OfflineConfig.MAX_TRANSACTION_AMOUNT}`
 );
 }
 if (shadow < amount) {
 throw new Error('Insufficient shadow balance');
 }
 const transaction =
 await OfflineTransactionUtils.createOfflineTransaction(
 receiverId,
 receiverUsername,
 amount
 );
 await OfflineStorageUtils.addOfflineTransaction(transaction);
 await OfflineStorageUtils.debitShadowBalance(amount);
 return transaction;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({
 queryKey: ['offlineTransactions'],
 });
 queryClient.invalidateQueries({
 queryKey: ['shadowBalance'],
 });
 },
 });
 const syncOfflineTransactions = async () => {
 const token = await AsyncStorage.getItem('token');
 if (!token) throw new Error('Not authenticated');
 await syncMutation.mutateAsync(token);
 };
 const transferOffline = async (
 receiverId: string,
 receiverUsername: string,
 amount: number
 ) => {
 await transferOfflineMutation.mutateAsync({
 receiverId,
 receiverUsername,
 amount,
 });
 };
 const getOfflineLimits = () => ({
 maxTransactionAmount: OfflineConfig.MAX_TRANSACTION_AMOUNT,
 maxDailySpend: OfflineConfig.MAX_DAILY_SPEND,
 maxTransactionCount: OfflineConfig.MAX_TRANSACTION_COUNT,
 });
 const pendingTransactionCount = offlineTransactions.filter(
 (t) => t.status === 'PENDING'
 ).length;
 return {
 isOnline,
 isOfflineModeEnabled: true,
 offlineTransactions,
 shadowBalance,
 pendingTransactionCount,
 isSyncing: syncMutation.isPending,
 syncOfflineTransactions,
 transferOffline,
 getOfflineLimits,
 };
});