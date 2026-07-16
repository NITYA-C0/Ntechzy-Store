import jwt from 'jsonwebtoken';

export function signToken(user) {
  const secret = process.env.JWT_SECRET || 'ntechzy-dev-secret-change-me';
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    secret,
    { expiresIn: '7d' }
  );
}

export function authOptional(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const secret = process.env.JWT_SECRET || 'ntechzy-dev-secret-change-me';
      req.user = jwt.verify(header.slice(7), secret);
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

export function authRequired(req, res, next) {
  authOptional(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    next();
  });
}

export function getOwnerQuery(req) {
  if (req.user?.id) {
    return { userId: req.user.id };
  }
  const guestId = req.headers['x-guest-id'];
  if (guestId) {
    return { guestId: String(guestId) };
  }
  return null;
}
