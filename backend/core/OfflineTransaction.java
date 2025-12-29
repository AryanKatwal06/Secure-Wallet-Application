package core;
public class OfflineTransaction {
    private final String clientTransactionId;
    private final Transaction.TransactionType type;
    private final String receiverId;
    private final double amount;
    private final long clientTimestamp;
    private final String signature;
    public OfflineTransaction(
            String clientTransactionId,
            Transaction.TransactionType type,
            String receiverId,
            double amount,
            long clientTimestamp,
            String signature
    ) {
        this.clientTransactionId = clientTransactionId;
        this.type = type;
        this.receiverId = receiverId;
        this.amount = amount;
        this.clientTimestamp = clientTimestamp;
        this.signature = signature;
    }
    public String getClientTransactionId() { return clientTransactionId; }
    public Transaction.TransactionType getType() { return type; }
    public String getReceiverId() { return receiverId; }
    public double getAmount() { return amount; }
    public long getClientTimestamp() { return clientTimestamp; }
    public String getSignature() { return signature; }
}