package core;
public class SyncedTransaction {
    private final String clientTransactionId;
    private final String serverTransactionId;
    private final Transaction.TransactionType type;
    private final double amount;
    private final double newBalance;
    public SyncedTransaction(
            String clientTransactionId,
            String serverTransactionId,
            Transaction.TransactionType type,
            double amount,
            double newBalance
    ) {
        this.clientTransactionId = clientTransactionId;
        this.serverTransactionId = serverTransactionId;
        this.type = type;
        this.amount = amount;
        this.newBalance = newBalance;
    }
    public String getClientTransactionId() { return clientTransactionId; }
    public String getServerTransactionId() { return serverTransactionId; }
    public Transaction.TransactionType getType() { return type; }
    public double getAmount() { return amount; }
    public double getNewBalance() { return newBalance; }
}