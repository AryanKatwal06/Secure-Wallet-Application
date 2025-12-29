public class FraudCheckResult {
    private final boolean allowed;
    private final String reason;
    private FraudCheckResult(boolean allowed, String reason) {
        this.allowed = allowed;
        this.reason = reason;
    }
    public static FraudCheckResult allowed() {
        return new FraudCheckResult(true, "Allowed");
    }
    public static FraudCheckResult blocked(String reason) {
        return new FraudCheckResult(false, reason);
    }
    public boolean isAllowed() {
        return allowed;
    }
    public String getReason() {
        return reason;
    }
}