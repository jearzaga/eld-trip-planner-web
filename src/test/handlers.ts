import { http, HttpResponse } from 'msw';

const API = 'http://localhost:8000/api';

export const handlers = [http.get(`${API}/health/`, () => HttpResponse.json({ status: 'ok' }))];
