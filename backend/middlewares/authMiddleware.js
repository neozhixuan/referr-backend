import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

const userVerification = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("No token found");
    return res.json({ status: false });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      console.log("Error with verifying token");
      return res.json({ status: false });
    } else {
      const user = await User.findById(data.id);
      console.log("Supposed user: ", user);

      if (user) return res.json({ status: true, user: user.username });
      else return res.json({ status: false });
    }
  });
};

export default userVerification;
