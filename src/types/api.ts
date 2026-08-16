// Tipos que describen la forma real de las respuestas del backend
// (api-bcv-binance-tracker). Si el backend cambia un nombre de campo,
// TypeScript va a marcar error en el build en vez de fallar silenciosamente
// en producción.

/** Forma del campo "data" que devuelve GET /api/tasas */
export interface TasasData {
  oficial: { usd: number };
  mercado_real: { usdt_ves: number };
  brecha: number;
}

/** Respuesta completa de GET /api/tasas */
export interface TasasResponse {
  success: boolean;
  timestamp: string;
  data: TasasData;
}

/** Un registro individual dentro del array "data" de GET /api/historial */
export interface HistorialItem {
  bcv: number;
  binance: number;
  brecha: number;
  fecha: string;
}

/** Respuesta completa de GET /api/historial */
export interface HistorialResponse {
  success: boolean;
  data: HistorialItem[];
}