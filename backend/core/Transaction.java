package core;
import java.io.Serializable;
public class Transaction implements Serializable {
    private static final long serialVersionUID = 1L;
    private final String transactionId;
    private final TransactionType type;
    private final String senderId;
    private final String receiverId;
    private final double amount;
    private TransactionStatus status;
    private final long createdAt;
    private long completedAt;
    public Transaction(
            String transactionId,
            TransactionType type,
            String senderId,
            String receiverId,
            double amount
    ) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive");
        }
        this.transactionId = transactionId;
        this.type = type;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.amount = round(amount);
        this.status = TransactionStatus.PENDING;
        this.createdAt = System.currentTimeMillis();
        this.completedAt = 0;
    }
    public synchronized void markSuccess() {
        this.status = TransactionStatus.SUCCESS;
        this.completedAt = System.currentTimeMillis();
    }
    public synchronized void markFailed() {
        this.status = TransactionStatus.FAILED;
        this.completedAt = System.currentTimeMillis();
    }
    public String getTransactionId() { return transactionId; }
    public TransactionType getType() { return type; }
    public String getSenderId() { return senderId; }
    public String getReceiverId() { return receiverId; }
    public double getAmount() { return amount; }
    public TransactionStatus getStatus() { return status; }
    public long getCreatedAt() { return createdAt; }
    public long getCompletedAt() { return completedAt; }
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
    @Override
    public String toString() {
        return "Transaction{" +
                "id='" + transactionId + '\'' +
                ", type=" + type +
                ", sender='" + senderId + '\'' +
                ", receiver='" + receiverId + '\'' +
                ", amount=" + amount +
                ", status=" + status +
                '}';
    }
    public enum TransactionType {
        ADD_MONEY,
        WITHDRAW,
        TRANSFER
    }
    public enum TransactionStatus {
        PENDING,
        SUCCESS,
        FAILED
    }
}