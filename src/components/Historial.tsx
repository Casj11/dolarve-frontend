'use client';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistorialProps {
  historial: any[];
}

// 1. INTERFAZ PARA LAS PROPIEDADES DEL TOOLTIP
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  showBcv: boolean;
  showUsdt: boolean;
}

// 2. COMPONENTE TOOLTIP CORRECAMENTE UBICADO AFUERA (EVITA RE-CREACIÓN EN CADA RENDER)
const CustomTooltip = ({ active, payload, showBcv, showUsdt }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Construimos los elementos de forma reactiva
    const items = [
      {
        id: 'bcv',
        label: 'BCV',
        value: data.bcv || 0,
        color: 'bg-blue-500',
        visible: showBcv
      },
      {
        id: 'usdt',
        label: 'USDT',
        value: data.binance || 0,
        color: 'bg-emerald-500',
        visible: showUsdt
      }
    ]
    // Filtramos los desactivados por el usuario
    .filter(item => item.visible)
    // ORDENAMIENTO DINÁMICO: El más caro siempre se posiciona arriba
    .sort((a, b) => b.value - a.value);

    // Formateador interno y seguro de fecha para el tooltip
    let fechaFormateada = '--/--/----';
    if (data.fecha) {
      const limpia = data.fecha.split('T')[0];
      const partes = limpia.split('-');
      if (partes.length === 3) {
        fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
    }

    return (
      <div className="bg-[#0B111E]/95 border border-[#23334c] p-3 rounded-xl shadow-2xl space-y-2 backdrop-blur-sm min-w-[150px]">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#23334c] pb-1">
          {fechaFormateada}
        </p>
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <span className="text-gray-400 text-[11px] flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} /> {item.label}
              </span>
              <span className="text-white font-black text-[11px]">
                Bs. {item.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// 3. COMPONENTE PRINCIPAL
export default function Historial({ historial }: HistorialProps) {
  const [range, setRange] = useState<'7D' | '1M' | '3M' | '6M' | 'YTD'>('7D');
  const [activePoint, setActivePoint] = useState<any>(null);

  // Estados de control de capas
  const [showBcv, setShowBcv] = useState(true);
  const [showUsdt, setShowUsdt] = useState(true);

  const getFilteredData = () => {
    if (!historial || historial.length === 0) return [];
    
    switch (range) {
      case '7D':
        return historial.slice(-7);
      case '1M':
        return historial.slice(-30);
      case '3M':
        return historial.slice(-90);
      case '6M':
        return historial.slice(-180);
      case 'YTD':
        const añoActual = new Date().getFullYear().toString();
        return historial.filter(item => item.fecha && item.fecha.startsWith(añoActual));
      default:
        return historial.slice(-7);
    }
  };

  const dataFiltrada = getFilteredData();
  const ultimoPunto = dataFiltrada[dataFiltrada.length - 1] || { bcv: 0, binance: 0, fecha: '' };
  const puntoAExhibir = activePoint || ultimoPunto;

  const bcvVal = puntoAExhibir?.bcv || 0;
  const usdtVal = puntoAExhibir?.binance || 0;
  const diferencia = usdtVal - bcvVal;
  const difPorcentaje = bcvVal ? (diferencia / bcvVal) * 100 : 0;

  // Formateadores para la gráfica general
  const formatEjeX = (fechaRaw: string) => {
    if (!fechaRaw) return '';
    const limpia = fechaRaw.split('T')[0];
    const partes = limpia.split('-');
    if (partes.length < 3) return '';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${partes[2]} ${meses[parseInt(partes[1]) - 1]}`;
  };

  const formatFechaCompletaGeneral = (fechaRaw: string) => {
    if (!fechaRaw) return '--/--/----';
    const limpia = fechaRaw.split('T')[0];
    const partes = limpia.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : '--/--/----';
  };

  return (
    <div className="bg-[#162235] rounded-2xl border border-[#23334c] p-6 shadow-xl space-y-6 max-w-5xl mx-auto">
      
      {/* ENCABEZADO Y CONTROLES DE RANGO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase">Analítica Temporal</span>
          <h2 className="text-white text-xl font-black tracking-tight mt-0.5">Evolución de Tasas</h2>
        </div>
        
        <div className="flex bg-[#0B111E] p-1 rounded-xl border border-[#23334c] gap-1 self-stretch sm:self-auto overflow-x-auto scrollbar-none">
          {(['7D', '1M', '3M', '6M', 'YTD'] as const).map((r) => (
            <button
              key={r}
              onClick={() => { setRange(r); setActivePoint(null); }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 uppercase tracking-wide whitespace-nowrap ${
                range === r
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-md'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* MONITOR DE LECTURA DINÁMICA (TARJETAS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-[#0B111E] rounded-xl border border-[#23334c] p-4 gap-4 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#162235]">
        <div className="flex flex-col justify-center">
          <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">Fecha Muestra</span>
          <span className="text-gray-300 font-bold text-sm mt-0.5">
            {formatFechaCompletaGeneral(puntoAExhibir?.fecha)}
          </span>
          <span className="text-[10px] text-blue-400/70 font-medium">
            {activePoint ? '📍 Historial interactivo' : '🔒 Último cierre'}
          </span>
        </div>

        <div className="flex flex-col justify-center pt-3 md:pt-0 md:pl-4">
          <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Dólar BCV
          </span>
          <span className="text-white font-black text-lg mt-0.5">
            Bs. {bcvVal.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col justify-center pt-3 md:pt-0 md:pl-4">
          <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Dólar USDT
          </span>
          <span className="text-white font-black text-lg mt-0.5">
            Bs. {usdtVal.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col justify-center pt-3 md:pt-0 md:pl-4 col-span-2 md:col-span-1">
          <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">Diferencial / Spread</span>
          <span className="text-amber-400 font-black text-lg mt-0.5">
            +{diferencia.toFixed(2)} Bs
          </span>
          <span className="text-[10px] text-gray-400 font-semibold">
            Brecha del ({difPorcentaje.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* FILTROS INTERRUPTORES DE CAPAS */}
      <div className="flex items-center justify-start gap-3 bg-[#0B111E]/40 p-1.5 rounded-xl border border-[#23334c]/60 max-w-xs">
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider pl-1.5">Ver:</span>
        
        <button
          onClick={() => { setShowBcv(!showBcv); setActivePoint(null); }}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-bold border transition-all duration-200 ${
            showBcv ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-sm' : 'bg-transparent border-[#23334c] text-gray-500'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showBcv ? 'bg-blue-500' : 'bg-gray-700'}`} />
          BCV
        </button>

        <button
          onClick={() => { setShowUsdt(!showUsdt); setActivePoint(null); }}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-bold border transition-all duration-200 ${
            showUsdt ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm' : 'bg-transparent border-[#23334c] text-gray-500'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showUsdt ? 'bg-emerald-500' : 'bg-gray-700'}`} />
          USDT
        </button>
      </div>

      {/* ÁREA DE LA GRÁFICA INTERACTIVA */}
      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={dataFiltrada}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onMouseMove={(e: any) => {
              if (e && e.activePayload && e.activePayload.length > 0) {
                setActivePoint(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setActivePoint(null)}
          >
            <defs>
              <linearGradient id="histBCV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.20}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="histUSDT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.20}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#23334c" strokeDasharray="3 3" vertical={false} />
            
            <XAxis 
              dataKey="fecha" 
              tickFormatter={formatEjeX} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
              axisLine={false}
              tickLine={false}
            />
            
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />

            {/* SE PASAN LAS VISIBILIDADES DESDE AQUÍ PARA CLONACIÓN CORRECTA */}
            <Tooltip 
              content={<CustomTooltip showBcv={showBcv} showUsdt={showUsdt} />} 
              cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} 
            />

            <Area
              type="monotone"
              dataKey="bcv"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#histBCV)"
              isAnimationActive={false}
              hide={!showBcv}
            />
            <Area
              type="monotone"
              dataKey="binance"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#histUSDT)"
              isAnimationActive={false}
              hide={!showUsdt}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}