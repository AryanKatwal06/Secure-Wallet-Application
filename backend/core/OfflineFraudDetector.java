package core;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
public class OfflineFraudDetector {
    private static final int MAX_OFFLINE_VELOCITY = 5;
    private static final long OFFLINE_VELOCITY_WINDOW_MS = 60_000;
    private static final long HISTORY_RETENTION_MS = 60 * 60 * 1000;
    private static final double SUSPICIOUS_OFFLINE_ONLINE_RATIO = 0.8;
    private static final int MAX_FAILED_SYNC_ATTEMPTS = 3;
    private final Map<String, List<OfflineFraudRecord>> offlineActivity =
            new ConcurrentHashMap<>();
    private final Map<String, Integer> failedSyncAttempts =
            new ConcurrentHashMap<>();
    private final Map<String, Boolean> offlineModeDisabled =
            new ConcurrentHashMap<>();
    public OfflineFraudCheckResult checkOfflineTransaction(
            String userId,
            double amount,
            double shadowBalance,
            double lastKnownBackendBalance
    ) {
        if (offlineModeDisabled.getOrDefault(userId, false)) {
            return OfflineFraudCheckResult.blocked(
                    "Offline mode disabled due to suspicious activity"
            );
        }
        if (shadowBalance > lastKnownBackendBalance * 1.01) {
            return OfflineFraudCheckResult.blocked(
                    "Shadow balance tampering detected"
            );
        }
        if (isHighOfflineVelocity(userId)) {
            return OfflineFraudCheckResult.blocked(
                    "Too many offline transactions in a short period"
            );
        }
        if (isSuspiciousOfflineOnlinePattern(userId, amount)) {
            disableOfflineMode(userId);
            return OfflineFraudCheckResult.blocked(
                    "Suspicious offline/online pattern detected. Offline mode disabled."
            );
        }
        int failedAttempts = failedSyncAttempts.getOrDefault(userId, 0);
        if (failedAttempts >= MAX_FAILED_SYNC_ATTEMPTS) {
            return OfflineFraudCheckResult.blocked(
                    "Multiple failed sync attempts. Please contact support."
            );
        }
        return OfflineFraudCheckResult.allowed();
    }
    private boolean isHighOfflineVelocity(String userId) {
        List<OfflineFraudRecord> history = offlineActivity.get(userId);
        if (history == null) return false;
        long now = System.currentTimeMillis();
        long count = history.stream()
                .filter(r -> now - r.timestamp < OFFLINE_VELOCITY_WINDOW_MS)
                .count();
        return count >= MAX_OFFLINE_VELOCITY;
    }
    private boolean isSuspiciousOfflineOnlinePattern(String userId, double currentAmount) {
        List<OfflineFraudRecord> history = offlineActivity.get(userId);
        if (history == null || history.isEmpty()) return false;
        long now = System.currentTimeMillis();
        long recentWindow = 10 * 60 * 1000;
        double recentOfflineSpend = history.stream()
                .filter(r -> r.type == OfflineActivityType.OFFLINE_TRANSACTION)
                .filter(r -> now - r.timestamp < recentWindow)
                .mapToDouble(r -> r.amount)
                .sum();
        long recentOnlineWithdrawCount = history.stream()
                .filter(r -> r.type == OfflineActivityType.ONLINE_WITHDRAW_AFTER_OFFLINE)
                .filter(r -> now - r.timestamp < recentWindow)
                .count();
        return recentOfflineSpend > 0 &&
                recentOnlineWithdrawCount > 0 &&
                currentAmount >= recentOfflineSpend * SUSPICIOUS_OFFLINE_ONLINE_RATIO;
    }
    public void recordOfflineActivity(
            String userId,
            double amount,
            OfflineActivityType type
    ) {
        offlineActivity
                .computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>())
                .add(new OfflineFraudRecord(amount, type, System.currentTimeMillis()));
        cleanupOldRecords(userId);
    }
    public void recordSyncFailure(String userId) {
        int attempts = failedSyncAttempts.getOrDefault(userId, 0) + 1;
        failedSyncAttempts.put(userId, attempts);
        if (attempts >= MAX_FAILED_SYNC_ATTEMPTS) {
            disableOfflineMode(userId);
        }
    }
    public void recordSyncSuccess(String userId) {
        failedSyncAttempts.put(userId, 0);
    }
    public void disableOfflineMode(String userId) {
        offlineModeDisabled.put(userId, true);
    }
    public void enableOfflineMode(String userId) {
        offlineModeDisabled.put(userId, false);
        failedSyncAttempts.put(userId, 0);
    }
    public boolean isOfflineModeDisabled(String userId) {
        return offlineModeDisabled.getOrDefault(userId, false);
    }
    private void cleanupOldRecords(String userId) {
        List<OfflineFraudRecord> history = offlineActivity.get(userId);
        if (history == null) return;
        long cutoff = System.currentTimeMillis() - HISTORY_RETENTION_MS;
        history.removeIf(r -> r.timestamp < cutoff);
    }
    private static class OfflineFraudRecord {
        private final double amount;
        private final OfflineActivityType type;
        private final long timestamp;
        OfflineFraudRecord(double amount, OfflineActivityType type, long timestamp) {
            this.amount = amount;
            this.type = type;
            this.timestamp = timestamp;
        }
    }
}