import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

const userVerification = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({
      status: false,
      message: "No token found",
      user_request: req,
    });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      console.log("Error with verifying token");
      return res.json({
        status: false,
        message: "Error with verifying token",
        error: err,
      });
    } else {
      const user = await User.findById(data.id);

      if (user) return res.json({ status: true, user: user.username });
      else
        return res.json({
          status: false,
          message: "User not found in database",
        });
    }
  });
};

export default userVerification;
