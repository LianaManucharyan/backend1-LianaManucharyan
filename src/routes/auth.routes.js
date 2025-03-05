import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const user = req.user;
  const payload = { id: user._id };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 3600 * 1000,
  });

  res.json({ message: 'Autenticación exitosa', token });
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'No autorizado' });
  }
});

export default router;