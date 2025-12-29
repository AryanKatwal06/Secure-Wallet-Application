package core;
public class TransactionResult {
    private final boolean success;
    private final String message;
    private final String transactionId;
    private final double newBalance;
    private TransactionResult(
            boolean success,
            String message,
            String transactionId,
            double newBalance
    ) {
        this.success = success;
        this.message = message;
        this.transactionId = transactionId;
        this.newBalance = newBalance;
    }
    public static TransactionResult success(String transactionId, double newBalance) {
        return new TransactionResult(
                true,
                "Transaction successful",
                transactionId,
                round(newBalance)
        );
    }
    public static TransactionResult failure(String message) {
        return new TransactionResult(
                false,
                message,
                null,
                -1
        );
    }
    public boolean isSuccess() {
        return success;
    }
    public String getMessage() {
        return message;
    }
    public String getTransactionId() {
        return transactionId;
    }
    public double getNewBalance() {
        return newBalance;
    }
    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
    @Override
    public String toString() {
        return "TransactionResult{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", transactionId='" + transactionId + '\'' +
                ", newBalance=" + newBalance +
                '}';
    }
}