package core;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;
public class TransactionEngine {
    private final UserManager userManager;
    private final FraudDetector fraudDetector;
    private final Map<String, Transaction> transactions = new ConcurrentHashMap<>();
    private final ReentrantLock globalLock = new ReentrantLock();
    private final AtomicLong transactionCounter = new AtomicLong(0);
    public TransactionEngine(UserManager userManager) {
        this.userManager = userManager;
        this.fraudDetector = new FraudDetector();
        loadTransactions();
    }
    private String generateTransactionId() {
        return "TXN_" + System.currentTimeMillis() + "_" +
                transactionCounter.incrementAndGet();
    }
    public TransactionResult addMoneyFromBank(String userId, double amount) {
        if (amount <= 0) {
            return TransactionResult.failure("Invalid amount");
        }
        User user = userManager.getUser(userId);
        if (user == null) {
            return TransactionResult.failure("User not found");
        }
        FraudCheckResult fraud =
                fraudDetector.checkTransaction(
                        userId,
                        amount,
                        Transaction.TransactionType.ADD_MONEY
                );
        if (!fraud.isAllowed()) {
            return TransactionResult.failure(fraud.getReason());
        }
        String txnId = generateTransactionId();
        Transaction txn = new Transaction(
                txnId,
                Transaction.TransactionType.ADD_MONEY,
                user.getUserId(),
                user.getUsername(),
                null,
                null,
                amount
        );
        globalLock.lock();
        try {
            if (user.getBankBalance() < amount) {
                return TransactionResult.failure("Insufficient bank balance");
            }
            user.debitBank(amount);
            user.creditWallet(amount);
            txn.markSuccess();
            transactions.put(txnId, txn);
            persistAll();
            fraudDetector.recordTransaction(
                    userId,
                    amount,
                    Transaction.TransactionType.ADD_MONEY
            );
            return TransactionResult.success(txnId, user.getWalletBalance());
        } catch (Exception e) {
            txn.markFailed();
            transactions.put(txnId, txn);
            persistTransactions();
            return TransactionResult.failure(e.getMessage());
        } finally {
            globalLock.unlock();
        }
    }
    public TransactionResult withdrawToBank(String userId, double amount) {
        if (amount <= 0) {
            return TransactionResult.failure("Invalid amount");
        }
        User user = userManager.getUser(userId);
        if (user == null) {
            return TransactionResult.failure("User not found");
        }
        FraudCheckResult fraud =
                fraudDetector.checkTransaction(
                        userId,
                        amount,
                        Transaction.TransactionType.WITHDRAW
                );
        if (!fraud.isAllowed()) {
            return TransactionResult.failure(fraud.getReason());
        }
        String txnId = generateTransactionId();
        Transaction txn = new Transaction(
                txnId,
                Transaction.TransactionType.WITHDRAW,
                user.getUserId(),
                user.getUsername(),
                null,
                null,
                amount
        );
        globalLock.lock();
        try {
            if (user.getWalletBalance() < amount) {
                return TransactionResult.failure("Insufficient wallet balance");
            }
            user.debitWallet(amount);
            user.creditBank(amount);
            txn.markSuccess();
            transactions.put(txnId, txn);
            persistAll();
            fraudDetector.recordTransaction(
                    userId,
                    amount,
                    Transaction.TransactionType.WITHDRAW
            );
            return TransactionResult.success(txnId, user.getWalletBalance());
        } catch (Exception e) {
            txn.markFailed();
            transactions.put(txnId, txn);
            persistTransactions();
            return TransactionResult.failure(e.getMessage());
        } finally {
            globalLock.unlock();
        }
    }
    public TransactionResult transfer(String senderId, String receiverId, double amount) {
        if (amount <= 0) {
            return TransactionResult.failure("Invalid amount");
        }
        if (senderId.equals(receiverId)) {
            return TransactionResult.failure("Cannot transfer to yourself");
        }
        User sender = userManager.getUser(senderId);
        User receiver = userManager.getUser(receiverId);
        if (sender == null || receiver == null) {
            return TransactionResult.failure("User not found");
        }
        FraudCheckResult fraud =
                fraudDetector.checkTransaction(
                        senderId,
                        amount,
                        Transaction.TransactionType.TRANSFER
                );
        if (!fraud.isAllowed()) {
            return TransactionResult.failure(fraud.getReason());
        }
        String txnId = generateTransactionId();
        Transaction txn = new Transaction(
                txnId,
                Transaction.TransactionType.TRANSFER,
                sender.getUserId(),
                sender.getUsername(),
                receiver.getUserId(),
                receiver.getUsername(),
                amount
        );
        globalLock.lock();
        try {
            if (sender.getWalletBalance() < amount) {
                return TransactionResult.failure("Insufficient wallet balance");
            }
            sender.debitWallet(amount);
            receiver.creditWallet(amount);
            txn.markSuccess();
            transactions.put(txnId, txn);
            persistAll();
            fraudDetector.recordTransaction(
                    senderId,
                    amount,
                    Transaction.TransactionType.TRANSFER
            );
            return TransactionResult.success(txnId, sender.getWalletBalance());
        } catch (Exception e) {
            txn.markFailed();
            transactions.put(txnId, txn);
            persistTransactions();
            return TransactionResult.failure(e.getMessage());
        } finally {
            globalLock.unlock();
        }
    }
    public List<Transaction> getUserTransactions(String userId) {
        List<Transaction> list = new ArrayList<>();
        for (Transaction txn : transactions.values()) {
            if (userId.equals(txn.getSenderId()) ||
                userId.equals(txn.getReceiverId())) {
                list.add(txn);
            }
        }
        list.sort((a, b) ->
                Long.compare(b.getCreatedAt(), a.getCreatedAt())
        );
        return list;
    }
    private void persistTransactions() {
        PersistenceManager.saveTransactions(transactions);
    }
    private void persistAll() {
        userManager.persistUsers();
        persistTransactions();
    }
    private void loadTransactions() {
        Map<String, Transaction> loaded =
                PersistenceManager.loadTransactions();
        if (loaded != null) {
            transactions.putAll(loaded);
        }
    }
}