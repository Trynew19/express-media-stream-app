const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

function createStreamToken(mediaId, expiresInSeconds = 600) {
  return jwt.sign({ media_id: mediaId }, jwtSecret, { expiresIn: expiresInSeconds });
}

function verifyStreamToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = { createStreamToken, verifyStreamToken };