'use client';
import { useState, useEffect } from 'react';
import type { TasasData } from '@/types/api';

type Moneda = 'USDT' | 'BCV' | 'VES';

export default function Conversor({ data }: { data: TasasData }) {
  const [cantidad, setCantidad] = useState<string>('1');
  const [desde, setDesde] = useState<Moneda>('USDT');
  const [hasta, setHasta] = useState<Moneda>('VES');
  const [resultado, setResultado] = useState<number>(0);

  // Obtener tasas de la API
  const tasaUSDT = data?.mercado_real?.usdt_ves || 1;
  const tasaBCV = data?.oficial?.usd || 1;

  useEffect(() => {
    const num = parseFloat(cantidad) || 0;
    if (num === 0) {
      setResultado(0);
      return;
    }

    // Convertir todo primero a una base común (Bolívares)
    let montoEnVES = 0;
    if (desde === 'VES') montoEnVES = num;
    else if (desde === 'USDT') montoEnVES = num * tasaUSDT;
    else if (desde === 'BCV') montoEnVES = num * tasaBCV;

    // Convertir de la base común a la moneda destino
    let final = 0;
    if (hasta === 'VES') final = montoEnVES;
    else if (hasta === 'USDT') final = montoEnVES / tasaUSDT;
    else if (hasta === 'BCV') final = montoEnVES / tasaBCV;

    setResultado(final);
  }, [cantidad, desde, hasta, tasaUSDT, tasaBCV]);

  // Intercambiar origen por destino
  const handleSwap = () => {
    setDesde(hasta);
    setHasta(desde);
  };

  // Obtener la tasa informativa que se muestra abajo
  const getTasaInformativa = () => {
    if (desde === 'USDT' && hasta === 'VES') return `1 USDT = ${tasaUSDT.toFixed(2)} Bs`;
    if (desde === 'BCV' && hasta === 'VES') return `1 USD BCV = ${tasaBCV.toFixed(2)} Bs`;
    if (desde === 'VES' && hasta === 'USDT') return `1 USDT = ${tasaUSDT.toFixed(2)} Bs`;
    if (desde === 'VES' && hasta === 'BCV') return `1 USD BCV = ${tasaBCV.toFixed(2)} Bs`;
    return `Brecha: ${((tasaUSDT / tasaBCV - 1) * 100).toFixed(2)}%`;
  };

  return (
    <div className="bg-[#162235] p-6 rounded-2xl border border-[#23334c] max-w-md mx-auto relative overflow-hidden">
      <h2 className="text-white text-xl font-bold mb-6">Conversor Express</h2>

      <div className="space-y-2 relative">
        {/* BLOQUE ORIGEN (DE) */}
        <div className="bg-[#0B111E] p-4 rounded-xl border border-[#23334c] focus-within:border-blue-500 transition-all">
          <label className="text-gray-400 text-xs block mb-1 font-semibold">Tú envías</label>
          <div className="flex justify-between items-center gap-4">
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-white text-2xl font-bold focus:outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <select
              value={desde}
              onChange={(e) => setDesde(e.target.value as Moneda)}
              className="bg-[#162235] text-white text-sm font-bold py-1.5 px-3 rounded-lg border border-[#23334c] focus:outline-none cursor-pointer"
            >
              <option value="USDT">USDT 🟢</option>
              <option value="BCV">BCV 🔵</option>
              <option value="VES">VES 🇻🇪</option>
            </select>
          </div>
        </div>

        {/* BOTÓN DE INTERCAMBIO FLOTANTE */}
        <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleSwap}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl border-4 border-[#162235] shadow-xl transition-all active:scale-95 group"
          >
            <svg
              className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 8l4-4m-4 4v12m0-12l-4 4" />
            </svg>
          </button>
        </div>

        {/* BLOQUE DESTINO (A) */}
        <div className="bg-[#0B111E] p-4 rounded-xl border border-[#23334c]">
          <label className="text-gray-400 text-xs block mb-1 font-semibold">Tú recibes</label>
          <div className="flex justify-between items-center gap-4">
            <div className="text-emerald-400 text-2xl font-bold truncate">
              {resultado.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <select
              value={hasta}
              onChange={(e) => setHasta(e.target.value as Moneda)}
              className="bg-[#162235] text-white text-sm font-bold py-1.5 px-3 rounded-lg border border-[#23334c] focus:outline-none cursor-pointer"
            >
              <option value="VES">VES 🇻🇪</option>
              <option value="USDT">USDT 🟢</option>
              <option value="BCV">BCV 🔵</option>
            </select>
          </div>
        </div>
      </div>

      {/* METADATOS Y TASA UTILIZADA */}
      <div className="mt-5 pt-4 border-t border-[#23334c] flex justify-between items-center text-xs text-gray-400">
        <span>Tasa de cambio referencial:</span>
        <span className="font-bold text-gray-200 bg-[#0B111E] px-2 py-1 rounded border border-[#23334c]">
          {getTasaInformativa()}
        </span>
      </div>
    </div>
  );
}