import {
  getUserProfile,
  logoutUser,
  registerUser,
  loginUser,
  updateUserProfile,
} from "../services/auth.service.js";
import {
  successResponse,
  errorResponse,
  createdResponse,
} from "../utils/api-response.js";

export const googleAuthCallback = async (req, res) => {
  try {
    const { tokens, user } = req.user;
    res.json({
      success: true,
      message: "Authentication successful",
      tokens,
      user,
    });
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthFailed`);
  }
};

export const manualRegister = async (req, res) => {
  try {
    const result = await registerUser(req, res);
    if (result.success) {
      return createdResponse(res, result.message, result.data);
    } else {
      console.error("Registration Failed:", result);
      return errorResponse(res, 400, result.error || result.message);
    }
  } catch (error) {
    console.error("Registration Error:", error);
    return errorResponse(res, 500, "Internal Server Error", error.message);
  }
};
export const manualLogin = async (req, res) => {
  try {
    const result = await loginUser(req, res);
    if (result.success) {
      return successResponse(res, result.message, result.data);
    } else {
      return errorResponse(res, 400, result.error || result.message);
    }
  } catch (error) {
    console.error("Login Error:", error);
    return errorResponse(res, 500, "Internal Server Error", error.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await getUserProfile(req);
    result.success
      ? successResponse(res, result.message, result.data)
      : errorResponse(res, 400, result.error || result.message);
  } catch (error) {
    errorResponse(res, 500, "Internal Server Error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const result = await updateUserProfile(req);
    if (result.success) {
      return successResponse(res, result.message, result.data);
    } else {
      return errorResponse(res, 400, result.error || result.message);
    }
  } catch (error) {
    errorResponse(res, 500, "Internal Server Error");
  }
};

export const logout = async (req, res) => {
  try {
    const result = await logoutUser(req, res);
    successResponse(res, result.message);
  } catch (error) {
    errorResponse(res, 500, "Internal Server Error");
  }
};
