package core;
public class OfflineFraudCheckResult {
    private final boolean allowed;
    private final String reason;
    private OfflineFraudCheckResult(boolean allowed, String reason) {
        this.allowed = allowed;
        this.reason = reason;
    }
    public static OfflineFraudCheckResult allowed() {
        return new OfflineFraudCheckResult(true, null);
    }
    public static OfflineFraudCheckResult blocked(String reason) {
        return new OfflineFraudCheckResult(false, reason);
    }
    public boolean isAllowed() {
        return allowed;
    }
    public String getReason() {
        return reason;
    }
}