// O build de produção substitui esta constante pelo valor de API_URL.
declare const __API_URL__: string | undefined;

export const API_URL = typeof __API_URL__ === 'string' ? __API_URL__ : 'http://localhost:3000';
