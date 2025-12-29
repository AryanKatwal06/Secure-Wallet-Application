package core;
public class SyncFailure {
    private final String clientTransactionId;
    private final Transaction.TransactionType type;
    private final double amount;
    private final String reason;
    private SyncFailure(
            String clientTransactionId,
            Transaction.TransactionType type,
            double amount,
            String reason
    ) {
        this.clientTransactionId = clientTransactionId;
        this.type = type;
        this.amount = amount;
        this.reason = reason;
    }
    public static SyncFailure of(OfflineTransaction txn, String reason) {
        return new SyncFailure(
                txn.getClientTransactionId(),
                txn.getType(),
                txn.getAmount(),
                reason
        );
    }
    public String getClientTransactionId() { return clientTransactionId; }
    public Transaction.TransactionType getType() { return type; }
    public double getAmount() { return amount; }
    public String getReason() { return reason; }
}