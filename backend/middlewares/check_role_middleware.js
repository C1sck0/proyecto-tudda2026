export default function checkRoleMiddleware(requiredRoles) {
  return (req, res, next) => {
    if (!req.session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!requiredRoles.includes(req.session.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  }
}