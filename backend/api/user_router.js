import { getDependency } from "../dependency.js";
import checkRoleMiddleware from "../middlewares/check_role_middleware.js";

export function configureUserRouter(router) {
    const UserService = getDependency('userService');

    console.log('Configurando rutas de usuario');

    // GET /users - Listar usuarios (Solo Admin)
    router.get('/users', checkRoleMiddleware(['admin', 'barber', 'user']), async (req, res) => {
        try {
            const users = await UserService.getList();
            res.json(users.map(user => ({ 
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                role: user.role
            })));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // POST /users - Registrar usuario
    router.post('/users',checkRoleMiddleware(['admin']), async (req, res) => {
        try {
            const user = req.body; 
            const newUser = await UserService.add(user);
            res.json({ newUser });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // DELETE /users/:name - Eliminar usuario (Solo Admin)
    router.delete('/users/:name', checkRoleMiddleware(['admin']), async (req, res) => {
        try {
            const name = req.params.name;
            await UserService.deleteByName(name);
            res.json({ message: 'Usuario eliminado' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // PATCH /users/:name - Actualizar usuario (Solo Admin)
    router.patch('/users/:name', checkRoleMiddleware(['admin']), async (req, res) => {
        try {
            const name = req.params.name;
            const user = req.body;
            await UserService.updateByName(name, user);
            res.json({ message: 'Usuario actualizado' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}