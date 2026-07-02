'use client';
import { useState, useEffect } from 'react';
import { tasasService } from '../service/tasasService';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export default function Dashboard({ initialTasas }: { initialTasas: any }) {
  // Ajuste: Accedemos a initialTasas.data porque el JSON lo envuelve así
  const tasas = initialTasas?.data; 
  
  // SOLUCIÓN: Cambiamos <HistorialData[]> por <any[]> para calmar a TypeScript en Vercel
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasasService.getHistory().then((data) => {
      // Ajuste: Si el historial también viene envuelto, usa data.data
      setHistorial(Array.isArray(data) ? data : (data?.data || []));
      setLoading(false);
    });
  }, []);

  if (!tasas) return <div>Error: No se recibieron datos de tasas.</div>;

  return (
    <main className="min-h-screen bg-[#0B111E] text-[#e2e8f0] flex flex-col items-center p-4">
      {/* TARJETA 1: DÓLAR BCV */}
      <div className="w-full bg-[#162235]/60 border border-[#23334c] rounded-2xl p-5 flex items-center justify-between">
        <span className="text-xs font-bold text-[#3b82f6]">Dólar BCV</span>
        <div className="text-2xl font-semibold text-white">
          Bs. {tasas.oficial?.usd?.toFixed(2) || '0.00'}
        </div>
      </div>

      {/* TARJETA 3: DÓLAR USDT */}
      <div className="w-full bg-[#162235]/60 border border-[#23334c] rounded-2xl p-5 flex items-center justify-between mt-4">
        <span className="text-xs font-bold text-[#00C566]">Dólar USDT</span>
        
        <div className="w-20 h-8">
          {loading ? (
             <span className="text-[10px] text-gray-500">Cargando...</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historial}>
                <YAxis domain={['auto', 'auto']} hide />
                <Line type="monotone" dataKey="binance" stroke="#00C566" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="text-2xl font-semibold text-white">
          Bs. {tasas.mercado_real?.usdt_ves?.toFixed(2) || '0.00'}
        </div>
      </div>
    </main>
  );
}