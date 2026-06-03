const jwt = require("jsonwebtoken");

const generateToken = (interviewerId) => {
  return jwt.sign(
    {
      interviewerId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;