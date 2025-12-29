package core;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
public class UserManager {
    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, String> usernameToUserId = new ConcurrentHashMap<>();
    private final WalletSecurityManager securityManager;
    private final AtomicLong userCounter = new AtomicLong(0);
    public UserManager(WalletSecurityManager securityManager) {
        this.securityManager = securityManager;
        loadUsers();
    }
    public RegistrationResult registerUser(String username, String pin) {
        if (username == null || username.trim().isEmpty()) {
            return new RegistrationResult(false, "Invalid username", null);
        }
        if (pin == null || !pin.matches("\\d{6}")) {
            return new RegistrationResult(false, "PIN must be exactly 6 digits", null);
        }
        if (usernameToUserId.containsKey(username)) {
            return new RegistrationResult(false, "Username already exists", null);
        }
        String userId = generateUserId();
        String pinHash = securityManager.hashPin(pin);
        double initialBankBalance = 50_000 + (Math.random() * 50_000);
        User user = new User(userId, username, pinHash, initialBankBalance);
        users.put(userId, user);
        usernameToUserId.put(username, userId);
        persistUsers();
        return new RegistrationResult(true, "Registration successful", userId);
    }
    public LoginResult loginUser(String username, String pin) {
        if (username == null || pin == null) {
            return new LoginResult(false, "Invalid credentials", null, null);
        }
        String userId = usernameToUserId.get(username);
        if (userId == null) {
            return new LoginResult(false, "User not found", null, null);
        }
        User user = users.get(userId);
        if (user == null) {
            return new LoginResult(false, "User not found", null, null);
        }
        if (!securityManager.verifyPin(pin, user.getPinHash())) {
            return new LoginResult(false, "Invalid PIN", null, null);
        }
        String token = securityManager.generateToken(userId);
        return new LoginResult(true, "Login successful", userId, token);
    }
    public User getUser(String userId) {
        return users.get(userId);
    }
    public User getUserByUsername(String username) {
        String userId = usernameToUserId.get(username);
        return userId != null ? users.get(userId) : null;
    }
    public boolean userExists(String username) {
        return usernameToUserId.containsKey(username);
    }
    private String generateUserId() {
        return "USR_" + System.currentTimeMillis() + "_" + userCounter.incrementAndGet();
    }
    public void persistUsers() {
        PersistenceManager.saveUsers(users, usernameToUserId);
    }
    @SuppressWarnings("unchecked")
    private void loadUsers() {
        Map<String, Object> data = PersistenceManager.loadUsers();
        if (data == null) return;
        Map<String, User> loadedUsers = (Map<String, User>) data.get("users");
        Map<String, String> loadedMapping = (Map<String, String>) data.get("mapping");
        if (loadedUsers != null) users.putAll(loadedUsers);
        if (loadedMapping != null) usernameToUserId.putAll(loadedMapping);
        users.keySet().forEach(id -> {
            String[] parts = id.split("_");
            if (parts.length >= 3) {
                try {
                    long counter = Long.parseLong(parts[2]);
                    userCounter.set(Math.max(userCounter.get(), counter));
                } catch (NumberFormatException ignored) {}
            }
        });
    }
    public static class RegistrationResult {
        private final boolean success;
        private final String message;
        private final String userId;
        public RegistrationResult(boolean success, String message, String userId) {
            this.success = success;
            this.message = message;
            this.userId = userId;
        }
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getUserId() { return userId; }
    }
    public static class LoginResult {
        private final boolean success;
        private final String message;
        private final String userId;
        private final String token;
        public LoginResult(boolean success, String message, String userId, String token) {
            this.success = success;
            this.message = message;
            this.userId = userId;
            this.token = token;
        }
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getUserId() { return userId; }
        public String getToken() { return token; }
    }
}