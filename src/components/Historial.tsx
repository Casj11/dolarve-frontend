'use client';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { HistorialItem } from '@/types/api';

interface HistorialProps {
  historial: HistorialItem[];
}

// 1. INTERFAZ PARA LAS PROPIEDADES DEL TOOLTIP
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: HistorialItem }>;
  showBcv: boolean;
  showUsdt: boolean;
}

// 2. COMPONENTE TOOLTIP
const CustomTooltip = ({ active, payload, showBcv, showUsdt }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
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
    .filter(item => item.visible)
    .sort((a, b) => b.value - a.value);

    let fechaFormateada = '--/--/----';
    if (data.fecha && typeof data.fecha === 'string') {
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

// Forma del objeto de estadísticas calculado para el reporte mensual
interface EstadisticasMes {
  fechaInicio?: string;
  fechaFin?: string;
  bcvFinal: number;
  varBcv: number;
  varBcvPct: number;
  usdtFinal: number;
  varUsdt: number;
  varUsdtPct: number;
  bcvMax: number;
  bcvMin: number;
  usdtMax: number;
  usdtMin: number;
  promedioBcv: number;
  promedioUsdt: number;
  brechaPromedio: number;
}

// 3. COMPONENTE PRINCIPAL
export default function Historial({ historial }: HistorialProps) {
  const [range, setRange] = useState<'7D' | '1M' | '3M' | '6M' | 'YTD'>('7D');
  const [activePoint, setActivePoint] = useState<HistorialItem | null>(null);

  // Estados de control de capas
  const [showBcv, setShowBcv] = useState(true);
  const [showUsdt, setShowUsdt] = useState(true);

  // Estado para controlar la ventana modal del reporte mensual
  const [showReportModal, setShowReportModal] = useState(false);

  const getFilteredData = (): HistorialItem[] => {
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
        return historial.filter(item => item && item.fecha && item.fecha.startsWith(añoActual));
      default:
        return historial.slice(-7);
    }
  };

  const dataFiltrada = getFilteredData();
  const ultimoPunto: HistorialItem = dataFiltrada[dataFiltrada.length - 1] || { bcv: 0, binance: 0, brecha: 0, fecha: '' };
  const puntoAExhibir = activePoint || ultimoPunto;

  const bcvVal = puntoAExhibir?.bcv || 0;
  const usdtVal = puntoAExhibir?.binance || 0;
  const diferencia = usdtVal - bcvVal;
  const difPorcentaje = bcvVal ? (diferencia / bcvVal) * 100 : 0;

  // Datos fijos de los últimos 30 días para el Reporte Mensual
  const datosUltimoMes: HistorialItem[] = historial ? historial.slice(-30) : [];

  // Cálculos estadísticos para el Reporte Mensual
  const calcularEstadisticasMes = (): EstadisticasMes | null => {
    if (!datosUltimoMes || datosUltimoMes.length === 0) return null;

    const primerDato = datosUltimoMes[0];
    const ultimoDato = datosUltimoMes[datosUltimoMes.length - 1];

    const bcvInicial = primerDato?.bcv || 0;
    const bcvFinal = ultimoDato?.bcv || 0;
    const varBcv = bcvFinal - bcvInicial;
    const varBcvPct = bcvInicial ? (varBcv / bcvInicial) * 100 : 0;

    const usdtInicial = primerDato?.binance || 0;
    const usdtFinal = ultimoDato?.binance || 0;
    const varUsdt = usdtFinal - usdtInicial;
    const varUsdtPct = usdtInicial ? (varUsdt / usdtInicial) * 100 : 0;

    const bcvMax = Math.max(...datosUltimoMes.map(d => d?.bcv || 0));
    const bcvMin = Math.min(...datosUltimoMes.map(d => d?.bcv || Infinity));
    const usdtMax = Math.max(...datosUltimoMes.map(d => d?.binance || 0));
    const usdtMin = Math.min(...datosUltimoMes.map(d => d?.binance || Infinity));

    const promedioBcv = datosUltimoMes.reduce((acc, curr) => acc + (curr?.bcv || 0), 0) / datosUltimoMes.length;
    const promedioUsdt = datosUltimoMes.reduce((acc, curr) => acc + (curr?.binance || 0), 0) / datosUltimoMes.length;
    const brechaPromedio = promedioBcv ? ((promedioUsdt - promedioBcv) / promedioBcv) * 100 : 0;

    return {
      fechaInicio: primerDato?.fecha,
      fechaFin: ultimoDato?.fecha,
      bcvFinal,
      varBcv,
      varBcvPct,
      usdtFinal,
      varUsdt,
      varUsdtPct,
      bcvMax,
      bcvMin: bcvMin === Infinity ? 0 : bcvMin,
      usdtMax,
      usdtMin: usdtMin === Infinity ? 0 : usdtMin,
      promedioBcv,
      promedioUsdt,
      brechaPromedio
    };
  };

  const statsMes = calcularEstadisticasMes();

  // Formateadores de fecha protegidos contra undefined / no-string
  const formatEjeX = (fechaRaw?: string) => {
    if (!fechaRaw || typeof fechaRaw !== 'string') return '';
    const limpia = fechaRaw.split('T')[0];
    const partes = limpia.split('-');
    if (partes.length < 3) return '';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${partes[2]} ${meses[parseInt(partes[1]) - 1]}`;
  };

  const formatFechaCompletaGeneral = (fechaRaw?: string) => {
    if (!fechaRaw || typeof fechaRaw !== 'string') return '--/--/----';
    const limpia = fechaRaw.split('T')[0];
    const partes = limpia.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : '--/--/----';
  };

  // Función para descargar el reporte del último mes en Excel / CSV
  const descargarExcelMes = () => {
    if (datosUltimoMes.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,Fecha,Dolar BCV (Bs),Binance USDT (Bs),Diferencial (Bs),Brecha (%)\n";

    datosUltimoMes.forEach((row) => {
      const f = formatFechaCompletaGeneral(row?.fecha);
      const b = (row?.bcv || 0).toFixed(2);
      const u = (row?.binance || 0).toFixed(2);
      const dif = ((row?.binance || 0) - (row?.bcv || 0)).toFixed(2);
      const pct = row?.bcv ? (((row.binance - row.bcv) / row.bcv) * 100).toFixed(2) : '0.00';
      csvContent += `${f},${b},${u},${dif},${pct}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Mensual_Tasas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#162235] rounded-2xl border border-[#23334c] p-6 shadow-xl space-y-6 max-w-5xl mx-auto relative">
      
      {/* ENCABEZADO Y CONTROLES DE RANGO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase">Analítica Temporal</span>
          <h2 className="text-white text-xl font-black tracking-tight mt-0.5">Evolución de Tasas</h2>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {/* BOTÓN REPORTE MENSUAL */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reporte Mensual
          </button>

          <div className="flex bg-[#0B111E] p-1 rounded-xl border border-[#23334c] gap-1 overflow-x-auto scrollbar-none flex-1 sm:flex-none">
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
            onMouseMove={(e) => {
              // El tipo MouseHandlerDataParam de recharts no incluye
              // "activePayload" pese a que la librería sí lo envía en
              // runtime (problema conocido de sus tipos, no nuestro).
              // Afirmamos acá la forma real, una sola vez, en vez de
              // tipar todo el callback como "any".
              const punto = (
                e as unknown as { activePayload?: Array<{ payload: HistorialItem }> }
              )?.activePayload?.[0]?.payload;
              if (punto) {
                setActivePoint(punto);
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

      {/* MODAL DEL REPORTE MENSUAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#162235] border border-[#23334c] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 border-b border-[#23334c] bg-[#0B111E]">
              <div>
                <h3 className="text-white font-black text-base flex items-center gap-2">
                  <span>📈</span> Reporte de Comportamiento Mensual (30 Días)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Periodo del {formatFechaCompletaGeneral(statsMes?.fechaInicio)} al {formatFechaCompletaGeneral(statsMes?.fechaFin)}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="overflow-y-auto p-4 space-y-5 flex-1">
              
              {/* RESUMEN EJECUTIVO (TARJETAS ANALÍTICAS) */}
              {statsMes && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Tarjeta BCV */}
                  <div className="bg-[#0B111E] p-3.5 rounded-xl border border-[#23334c] space-y-1">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Dólar BCV</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-white font-black text-base">Bs. {statsMes.bcvFinal.toFixed(2)}</span>
                      <span className={`text-xs font-bold ${statsMes.varBcv >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {statsMes.varBcv >= 0 ? '+' : ''}{statsMes.varBcv.toFixed(2)} Bs ({statsMes.varBcvPct.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 pt-1 border-t border-[#23334c]/50 flex justify-between">
                      <span>Mín: Bs. {statsMes.bcvMin.toFixed(2)}</span>
                      <span>Máx: Bs. {statsMes.bcvMax.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Tarjeta USDT */}
                  <div className="bg-[#0B111E] p-3.5 rounded-xl border border-[#23334c] space-y-1">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Binance USDT</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-white font-black text-base">Bs. {statsMes.usdtFinal.toFixed(2)}</span>
                      <span className={`text-xs font-bold ${statsMes.varUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {statsMes.varUsdt >= 0 ? '+' : ''}{statsMes.varUsdt.toFixed(2)} Bs ({statsMes.varUsdtPct.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 pt-1 border-t border-[#23334c]/50 flex justify-between">
                      <span>Mín: Bs. {statsMes.usdtMin.toFixed(2)}</span>
                      <span>Máx: Bs. {statsMes.usdtMax.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Tarjeta Promedios y Brecha */}
                  <div className="bg-[#0B111E] p-3.5 rounded-xl border border-[#23334c] space-y-1">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Brecha Promedio</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-amber-400 font-black text-base">{statsMes.brechaPromedio.toFixed(2)}%</span>
                      <span className="text-[10px] text-gray-400">Promedio Mes</span>
                    </div>
                    <div className="text-[10px] text-gray-400 pt-1 border-t border-[#23334c]/50 flex justify-between">
                      <span>Prom. BCV: {statsMes.promedioBcv.toFixed(2)}</span>
                      <span>Prom. USDT: {statsMes.promedioUsdt.toFixed(2)}</span>
                    </div>
                  </div>

                </div>
              )}

              {/* TABLA DETALLADA DE REGISTROS DEL MES */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Histórico de Registros (Últimos 30 días)</h4>
                
                {datosUltimoMes.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">No hay registros disponibles para el último mes.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[#23334c]">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#0B111E] text-gray-400 uppercase text-[10px] font-bold sticky top-0 border-b border-[#23334c]">
                        <tr>
                          <th className="py-2.5 px-3">Fecha</th>
                          <th className="py-2.5 px-3">Dólar BCV</th>
                          <th className="py-2.5 px-3">Binance USDT</th>
                          <th className="py-2.5 px-3">Diferencial</th>
                          <th className="py-2.5 px-3 text-right">Brecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#23334c]/50 bg-[#162235]">
                        {datosUltimoMes.map((item, idx) => {
                          const b = item?.bcv || 0;
                          const u = item?.binance || 0;
                          const dif = u - b;
                          const pct = b ? (dif / b) * 100 : 0;

                          return (
                            <tr key={idx} className="hover:bg-[#0B111E]/50 transition-colors">
                              <td className="py-2 px-3 font-semibold text-white">
                                {formatFechaCompletaGeneral(item?.fecha)}
                              </td>
                              <td className="py-2 px-3 text-blue-400 font-bold">
                                Bs. {b.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-emerald-400 font-bold">
                                Bs. {u.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-amber-400 font-medium">
                                +{dif.toFixed(2)} Bs
                              </td>
                              <td className="py-2 px-3 text-right text-gray-400 font-medium">
                                {pct.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Footer del Modal con botón opcional de descarga a Excel */}
            <div className="p-4 border-t border-[#23334c] bg-[#0B111E] flex justify-between items-center">
              <span className="text-xs text-gray-400 font-medium">
                Muestra analizada: {datosUltimoMes.length} días
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={descargarExcelMes}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar Excel (.csv)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}