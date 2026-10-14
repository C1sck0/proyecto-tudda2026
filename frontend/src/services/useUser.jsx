import useApi from './useApi';

export default function useUser() {
  const api = useApi();

  return {
    getUsers: (options) => api.getJson('/users', options),
    getUser: async (username, options) => {
      const users = await api.getJson('/users', options);
      const found = users.find(u => u.username === username);
      if (!found) throw new Error('Usuario no encontrado');
      return { ...found, password: '' };
    },
    deleteUser: (username, options) => api.deleteJson(`/users/${username}`, options),
    updateUser: (username, data, options) => api.patchJson(`/users/${username}`, data, options),
    addUser: (data, options) => api.postJson('/users', data, options),
  };
}