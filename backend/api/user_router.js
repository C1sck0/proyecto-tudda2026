import { getDependency } from "../dependency.js";
import checkRoleMiddleware from "../middlewares/check_role_middleware.js";

export function configureUserRouter(router) {
    const UserService = getDependency('userService');

    console.log('Configurando rutas de usuario');

    // GET /users - Permitido para admin, barber y user (filtrando según el rol en el servicio)
    router.get('/users', checkRoleMiddleware(['admin', 'barber', 'user']), async (req, res) => {
        try {
            const users = await UserService.getList(req.session.role);
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

    // POST /users - Registrar usuario (Admin o Barber)
    router.post('/users', checkRoleMiddleware(['admin', 'barber']), async (req, res) => {
        try {
            const user = req.body; 
            const newUser = await UserService.add(user, req.session.role);
            res.json({ newUser });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // DELETE /users/:name - Eliminar usuario (Admin o Barber)
    router.delete('/users/:name', checkRoleMiddleware(['admin', 'barber']), async (req, res) => {
        try {
            const name = req.params.name;
            await UserService.deleteByName(name, req.session.role);
            res.json({ message: 'Usuario eliminado' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // PATCH /users/:name - Actualizar usuario (Admin o Barber)
    router.patch('/users/:name', checkRoleMiddleware(['admin', 'barber']), async (req, res) => {
        try {
            const name = req.params.name;
            const user = req.body;
            await UserService.updateByName(name, user, req.session.role);
            res.json({ message: 'Usuario actualizado' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });


    // POST /register - Registro público para nuevos clientes (siempre crea rol 'user')
    router.post('/register', async (req, res) => {
        try {
            const user = req.body;
            const newUser = await UserService.add(user, 'barber'); // Fuerza role = 'user'
            res.json({ newUser });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}