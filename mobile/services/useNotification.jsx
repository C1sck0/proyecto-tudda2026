import useApi from './useApi';

export default function useNotification() {
  const api = useApi();

  return {
    getNotifications: (options) => api.getJson('/notifications', options),
    markAsRead: (id, options) => api.putJson(`/notifications/${id}/read`, {}, options),
  };
}