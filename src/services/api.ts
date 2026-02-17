import axios from 'axios';

const api = axios.create({
  // O IP do seu servidor real
  baseURL: 'http://177.153.20.3',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;