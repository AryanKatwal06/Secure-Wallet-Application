import core.*;
import handlers.*;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;
public class WalletServer {
    private static final int DEFAULT_PORT = 8080;
    private final HttpServer server;
    private final WalletSecurityManager securityManager;
    private final UserManager userManager;
    private final TransactionEngine transactionEngine;
    private final OfflineTransactionManager offlineTransactionManager;
    private final OfflineFraudDetector offlineFraudDetector;
    private final OfflineSyncEngine offlineSyncEngine;
    public WalletServer(int port) throws IOException {
        this.server = HttpServer.create(new InetSocketAddress(port), 0);
        this.securityManager = new WalletSecurityManager();
        this.userManager = new UserManager(securityManager);
        this.transactionEngine = new TransactionEngine(userManager);
        this.offlineTransactionManager = new OfflineTransactionManager();
        this.offlineFraudDetector = new OfflineFraudDetector();
        this.offlineSyncEngine = new OfflineSyncEngine(
                transactionEngine,
                userManager,
                offlineTransactionManager,
                offlineFraudDetector
        );
        setupEndpoints();
        server.setExecutor(Executors.newFixedThreadPool(10));
    }
    private void setupEndpoints() {
        server.createContext(
                "/api/auth/register",
                new RegisterHandler(userManager)
        );
        server.createContext(
                "/api/auth/login",
                new LoginHandler(userManager)
        );
        server.createContext(
                "/api/auth/verify-pin",
                new VerifyPinHandler(userManager, securityManager)
        );
        server.createContext(
                "/api/wallet/balance",
                new BalanceHandler(userManager, securityManager)
        );
        server.createContext(
                "/api/wallet/add-money",
                new AddMoneyHandler(securityManager, transactionEngine)
        );
        server.createContext(
                "/api/wallet/withdraw",
                new WithdrawHandler(securityManager, transactionEngine)
        );
        server.createContext(
                "/api/wallet/transfer",
                new TransferHandler(userManager, securityManager, transactionEngine)
        );
        server.createContext(
                "/api/transactions/history",
                new TransactionHistoryHandler(securityManager, transactionEngine)
        );
        server.createContext(
                "/api/bank/balance",
                new BankBalanceHandler(userManager, securityManager)
        );
        server.createContext(
                "/api/offline/sync",
                new SyncHandler(securityManager, offlineSyncEngine)
        );
    }
    public void start() {
        server.start();
        System.out.println("✅ Wallet Server started");
        System.out.println("🌐 Base URL: http://0.0.0.0:" + server.getAddress().getPort());
        System.out.println("🔐 Security enabled");
        System.out.println("🛡️ Fraud detection active");
        System.out.println("📴 Offline sync supported");
    }
    public void stop() {
        server.stop(0);
        System.out.println("🛑 Server stopped");
    }
    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        if (System.getenv("PORT") != null) {
            port = Integer.parseInt(System.getenv("PORT"));
        }
        try {
            WalletServer server = new WalletServer(port);
            server.start();
        } catch (IOException e) {
            System.err.println("❌ Failed to start server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}