import { getDependency } from '../dependency.js';
import checkRoleMiddleware from '../middlewares/check_role_middleware.js';

export function configureUserRouter(router) {
  const userService = getDependency('userService');

  router.get('/users', checkRoleMiddleware(['admin']),  async (req, res) => {
    const users = await userService.getList();
    res.json(users.map(user => ({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    })));
  });

  router.get('/users/:username', checkRoleMiddleware(['admin']),  async (req, res) => {
    const user = await userService.getByUsername(req.params.username);
    res.json({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    });
  });

  router.post('/users', checkRoleMiddleware(['admin']),  async (req, res) => {
    const user = req.body;
    const newUser = await userService.add(user);
    res.json(newUser);
  });

  router.patch('/users/:username', checkRoleMiddleware(['admin']),  async (req, res) => {
    const username = req.params.username;
    const userData = req.body;
    const updatedUser = await userService.update(username, userData);
    res.json(updatedUser);
  });

  router.delete('/users/:username', checkRoleMiddleware(['admin']),  async (req, res) => {
    const username = req.params.username;
    await userService.delete(username);
    res.json({ message: `Usuario ${username} eliminado correctamente` });
  });
}