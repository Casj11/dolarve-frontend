// En src/service/tasasService.ts
export const tasasService = {
  getLiveRates: async () => {
    // Al quitar la URL larga y dejar solo /api, Next.js usará el rewrite que acabamos de crear
    const res = await fetch('/api/tasas'); 
    return res.json();
  },
  getHistory: async () => {
    const res = await fetch('/api/historial');
    return res.json();
  }
};