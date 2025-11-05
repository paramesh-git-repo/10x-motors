const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@test.com' && password === '1234') {
    res.json({ success: true, token: 'dummy-jwt-token' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;

