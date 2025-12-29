package core;
public class OfflineLimitCheckResult {
    private final boolean allowed;
    private final String reason;
    private OfflineLimitCheckResult(boolean allowed, String reason) {
        this.allowed = allowed;
        this.reason = reason;
    }
    public static OfflineLimitCheckResult allowed() {
        return new OfflineLimitCheckResult(true, null);
    }
    public static OfflineLimitCheckResult blocked(String reason) {
        return new OfflineLimitCheckResult(false, reason);
    }
    public boolean isAllowed() {
        return allowed;
    }
    public String getReason() {
        return reason;
    }
}