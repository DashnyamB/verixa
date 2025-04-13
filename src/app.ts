import {
  register,
  login,
  redirectToOAuth,
  handleOAuthCallback,
} from "./controllers/auth.controller";
import myReactSinglePageApp from "../public/index.html";
const server = Bun.serve({
  port: process.env.PORT || 3000,
  routes: {
    "/auth/register": {
      POST: register,
      GET: async (req) => {
        return new Response("Hello from GET /auth/register");
      },
    },
    "/auth/login": {
      POST: login,
    },
    "/oauth": redirectToOAuth,
    "/oauth/callback/:provider": handleOAuthCallback,
    "/": myReactSinglePageApp,
  },
});

console.log(`🚀 Verixa is running on http://localhost:${server.port}`);
