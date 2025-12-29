package handlers;
import core.TransactionEngine;
import core.TransactionResult;
import core.WalletSecurityManager;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.util.Map;
public class AddMoneyHandler extends BaseHandler {
    private final TransactionEngine transactionEngine;
    private final WalletSecurityManager securityManager;
    public AddMoneyHandler(
            WalletSecurityManager securityManager,
            TransactionEngine transactionEngine
    ) {
        this.securityManager = securityManager;
        this.transactionEngine = transactionEngine;
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
            double amount = Double.parseDouble(body.get("amount"));
            TransactionResult result =
                    transactionEngine.addMoneyFromBank(userId, amount);
            if (!result.isSuccess()) {
                sendJsonResponse(
                        exchange,
                        400,
                        "{"
                                + "\"success\":false,"
                                + "\"message\":\"" + result.getMessage() + "\""
                                + "}"
                );
                return;
            }
            sendJsonResponse(
                    exchange,
                    200,
                    "{"
                            + "\"success\":true,"
                            + "\"message\":\"" + result.getMessage() + "\","
                            + "\"transactionId\":\"" + result.getTransactionId() + "\","
                            + "\"newBalance\":" + result.getNewBalance()
                            + "}"
            );
        } catch (NumberFormatException e) {
            sendError(exchange, 400, "Invalid amount");
        } catch (Exception e) {
            e.printStackTrace();
            sendError(exchange, 500, "Internal server error");
        }
    }
}