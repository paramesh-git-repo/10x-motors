const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@test.com' && password === '1234') {
    return res.json({ success: true, token: 'dummy-jwt' });
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;

