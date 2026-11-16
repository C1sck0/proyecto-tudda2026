import { getDependency } from '../dependency.js';
import bcrypt from 'bcrypt';

export class UserService {
    constructor(){
        this.userRepo = getDependency('userRepo');
    }

    async getList(requesterRole = 'admin'){
        const allUsers = await this.userRepo.find();
        if (requesterRole === 'admin') {
            return allUsers;
        }
        // Si es barbero o cliente, no exponemos a los administradores
        return allUsers.filter(u => u.role === 'user' || u.role === 'barber');
    }

    async add(user, requesterRole = 'admin'){
        if (!user.username)
            throw new Error('El nombre es obligatorio');

        if (!user.password)
            throw new Error('La contraseña es obligatoria');

        if (user.password == '1234')
            throw new Error('La contraseña no puede ser 1234');

        // Si lo crea un barbero, forzamos que solo pueda crear clientes ('user')
        if (requesterRole === 'barber') {
            user.role = 'user';
        }

        const existentUser = await this.userRepo.find({
            username: user.username
        });
        if (existentUser.length)
            throw new Error('El nombre de usuario ya existe');

        user.password = await bcrypt.hash(user.password, 10);

        return this.userRepo.create(user);
    }

    async deleteByName(name, requesterRole = 'admin') {
        const user = await this.userRepo.findOne({ username: name });
        if (!user) {
            throw new Error('El usuario no existe');
        }

        if (requesterRole === 'barber' && user.role !== 'user') {
            throw new Error('Un barbero solo tiene permisos para eliminar clientes');
        }

        return await this.userRepo.deleteOne({ username: name });
    }
    
    async updateByName(name, user, requesterRole = 'admin') {
        const existentUser = await this.userRepo.findOne({ username: name });
        if (!existentUser)
            throw new Error('El usuario no existe');

        if (requesterRole === 'barber') {
            if (existentUser.role !== 'user') {
                throw new Error('Un barbero solo tiene permisos para modificar clientes');
            }
            user.role = 'user';
            delete user.username;
        }

        // Si el admin modifica el username, validamos que no exista otro igual
        const newUsername = user.username?.trim();
        if (requesterRole === 'admin' && newUsername && newUsername !== name) {
            const duplicate = await this.userRepo.findOne({ username: newUsername });
            if (duplicate) {
                throw new Error('Ese nombre de usuario ya está en uso');
            }
            user.username = newUsername;
        } else {
            delete user.username;
        }

        if (user.password) {
            if (user.password == '1234')
                throw new Error('La contraseña no puede ser 1234');
            user.password = await bcrypt.hash(user.password, 10);
        } else {
            delete user.password;
        }

        const result = await this.userRepo.updateOne({ username: name }, user);

        // Si cambió el username, actualizamos sus referencias en turnos, notificaciones y sesiones
        if (user.username && user.username !== name) {
            const appointmentRepo = getDependency('appointmentRepo');
            const notificationRepo = getDependency('notificationRepo');
            const sessionRepo = getDependency('sessionRepo');

            if (appointmentRepo) {
                await appointmentRepo.updateMany({ customerName: name }, { customerName: user.username });
                await appointmentRepo.updateMany({ barberUsername: name }, { barberUsername: user.username });
            }
            if (notificationRepo) {
                await notificationRepo.updateMany({ username: name }, { username: user.username });
            }
            if (sessionRepo) {
                await sessionRepo.updateMany({ username: name }, { username: user.username });
            }
        }

        return result;
    }
}