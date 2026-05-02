import {
  generateTokens,
  setAccessCookie,
  setRefreshCookie,
  verifyToken,
} from "../services/token.service.js";
import { unauthorizedResponse } from "../utils/api-response.js";

export const authenticateToken = (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken && !refreshToken) {
      return unauthorizedResponse(res, "Authentication required");
    }

    // 1. Try verifying Access Token
    if (accessToken) {
      const decodedAccess = verifyToken(accessToken);
      if (decodedAccess) {
        req.userId = decodedAccess.id;
        return next();
      }
    }

    // 2. If Access Token fails, try Refresh Token
    if (refreshToken) {
      const decodedRefresh = verifyToken(refreshToken);
      if (decodedRefresh) {
        // Regenerate both to maintain security (Rotating Refresh Tokens)
        const tokens = generateTokens(decodedRefresh);

        setAccessCookie(res, tokens.accessToken);
        setRefreshCookie(res, tokens.refreshToken);

        req.userId = decodedRefresh.id;

        console.log("Access token refreshed successfully");
        console.log("New Access Token:", req.userId);
        return next();
      }
    }

    return unauthorizedResponse(res, "Session expired. Please login again.");
  } catch (error) {
    return unauthorizedResponse(res, "Authentication failed");
  }
};
