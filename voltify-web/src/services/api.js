import axios from 'axios';
import { notify } from './notify';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Giden istek interceptor'ı: varsa JWT Bearer token ekle
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('voltify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Backend hata gövdesinden kullanıcı dostu mesaj çıkar.
// { message: "..." } veya validasyon haritası { field: "mesaj" } destekler.
function extractMessage(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  const values = Object.values(data);
  if (values.length > 0 && typeof values[0] === 'string') return values[0];
  return null;
}

// Gelen yanıt interceptor'ı: hataları global olarak yakala, ham stack trace'i
// bastır ve kullanıcıya toast göster (Şartname NFR 5.1.2).
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Süresi dolmuş oturumu temizle (login yönlendirmesi sayfa tarafında)
        localStorage.removeItem('voltify_token');
        localStorage.removeItem('voltify_user');
      } else if (status !== 404) {
        // 404'ler genelde sayfa tarafında ele alınır; diğer hataları bildir
        notify(extractMessage(error.response.data) || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } else if (error.request) {
      notify('Sunucuya ulaşılamıyor. Bağlantınızı kontrol edip tekrar deneyin.');
    }
    return Promise.reject(error);
  }
);

export default API;
