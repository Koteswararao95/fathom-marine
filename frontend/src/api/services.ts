import API from './axios';

export const getShips = () => API.get('/api/ships');
export const createShip = (data: any) => API.post('/api/ships', data);
export const updateShip = (id: string, data: any) => API.put(`/api/ships/${id}`, data);
export const deleteShip = (id: string) => API.delete(`/api/ships/${id}`);

export const getMaintenanceTasks = (params?: any) => API.get('/api/maintenance', { params });
export const createMaintenanceTask = (data: any) => API.post('/api/maintenance', data);
export const updateMaintenanceTask = (id: string, data: any) => API.put(`/api/maintenance/${id}`, data);
export const deleteMaintenanceTask = (id: string) => API.delete(`/api/maintenance/${id}`);

export const getDrills = (params?: any) => API.get('/api/drills', { params });
export const createDrill = (data: any) => API.post('/api/drills', data);
export const updateDrill = (id: string, data: any) => API.put(`/api/drills/${id}`, data);
export const attendDrill = (id: string) => API.put(`/api/drills/${id}/attend`);
export const deleteDrill = (id: string) => API.delete(`/api/drills/${id}`);

export const getCompliance = () => API.get('/api/compliance');
export const getShipCompliance = (shipId: string) => API.get(`/api/compliance/ship/${shipId}`);

export const getUsers = (params?: any) => API.get('/api/users', { params });
export const loginUser = (data: any) => API.post('/api/auth/login', data);
export const registerUser = (data: any) => API.post('/api/auth/register', data);