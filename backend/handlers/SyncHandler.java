package handlers;
import core.WalletSecurityManager;
import core.OfflineSyncEngine;
import core.OfflineTransaction;
import core.SyncResult;
import core.SyncedTransaction;
import core.SyncFailure;
import core.Transaction;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
public class SyncHandler extends BaseHandler {
    private final WalletSecurityManager securityManager;
    private final OfflineSyncEngine offlineSyncEngine;
    public SyncHandler(
            WalletSecurityManager securityManager,
            OfflineSyncEngine offlineSyncEngine
    ) {
        this.securityManager = securityManager;
        this.offlineSyncEngine = offlineSyncEngine;
    }
    @Override
    protected void handleRequest(HttpExchange exchange) throws IOException {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed");
            return;
        }
        try {
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
            Map<String, String> body = parseRequestBody(exchange);
            String transactionsJson = body.get("transactions");
            if (transactionsJson == null) {
                sendError(exchange, 400, "Missing transactions");
                return;
            }
            List<OfflineTransaction> offlineTransactions =
                    parseOfflineTransactions(transactionsJson);
            SyncResult result =
                    offlineSyncEngine.syncOfflineTransactions(
                            userId,
                            offlineTransactions
                    );
            sendJsonResponse(
                    exchange,
                    result.isSuccess() ? 200 : 400,
                    buildSyncResponse(result)
            );
        } catch (Exception e) {
            e.printStackTrace();
            sendError(exchange, 500, "Internal server error");
        }
    }
    private List<OfflineTransaction> parseOfflineTransactions(String json) {
        List<OfflineTransaction> list = new ArrayList<>();
        if (json == null || json.isBlank()) return list;
        String trimmed = json.trim();
        if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return list;
        String array = trimmed.substring(1, trimmed.length() - 1);
        List<String> objects = splitJsonObjects(array);
        for (String obj : objects) {
            OfflineTransaction txn = parseSingleOfflineTransaction(obj);
            if (txn != null) list.add(txn);
        }
        return list;
    }
    private OfflineTransaction parseSingleOfflineTransaction(String json) {
        Map<String, String> data = parseSimpleJson(json);
        try {
            return new OfflineTransaction(
                    data.get("clientTransactionId"),
                    Transaction.TransactionType.valueOf(data.get("type")),
                    data.get("receiverId"),
                    Double.parseDouble(data.get("amount")),
                    Long.parseLong(data.get("clientTimestamp")),
                    data.get("signature")
            );
        } catch (Exception e) {
            return null;
        }
    }
    private List<String> splitJsonObjects(String array) {
        List<String> objects = new ArrayList<>();
        int depth = 0;
        int start = -1;
        for (int i = 0; i < array.length(); i++) {
            char c = array.charAt(i);
            if (c == '{') {
                if (depth == 0) start = i;
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0 && start != -1) {
                    objects.add(array.substring(start, i + 1));
                    start = -1;
                }
            }
        }
        return objects;
    }
    private String buildSyncResponse(SyncResult result) {
        StringBuilder json = new StringBuilder();
        json.append("{\"success\":").append(result.isSuccess()).append(",");
        json.append("\"message\":\"").append(result.getMessage()).append("\",");
        json.append("\"syncedTransactions\":[");
        List<SyncedTransaction> synced = result.getSyncedTransactions();
        for (int i = 0; i < synced.size(); i++) {
            if (i > 0) json.append(",");
            SyncedTransaction t = synced.get(i);
            json.append("{")
                    .append("\"clientTransactionId\":\"").append(t.getClientTransactionId()).append("\",")
                    .append("\"serverTransactionId\":\"").append(t.getServerTransactionId()).append("\",")
                    .append("\"type\":\"").append(t.getType()).append("\",")
                    .append("\"amount\":").append(t.getAmount()).append(",")
                    .append("\"newBalance\":").append(t.getNewBalance())
                    .append("}");
        }
        json.append("],");
        json.append("\"failures\":[");
        List<SyncFailure> failures = result.getFailures();
        for (int i = 0; i < failures.size(); i++) {
            if (i > 0) json.append(",");
            SyncFailure f = failures.get(i);
            json.append("{")
                    .append("\"clientTransactionId\":\"").append(f.getClientTransactionId()).append("\",")
                    .append("\"type\":\"").append(f.getType()).append("\",")
                    .append("\"amount\":").append(f.getAmount()).append(",")
                    .append("\"reason\":\"").append(f.getReason()).append("\"")
                    .append("}");
        }
        json.append("]}");
        return json.toString();
    }
}