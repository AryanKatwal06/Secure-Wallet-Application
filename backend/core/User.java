package core;
import java.io.Serializable;
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final double MAX_TRANSACTION_AMOUNT = 1_000_000.00;
    private final String userId;
    private final String username;
    private final String pinHash;
    private final long createdAt;
    private double walletBalance;
    private double bankBalance;
    private boolean biometricEnabled;
    public User(String userId, String username, String pinHash, double initialBankBalance) {
        this.userId = userId;
        this.username = username;
        this.pinHash = pinHash;
        this.walletBalance = 0.0;
        this.bankBalance = round(initialBankBalance);
        this.createdAt = System.currentTimeMillis();
        this.biometricEnabled = false;
    }
    public synchronized void creditWallet(double amount) {
        validateAmount(amount);
        walletBalance = round(walletBalance + amount);
    }
    public synchronized void debitWallet(double amount) {
        validateAmount(amount);
        if (walletBalance < amount) {
            throw new IllegalStateException("Insufficient wallet balance");
        }
        walletBalance = round(walletBalance - amount);
    }
    public synchronized void creditBank(double amount) {
        validateAmount(amount);
        bankBalance = round(bankBalance + amount);
    }
    public synchronized void debitBank(double amount) {
        validateAmount(amount);
        if (bankBalance < amount) {
            throw new IllegalStateException("Insufficient bank balance");
        }
        bankBalance = round(bankBalance - amount);
    }
    private void validateAmount(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (amount > MAX_TRANSACTION_AMOUNT) {
            throw new IllegalArgumentException("Amount exceeds allowed limit");
        }
    }
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
    public String getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getPinHash() { return pinHash; }
    public long getCreatedAt() { return createdAt; }
    public synchronized double getWalletBalance() {
        return walletBalance;
    }
    public synchronized double getBankBalance() {
        return bankBalance;
    }
    public boolean isBiometricEnabled() {
        return biometricEnabled;
    }
    public void setBiometricEnabled(boolean enabled) {
        this.biometricEnabled = enabled;
    }
    @Override
    public String toString() {
        return "User{" +
                "userId='" + userId + '\'' +
                ", username='" + username + '\'' +
                ", walletBalance=" + walletBalance +
                ", bankBalance=" + bankBalance +
                ", createdAt=" + createdAt +
                '}';
    }
}