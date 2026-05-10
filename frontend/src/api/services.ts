import API from './axios';

export const getShips = () => API.get('/ships');
export const createShip = (data: any) => API.post('/ships', data);
export const updateShip = (id: string, data: any) => API.put(`/ships/${id}`, data);
export const deleteShip = (id: string) => API.delete(`/ships/${id}`);

export const getMaintenanceTasks = (params?: any) => API.get('/maintenance', { params });
export const createMaintenanceTask = (data: any) => API.post('/maintenance', data);
export const updateMaintenanceTask = (id: string, data: any) => API.put(`/maintenance/${id}`, data);
export const deleteMaintenanceTask = (id: string) => API.delete(`/maintenance/${id}`);

export const getDrills = (params?: any) => API.get('/drills', { params });
export const createDrill = (data: any) => API.post('/drills', data);
export const updateDrill = (id: string, data: any) => API.put(`/drills/${id}`, data);
export const attendDrill = (id: string) => API.put(`/drills/${id}/attend`);
export const deleteDrill = (id: string) => API.delete(`/drills/${id}`);

export const getCompliance = () => API.get('/compliance');
export const getShipCompliance = (shipId: string) => API.get(`/compliance/ship/${shipId}`);

export const getUsers = (params?: any) => API.get('/users', { params });
export const loginUser = (data: any) => API.post('/auth/login', data);
export const registerUser = (data: any) => API.post('/auth/register', data);
