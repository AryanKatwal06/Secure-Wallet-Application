package handlers;
import core.Transaction;
import core.TransactionEngine;
import core.WalletSecurityManager;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.util.List;
public class TransactionHistoryHandler extends BaseHandler {
    private final TransactionEngine transactionEngine;
    private final WalletSecurityManager securityManager;
    public TransactionHistoryHandler(
            WalletSecurityManager securityManager,
            TransactionEngine transactionEngine
    ) {
        this.securityManager = securityManager;
        this.transactionEngine = transactionEngine;
    }
    @Override
    protected void handleRequest(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed");
            return;
        }
        String token = getAuthToken(exchange);
        if (token == null) {
            sendError(exchange, 401, "Unauthorized");
            return;
        }
        String userId = securityManager.validateToken(token);
        if (userId == null) {
            sendError(exchange, 401, "Invalid token");
            return;
        }
        List<Transaction> transactions =
                transactionEngine.getUserTransactions(userId);
        StringBuilder json = new StringBuilder();
        json.append("{\"success\":true,\"transactions\":[");
        for (int i = 0; i < transactions.size(); i++) {
            Transaction txn = transactions.get(i);
            boolean isSender = userId.equals(txn.getSenderId());
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"transactionId\":\"").append(txn.getTransactionId()).append("\",")
                .append("\"type\":\"").append(txn.getType()).append("\",")
                .append("\"direction\":\"")
                .append(isSender ? "SENT" : "RECEIVED")
                .append("\",")
                .append("\"senderId\":\"")
                .append(txn.getSenderId() == null ? "" : txn.getSenderId())
                .append("\",")
                .append("\"senderUsername\":\"")
                .append(txn.getSenderUsername() == null ? "" : txn.getSenderUsername())
                .append("\",")
                .append("\"receiverId\":\"")
                .append(txn.getReceiverId() == null ? "" : txn.getReceiverId())
                .append("\",")
                .append("\"receiverUsername\":\"")
                .append(txn.getReceiverUsername() == null ? "" : txn.getReceiverUsername())
                .append("\",")
                .append("\"amount\":").append(txn.getAmount()).append(",")
                .append("\"status\":\"").append(txn.getStatus()).append("\",")
                .append("\"createdAt\":").append(txn.getCreatedAt()).append(",")
                .append("\"completedAt\":").append(txn.getCompletedAt())
                .append("}");
        }
        json.append("]}");
        sendJsonResponse(exchange, 200, json.toString());
    }
}