package core;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
public class FraudDetector {
    private static final double HIGH_AMOUNT_THRESHOLD = 50_000.0;
    private static final int MAX_TRANSACTIONS_PER_MINUTE = 10;
    private static final long VELOCITY_WINDOW_MS = 60_000;
    private static final long HISTORY_RETENTION_MS = 60 * 60 * 1000;
    private static final double RAPID_TOPUP_WITHDRAW_THRESHOLD = 0.9;
    private final Map<String, List<TransactionRecord>> userHistory =
            new ConcurrentHashMap<>();
    public FraudDetector() {
    }
    public FraudCheckResult checkTransaction(
            String userId,
            double amount,
            Transaction.TransactionType type
    ) {
        if (amount > HIGH_AMOUNT_THRESHOLD) {
            return FraudCheckResult.blocked("Amount exceeds allowed limit");
        }
        if (isHighVelocity(userId)) {
            return FraudCheckResult.blocked("Too many transactions in a short period");
        }
        if (type == Transaction.TransactionType.WITHDRAW &&
                isSuspiciousTopupWithdraw(userId, amount)) {
            return FraudCheckResult.blocked("Suspicious rapid top-up and withdrawal");
        }
        return FraudCheckResult.allowed();
    }
    private boolean isHighVelocity(String userId) {
        List<TransactionRecord> history = userHistory.get(userId);
        if (history == null) return false;
        long now = System.currentTimeMillis();
        long recentCount = history.stream()
                .filter(r -> now - r.timestamp < VELOCITY_WINDOW_MS)
                .count();
        return recentCount >= MAX_TRANSACTIONS_PER_MINUTE;
    }
    private boolean isSuspiciousTopupWithdraw(String userId, double withdrawAmount) {
        List<TransactionRecord> history = userHistory.get(userId);
        if (history == null || history.isEmpty()) return false;
        long now = System.currentTimeMillis();
        double recentTopups = history.stream()
                .filter(r -> r.type == Transaction.TransactionType.ADD_MONEY)
                .filter(r -> now - r.timestamp < 5 * 60 * 1000)
                .mapToDouble(r -> r.amount)
                .sum();
        return recentTopups > 0 &&
                withdrawAmount >= recentTopups * RAPID_TOPUP_WITHDRAW_THRESHOLD;
    }
    public void recordTransaction(
            String userId,
            double amount,
            Transaction.TransactionType type
    ) {
        userHistory
                .computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>())
                .add(new TransactionRecord(amount, type, System.currentTimeMillis()));
        cleanupOldRecords(userId);
    }
    private void cleanupOldRecords(String userId) {
        List<TransactionRecord> history = userHistory.get(userId);
        if (history == null) return;
        long cutoff = System.currentTimeMillis() - HISTORY_RETENTION_MS;
        history.removeIf(r -> r.timestamp < cutoff);
    }
    private static class TransactionRecord {
        private final double amount;
        private final Transaction.TransactionType type;
        private final long timestamp;
        TransactionRecord(double amount, Transaction.TransactionType type, long timestamp) {
            this.amount = amount;
            this.type = type;
            this.timestamp = timestamp;
        }
    }
}