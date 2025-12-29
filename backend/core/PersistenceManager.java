package core;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
public class PersistenceManager {
    private static final String DATA_DIR_NAME = "wallet_data";
    private static final Path DATA_DIR =
            Paths.get(System.getProperty("user.dir"), DATA_DIR_NAME);
    private static final Path USERS_FILE = DATA_DIR.resolve("users.dat");
    private static final Path TRANSACTIONS_FILE = DATA_DIR.resolve("transactions.dat");
    static {
        try {
            Files.createDirectories(DATA_DIR);
        } catch (IOException e) {
            throw new RuntimeException("❌ Failed to create data directory", e);
        }
    }
    public static synchronized void saveUsers(
            Map<String, User> users,
            Map<String, String> usernameToUserId
    ) {
        ensureDirectory();
        try (ObjectOutputStream oos =
                     new ObjectOutputStream(Files.newOutputStream(USERS_FILE))) {
            Map<String, Object> data = new HashMap<>();
            data.put("users", users);
            data.put("mapping", usernameToUserId);
            oos.writeObject(data);
        } catch (IOException e) {
            System.err.println("❌ Failed to save users");
            e.printStackTrace();
        }
    }
    @SuppressWarnings("unchecked")
    public static synchronized Map<String, Object> loadUsers() {
        if (!Files.exists(USERS_FILE)) {
            return null;
        }
        try (ObjectInputStream ois =
                     new ObjectInputStream(Files.newInputStream(USERS_FILE))) {
            return (Map<String, Object>) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
            System.err.println("❌ Failed to load users");
            e.printStackTrace();
            return null;
        }
    }
    public static synchronized void saveTransactions(
            Map<String, Transaction> transactions
    ) {
        ensureDirectory();
        try (ObjectOutputStream oos =
                     new ObjectOutputStream(Files.newOutputStream(TRANSACTIONS_FILE))) {
            oos.writeObject(transactions);
        } catch (IOException e) {
            System.err.println("❌ Failed to save transactions");
            e.printStackTrace();
        }
    }
    @SuppressWarnings("unchecked")
    public static synchronized Map<String, Transaction> loadTransactions() {
        if (!Files.exists(TRANSACTIONS_FILE)) {
            return new HashMap<>();
        }
        try (ObjectInputStream ois =
                     new ObjectInputStream(Files.newInputStream(TRANSACTIONS_FILE))) {
            return (Map<String, Transaction>) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
            System.err.println("❌ Failed to load transactions");
            e.printStackTrace();
            return new HashMap<>();
        }
    }
    private static void ensureDirectory() {
        try {
            Files.createDirectories(DATA_DIR);
        } catch (IOException e) {
            throw new RuntimeException("Failed to ensure data directory", e);
        }
    }
}