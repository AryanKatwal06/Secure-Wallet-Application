package core;
import java.util.List;
public class SyncResult {
    private final boolean success;
    private final String message;
    private final List<SyncedTransaction> syncedTransactions;
    private final List<SyncFailure> failures;
    private SyncResult(
            boolean success,
            String message,
            List<SyncedTransaction> syncedTransactions,
            List<SyncFailure> failures
    ) {
        this.success = success;
        this.message = message;
        this.syncedTransactions = syncedTransactions;
        this.failures = failures;
    }
    public static SyncResult success(String message) {
        return new SyncResult(true, message, List.of(), List.of());
    }
    public static SyncResult failure(String message) {
        return new SyncResult(false, message, List.of(), List.of());
    }
    public static SyncResult partialOrFull(
            boolean success,
            String message,
            List<SyncedTransaction> successTxns,
            List<SyncFailure> failures
    ) {
        return new SyncResult(success, message, successTxns, failures);
    }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public List<SyncedTransaction> getSyncedTransactions() { return syncedTransactions; }
    public List<SyncFailure> getFailures() { return failures; }
}