package core;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
public class WalletSecurityManager {
    private static final String HASH_ALGORITHM = "SHA-256";
    private static final String CIPHER_ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final int TOKEN_LENGTH = 32;
    private static final long TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
    private final SecretKey secretKey;
    private final Map<String, SessionToken> activeSessions = new ConcurrentHashMap<>();
    public WalletSecurityManager() {
        this.secretKey = generateSecretKey();
    }
    public String hashPin(String pin) {
        try {
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] hash = digest.digest(pin.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash PIN", e);
        }
    }
    public boolean verifyPin(String pin, String storedHash) {
        return hashPin(pin).equals(storedHash);
    }
    public String generateToken(String userId) {
        byte[] randomBytes = new byte[TOKEN_LENGTH];
        new SecureRandom().nextBytes(randomBytes);
        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
        long expiry = System.currentTimeMillis() + TOKEN_EXPIRY_MS;
        activeSessions.put(token, new SessionToken(userId, expiry));
        cleanupExpiredTokens();
        return token;
    }
    public String validateToken(String token) {
        SessionToken session = activeSessions.get(token);
        if (session == null) return null;
        if (System.currentTimeMillis() > session.expiryTime) {
            activeSessions.remove(token);
            return null;
        }
        return session.userId;
    }
    public void invalidateToken(String token) {
        activeSessions.remove(token);
    }
    private void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        activeSessions.entrySet().removeIf(
                entry -> now > entry.getValue().expiryTime
        );
    }
    private SecretKey generateSecretKey() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(256);
            return keyGen.generateKey();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("AES not supported", e);
        }
    }
    public String encrypt(String data) {
        try {
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            byte[] iv = new byte[16];
            new SecureRandom().nextBytes(iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new IvParameterSpec(iv));
            byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }
    public String decrypt(String encryptedData) {
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedData);
            byte[] iv = new byte[16];
            byte[] encrypted = new byte[combined.length - 16];
            System.arraycopy(combined, 0, iv, 0, 16);
            System.arraycopy(combined, 16, encrypted, 0, encrypted.length);
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }
    private static class SessionToken {
        private final String userId;
        private final long expiryTime;
        SessionToken(String userId, long expiryTime) {
            this.userId = userId;
            this.expiryTime = expiryTime;
        }
    }
}