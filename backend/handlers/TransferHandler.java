package handlers;
import core.UserManager;
import core.TransactionEngine;
import core.WalletSecurityManager;
import core.TransactionResult;
import core.User;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.util.Map;
public class TransferHandler extends BaseHandler {
    private final UserManager userManager;
    private final TransactionEngine transactionEngine;
    private final WalletSecurityManager securityManager;
    public TransferHandler(
            UserManager userManager,
            WalletSecurityManager securityManager,
            TransactionEngine transactionEngine
    ) {
        this.userManager = userManager;
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
            String receiverUsername = body.get("receiverUsername");
            if (receiverUsername == null || receiverUsername.isBlank()) {
                sendError(exchange, 400, "Receiver username required");
                return;
            }
            double amount = Double.parseDouble(body.get("amount"));
            User receiver = userManager.getUserByUsername(receiverUsername);
            if (receiver == null) {
                sendError(exchange, 404, "Receiver not found");
                return;
            }
            TransactionResult result =
                    transactionEngine.transfer(
                            userId,
                            receiver.getUserId(),
                            amount
                    );
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