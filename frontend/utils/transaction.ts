import type { Transaction } from '@/types/wallet';
export function getTransactionDirection(
  txn: Transaction,
  userId: string
): 'SENT' | 'RECEIVED' | 'SELF' {
  if (txn.type !== 'TRANSFER') return 'SELF';
  return txn.senderId === userId ? 'SENT' : 'RECEIVED';
}
export function getTransactionTitle(
  txn: Transaction,
  userId: string
) {
  if (txn.type === 'ADD_MONEY') return 'Money Added';
  if (txn.type === 'WITHDRAW') return 'Withdrawn';
  const direction = getTransactionDirection(txn, userId);
  return direction === 'SENT' ? 'Sent Money' : 'Received Money';
}