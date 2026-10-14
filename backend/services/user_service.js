import { getDependency } from '../dependency.js';
import bcrypt from 'bcrypt';

export class UserService {
  constructor() {
    this.userRepo = getDependency('userRepo');
  }

  async getList() {
    return await this.userRepo.find();
  }

  async getByUsername(username) {
    return await this.userRepo.findOne({ username });
  }

  async add(user) {
    if (!user.username)
      throw new Error('El nombre de usuario es obligatorio');

    if (!user.password)
      throw new Error('La contraseña es obligatoria');

    if (user.password === '1234')
      throw new Error('La contraseña no puede ser 1234');

    const existentUser = await this.userRepo.find({
      username: user.username
    });
    if (existentUser.length)
      throw new Error('El nombre de usuario ya existe');

    user.password = await bcrypt.hash(user.password, 10);

    return this.userRepo.create(user);
  }

  async delete(username) {
    const user = await this.userRepo.findOne({ username });
    if (!user)
      throw new Error('El usuario no existe');

    await this.userRepo.deleteOne({ username });
  }

  async update(username, userData) {
    const user = await this.userRepo.findOne({ username });
    if (!user)
      throw new Error('El usuario no existe');

    if (userData.password) {
      if (userData.password === '1234')
        throw new Error('La contraseña no puede ser 1234');
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    return this.userRepo.updateOne({ username }, userData);
  }
}