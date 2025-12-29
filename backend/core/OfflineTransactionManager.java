package core;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
public class OfflineTransactionManager {
    private static final double MAX_OFFLINE_TRANSACTION_AMOUNT = 5_000.0;
    private static final double MAX_DAILY_OFFLINE_SPEND = 15_000.0;
    private static final int MAX_OFFLINE_TRANSACTION_COUNT = 20;
    private final Map<String, List<OfflineTransactionRecord>> userOfflineHistory =
            new ConcurrentHashMap<>();
    public OfflineLimitCheckResult validateOfflineTransaction(
            String userId,
            double amount,
            double shadowBalance
    ) {
        if (amount <= 0) {
            return OfflineLimitCheckResult.blocked("Invalid amount");
        }
        if (amount > MAX_OFFLINE_TRANSACTION_AMOUNT) {
            return OfflineLimitCheckResult.blocked(
                    "Exceeds offline transaction limit of " + MAX_OFFLINE_TRANSACTION_AMOUNT
            );
        }
        if (shadowBalance < amount) {
            return OfflineLimitCheckResult.blocked("Insufficient shadow balance");
        }
        List<OfflineTransactionRecord> history =
                userOfflineHistory.computeIfAbsent(
                        userId, k -> new CopyOnWriteArrayList<>()
                );
        long now = System.currentTimeMillis();
        long dayStart = now - (24 * 60 * 60 * 1000);
        double dailySpend = history.stream()
                .filter(r -> r.timestamp >= dayStart)
                .mapToDouble(r -> r.amount)
                .sum();
        if (dailySpend + amount > MAX_DAILY_OFFLINE_SPEND) {
            return OfflineLimitCheckResult.blocked(
                    "Exceeds daily offline spend limit of " + MAX_DAILY_OFFLINE_SPEND
            );
        }
        long unsyncedCount = history.stream()
                .filter(r -> !r.synced)
                .count();
        if (unsyncedCount >= MAX_OFFLINE_TRANSACTION_COUNT) {
            return OfflineLimitCheckResult.blocked(
                    "Maximum offline transactions reached. Please sync with server."
            );
        }
        return OfflineLimitCheckResult.allowed();
    }
    public void recordOfflineTransaction(
            String userId,
            double amount,
            String clientTxnId
    ) {
        userOfflineHistory
                .computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>())
                .add(new OfflineTransactionRecord(
                        amount,
                        clientTxnId,
                        System.currentTimeMillis()
                ));
    }
    public void markTransactionSynced(String userId, String clientTxnId) {
        List<OfflineTransactionRecord> history = userOfflineHistory.get(userId);
        if (history == null) return;
        for (OfflineTransactionRecord record : history) {
            if (record.clientTxnId.equals(clientTxnId)) {
                record.markSynced();
                break;
            }
        }
    }
    public void clearSyncedTransactions(String userId, long olderThanMs) {
        List<OfflineTransactionRecord> history = userOfflineHistory.get(userId);
        if (history == null) return;
        long cutoff = System.currentTimeMillis() - olderThanMs;
        history.removeIf(r -> r.synced && r.timestamp < cutoff);
    }
    public double getMaxOfflineTransactionAmount() {
        return MAX_OFFLINE_TRANSACTION_AMOUNT;
    }
    public double getMaxDailyOfflineSpend() {
        return MAX_DAILY_OFFLINE_SPEND;
    }
    public int getMaxOfflineTransactionCount() {
        return MAX_OFFLINE_TRANSACTION_COUNT;
    }
    private static class OfflineTransactionRecord {
        private final double amount;
        private final String clientTxnId;
        private final long timestamp;
        private boolean synced;
        OfflineTransactionRecord(double amount, String clientTxnId, long timestamp) {
            this.amount = amount;
            this.clientTxnId = clientTxnId;
            this.timestamp = timestamp;
            this.synced = false;
        }
        void markSynced() {
            this.synced = true;
        }
    }
}