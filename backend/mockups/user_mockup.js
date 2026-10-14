export class UserMockup {
  users = [
    { id: 1, name: 'Alice', password: '1234' },
    { id: 2, name: 'Bob', password: '1234' },
    { id: 3, name: 'Charlie', password: '1234' },
  ];

  constructor() {
  }

  getList() {
    return this.users;
  }

  add(user) {
    user.id = this.users
      .map(u => u.id)
      .reduce((a, b) => Math.max(a, b), 0) + 1;
    this.users.push(user);
    return user;
  }

  getByName(name) {
    return this.users.find(u => u.name === name);
  }
}