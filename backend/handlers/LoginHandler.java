package handlers;
import core.User;
import core.UserManager;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.util.Map;
public class LoginHandler extends BaseHandler {
    private final UserManager userManager;
    public LoginHandler(UserManager userManager) {
        this.userManager = userManager;
    }
    @Override
    protected void handleRequest(HttpExchange exchange) throws IOException {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed");
            return;
        }
        try {
            Map<String, String> body = parseRequestBody(exchange);
            String username = body.get("username");
            String pin = body.get("pin");
            UserManager.LoginResult result =
                    userManager.loginUser(username, pin);
            if (!result.isSuccess()) {
                sendJsonResponse(
                        exchange,
                        401,
                        "{"
                                + "\"success\":false,"
                                + "\"message\":\"" + result.getMessage() + "\""
                                + "}"
                );
                return;
            }
            User user = userManager.getUser(result.getUserId());
            sendJsonResponse(
                    exchange,
                    200,
                    "{"
                            + "\"success\":true,"
                            + "\"message\":\"" + result.getMessage() + "\","
                            + "\"userId\":\"" + result.getUserId() + "\","
                            + "\"token\":\"" + result.getToken() + "\","
                            + "\"username\":\"" + user.getUsername() + "\","
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