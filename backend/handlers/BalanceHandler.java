package handlers;
import core.User;
import core.UserManager;
import core.WalletSecurityManager;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
public class BalanceHandler extends BaseHandler {
    private final UserManager userManager;
    private final WalletSecurityManager securityManager;
    public BalanceHandler(
            UserManager userManager,
            WalletSecurityManager securityManager
    ) {
        this.userManager = userManager;
        this.securityManager = securityManager;
    }
    @Override
    protected void handleRequest(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
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
            User user = userManager.getUser(userId);
            if (user == null) {
                sendError(exchange, 404, "User not found");
                return;
            }
            sendJsonResponse(
                    exchange,
                    200,
                    "{"
                            + "\"success\":true,"
                            + "\"walletBalance\":" + user.getWalletBalance() + ","
                            + "\"bankBalance\":" + user.getBankBalance()
                            + "}"
            );
        } catch (Exception e) {
            e.printStackTrace();
            sendError(exchange, 500, "Internal server error");
        }
    }
}