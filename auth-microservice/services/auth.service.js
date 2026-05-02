import User from "../models/user.model.js";
import { errorResponse } from "../utils/api-response.js";
import { comparePassword, hashPassword } from "../utils/password.utils.js";
import {
  generateTokens,
  setAccessCookie,
  setRefreshCookie,
} from "./token.service.js";

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    const hashedPassword = await hashPassword(password);
    // Create new user
    const newUser = new User({
      name: {
        firstName,
        lastName,
      },
      email,
      password: hashedPassword,
    });
    const tokens = generateTokens(newUser);

    setRefreshCookie(res, tokens.refreshToken);
    setAccessCookie(res, tokens.accessToken);
    await newUser.save();
    return {
      success: true,
      message: "User registered successfully",
      data: {
        user: { ...newUser._doc, password: undefined },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Error registering user",
      error: error.message,
    };
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return { success: false, message: "Invalid email or password" };
    }

    const tokens = generateTokens(user);
    setRefreshCookie(res, tokens.refreshToken);
    setAccessCookie(res, tokens.accessToken);

    return {
      success: true,
      message: "User logged in successfully",
      data: {
        user: { ...user._doc, password: undefined },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Error logging in user",
      error: error.message,
    };
  }
};

export const oauthUser = async (profile, res) => {
  try {
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      user = new User({
        name: {
          firstName: profile.firstName,
          lastName: profile.lastName,
        },
        email: profile.email,
        googleId: profile.googleId,
      });
      await user.save();
    }

    const tokens = generateTokens(user);

    setRefreshCookie(res, tokens.refreshToken);
    setAccessCookie(res, tokens.accessToken);

    return {
      success: true,
      message: "User authenticated successfully",
      data: {
        user: { ...user._doc, password: undefined },
      },
    };
  } catch (error) {
    throw new Error("Error authenticating user with Google: " + error.message);
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { name: { firstName, lastName } },
      { returnDocument: "after" },
    );

    console.log("Updating user profile for userId:", userId);
    console.log(user);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return {
      success: true,
      message: "User profile updated successfully",
      data: { user },
    };
  } catch (error) {
    return {
      success: false,
      message: "Error updating user profile",
      error: error.message,
    };
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return {
      success: true,
      message: "User profile retrieved successfully",
      data: { user },
    };
  } catch (error) {
    return {
      success: false,
      message: "Error retrieving user profile",
      error: error.message,
    };
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return {
      success: true,
      message: "User logged out successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error logging out user",
      error: error.message,
    };
  }
};
