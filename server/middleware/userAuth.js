import Jwt from "jsonwebtoken";

export const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies || {};

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access. Login Again",
      });
    }

    const tokenDecode = Jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDecode.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token. Login Again",
      });
    }

    // Ensure req.body exists before assigning userId
    req.body = req.body || {};
    req.body.userId = tokenDecode.id;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};
