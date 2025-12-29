package core;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;
public class OfflineSyncEngine {
    private final TransactionEngine transactionEngine;
    private final UserManager userManager;
    private final OfflineTransactionManager offlineTransactionManager;
    private final OfflineFraudDetector offlineFraudDetector;
    private final ReentrantLock syncLock = new ReentrantLock();
    public OfflineSyncEngine(
            TransactionEngine transactionEngine,
            UserManager userManager,
            OfflineTransactionManager offlineTransactionManager,
            OfflineFraudDetector offlineFraudDetector
    ) {
        this.transactionEngine = transactionEngine;
        this.userManager = userManager;
        this.offlineTransactionManager = offlineTransactionManager;
        this.offlineFraudDetector = offlineFraudDetector;
    }
    public SyncResult syncOfflineTransactions(
            String userId,
            List<OfflineTransaction> offlineTransactions
    ) {
        if (offlineTransactions == null || offlineTransactions.isEmpty()) {
            return SyncResult.success("No transactions to sync");
        }
        User user = userManager.getUser(userId);
        if (user == null) {
            return SyncResult.failure("User not found");
        }
        syncLock.lock();
        try {
            offlineTransactions.sort(
                    Comparator.comparingLong(OfflineTransaction::getClientTimestamp)
            );
            List<SyncedTransaction> success = new ArrayList<>();
            List<SyncFailure> failures = new ArrayList<>();
            for (OfflineTransaction txn : offlineTransactions) {
                if (!validateIntegrity(txn)) {
                    failures.add(SyncFailure.of(txn, "Integrity check failed"));
                    continue;
                }
                TransactionResult result;
                if (txn.getType() == Transaction.TransactionType.TRANSFER) {
                    result = transactionEngine.transfer(
                            userId,
                            txn.getReceiverId(),
                            txn.getAmount()
                    );
                } else {
                    failures.add(SyncFailure.of(txn, "Unsupported offline transaction"));
                    continue;
                }
                if (result.isSuccess()) {
                    success.add(
                            new SyncedTransaction(
                                    txn.getClientTransactionId(),
                                    result.getTransactionId(),
                                    txn.getType(),
                                    txn.getAmount(),
                                    result.getNewBalance()
                            )
                    );
                    offlineTransactionManager.markTransactionSynced(
                            userId,
                            txn.getClientTransactionId()
                    );
                } else {
                    failures.add(SyncFailure.of(txn, result.getMessage()));
                }
            }
            if (failures.isEmpty()) {
                offlineFraudDetector.recordSyncSuccess(userId);
                return SyncResult.partialOrFull(true, "All transactions synced", success, failures);
            }
            offlineFraudDetector.recordSyncFailure(userId);
            return SyncResult.partialOrFull(!success.isEmpty(), "Partial sync", success, failures);
        } catch (Exception e) {
            offlineFraudDetector.recordSyncFailure(userId);
            return SyncResult.failure("Sync failed: " + e.getMessage());
        } finally {
            syncLock.unlock();
        }
    }
    private boolean validateIntegrity(OfflineTransaction txn) {
        String data = txn.getClientTransactionId() + "|" +
                txn.getType() + "|" +
                txn.getAmount() + "|" +
                txn.getClientTimestamp() + "|" +
                (txn.getReceiverId() == null ? "" : txn.getReceiverId());
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash).equals(txn.getSignature());
        } catch (Exception e) {
            return false;
        }
    }
    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}