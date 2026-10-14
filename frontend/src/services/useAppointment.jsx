import useApi from './useApi';

export default function useAppointment() {
  const api = useApi();

  return {
    getAppointments: (options) => api.getJson('/appointments', options),
    addAppointment: (data, options) => api.postJson('/appointments', data, options),
    confirmAppointment: (id, options) => api.putJson(`/appointments/${id}/confirm`, {}, options),
    cancelAppointment: (id, options) => api.putJson(`/appointments/${id}/cancel`, {}, options),
    proposeMove: (id, newDate, options) => api.putJson(`/appointments/${id}/propose-move`, { newDate }, options),
    acceptChange: (id, options) => api.putJson(`/appointments/${id}/accept-change`, {}, options),
  };
}