import axios from 'axios';
import { auth } from './firebaseConfig';

const api = axios.create({
  baseURL: 'http://192.168.18.3:8080', 
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  
  if (user) {
    const token = await user.getIdToken();
    console.log("🔑 Token capturado:", token.substring(0, 15) + "...");
    config.headers.Authorization = `Bearer ${token}`;
  }else {
    console.log("⚠️ NENHUM USUÁRIO LOGADO!");
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;