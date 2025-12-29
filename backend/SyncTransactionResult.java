public class SyncTransactionResult {
    private final boolean success;
    private final String serverTransactionId;
    private final double newBalance;
    private final String reason;
    public SyncTransactionResult(
            boolean success,
            String serverTransactionId,
            double newBalance,
            String reason
    ) {
        this.success = success;
        this.serverTransactionId = serverTransactionId;
        this.newBalance = newBalance;
        this.reason = reason;
    }
    public boolean isSuccess() { return success; }
    public String getServerTransactionId() { return serverTransactionId; }
    public double getNewBalance() { return newBalance; }
    public String getReason() { return reason; }
}