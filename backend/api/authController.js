import User from "../models/UserModel.js";
import createSecretToken from "../util/SecretToken.js";
import bcryptjs from "bcryptjs";

export const Signup = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, password, username, createdAt } = req.body;
    const existingUserByEmail = await User.findOne({ email });
    const existingUserByUsername = await User.findOne({ username });

    if (existingUserByEmail) {
      return res.json({ message: "Email already exists" });
    } else if (existingUserByUsername) {
      return res.json({ message: "Username already exists" });
    }
    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      domain: ".vercel.app",
      secure: true,
      withCredentials: true,
      httpOnly: false,
    });

    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error(error);
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Incorrect password or email" });
    }
    const auth = await bcryptjs.compare(password, user.password);
    if (!auth) {
      return res.json({ message: "Incorrect password or email" });
    }
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    // next();
    return res.status(201).json({
      message: "User logged in successfully",
      success: true,
      user: user.username,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const Logout = (req, res, next) => {
  try {
    res.clearCookie("token", { withCredentials: true });
    res.json({ message: "User signed out successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
