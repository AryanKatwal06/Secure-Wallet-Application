package handlers;
import core.UserManager;
import core.WalletSecurityManager;
import core.User;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.util.Map;
public class VerifyPinHandler extends BaseHandler {
    private final UserManager userManager;
    private final WalletSecurityManager securityManager;
    public VerifyPinHandler(
            UserManager userManager,
            WalletSecurityManager securityManager
    ) {
        this.userManager = userManager;
        this.securityManager = securityManager;
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
            String pin = body.get("pin");
            User user = userManager.getUser(userId);
            if (user == null) {
                sendError(exchange, 404, "User not found");
                return;
            }
            boolean valid = securityManager.verifyPin(pin, user.getPinHash());
            sendJsonResponse(
                    exchange,
                    valid ? 200 : 401,
                    "{"
                            + "\"success\":" + valid + ","
                            + "\"message\":\"" + (valid ? "PIN verified" : "Invalid PIN") + "\""
                            + "}"
            );
        } catch (Exception e) {
            e.printStackTrace();
            sendError(exchange, 500, "Internal server error");
        }
    }
}