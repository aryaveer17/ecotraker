const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" })
  }
}

module.exports = auth
// This middleware checks for a valid JWT token in the Authorization header.