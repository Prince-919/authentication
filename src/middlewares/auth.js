const { generatedDecodedToken } = require("../utils/authHandler");
const ErrorHandler = require("../utils/errorHandler");

exports.authenticatedRoutes = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ErrorHandler("Token not found.", 401);
    }
    const { err, decoded } = await generatedDecodedToken(token);
    if (err) {
      throw new ErrorHandler("Token invalid or expire.", 401);
    }
    req.user = decoded.data;
    next();
  } catch (error) {
    next(error);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `Role ${req.user.role} is not allowed to access this resource.`,
      });
    }
    next();
  };
};
