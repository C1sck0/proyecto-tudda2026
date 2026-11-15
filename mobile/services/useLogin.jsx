import useApi from './useApi';

export default function useLogin() {
  const api = useApi();

  async function login(data) {
    return await api.postJson('/login', data);
  }

  return {
    login,
  }
}