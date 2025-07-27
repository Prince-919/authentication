const jwt = require("jsonwebtoken");
const { config } = require("../config");
async function generateTokens(user) {
  let token = await jwt.sign(
    {
      data: { email: user?.email, id: user._id, role: user.role },
    },
    config.get("jwtSecret"),
    {
      expiresIn: 60 * 60,
    }
  );
  let refreshToken = await jwt.sign(
    {
      data: { email: user?.email, id: user._id, role: user.role },
    },
    config.get("jwtSecret"),
    {
      expiresIn: "7d",
    }
  );
  return { token, refreshToken };
}
const generatedDecodedToken = async (token) => {
  const { err, decoded } = await jwt.verify(
    token,
    config.get("jwtSecret"),
    function (err, decoded) {
      return { err, decoded };
    }
  );
  return { err, decoded };
};
module.exports = { generateTokens, generatedDecodedToken };
