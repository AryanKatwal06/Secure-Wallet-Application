package handlers;
import core.UserManager;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.util.Map;
public class RegisterHandler extends BaseHandler {
    private final UserManager userManager;
    public RegisterHandler(UserManager userManager) {
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
            UserManager.RegistrationResult result =
                    userManager.registerUser(username, pin);
            if (result.isSuccess()) {
                sendJsonResponse(
                        exchange,
                        200,
                        "{"
                                + "\"success\":true,"
                                + "\"message\":\"" + result.getMessage() + "\","
                                + "\"userId\":\"" + result.getUserId() + "\""
                                + "}"
                );
            } else {
                sendJsonResponse(
                        exchange,
                        400,
                        "{"
                                + "\"success\":false,"
                                + "\"message\":\"" + result.getMessage() + "\""
                                + "}"
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendError(exchange, 500, "Internal server error");
        }
    }
}