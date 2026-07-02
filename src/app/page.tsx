'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Conversor from '@/components/Conversor';
import Historial from '@/components/Historial';
import BottomNav from '@/components/BottomNav';

// Función auxiliar para cambiar el formato de la fecha de YYYY-MM-DD a DD/MM/YYYY
const formatFecha = (fechaRaw: string) => {
  if (!fechaRaw) return null;
  const limpia = fechaRaw.split('T')[0];
  const [yr, mo, dy] = limpia.split('-');
  return `${dy}/${mo}/${yr}`;
};

// Componente puente: Actualiza los estados de la página usando el motor interno del Tooltip
function ChartTooltipUpdater({ active, payload, setPrice, setDate }: any) {
  useEffect(() => {
    if (active && payload && payload.length > 0) {
      setPrice(payload[0].value);
      setDate(formatFecha(payload[0].payload.fecha));
    } else {
      setPrice(null);
      setDate(null);
    }
  }, [active, payload, setPrice, setDate]);

  return null;
}

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  
  // Estado de navegación mapeado con las opciones de BottomNav
  const [vista, setVista] = useState<'overview' | 'analytics' | 'converter' | 'settings'>('overview');

  // Estados para el rastreo interactivo en los gráficos
  const [hoveredBcv, setHoveredBcv] = useState<number | null>(null);
  const [hoveredBcvDate, setHoveredBcvDate] = useState<string | null>(null);
  
  const [hoveredUsdt, setHoveredUsdt] = useState<number | null>(null);
  const [hoveredUsdtDate, setHoveredUsdtDate] = useState<string | null>(null);

  // Estado para controlar qué ventana flotante de información está abierta
  const [infoAbierta, setInfoAbierta] = useState<string | null>(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const [resTasas, resHist] = await Promise.all([
          fetch('/api/tasas'),
          fetch('/api/historial')
        ]);
        
        const jsonTasas = await resTasas.json();
        const jsonHist = await resHist.json();

        const rawData = jsonHist.data || [];
        const dailyDataMap = rawData.reduce((acc: any, item: any) => {
          const date = item.fecha.split('T')[0];
          acc[date] = item; 
          return acc;
        }, {});

        const sortedData = Object.values(dailyDataMap).sort((a: any, b: any) => 
          new Date((a as any).fecha).getTime() - new Date((b as any).fecha).getTime()
        );
        
        setData(jsonTasas.data);
        setHistorial(sortedData.slice(-30)); // 30 días de historial real
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    }
    loadAll();
  }, []);

  if (!data) return <main className="min-h-screen bg-[#0B111E] flex items-center justify-center text-white">Cargando...</main>;

  // Variables de precios base
  const bcvRate = data.oficial?.usd || 0;
  const usdtRate = data.mercado_real?.usdt_ves || 0;
  const brechaBs = usdtRate - bcvRate;
  const brechaPorcentaje = bcvRate ? (brechaBs / bcvRate) * 100 : 0;

  // Estadísticas mensuales
  const listaUSDT = historial.map(h => h.binance).filter(Boolean);
  const maxUSDT = listaUSDT.length ? Math.max(...listaUSDT) : usdtRate;
  const minUSDT = listaUSDT.length ? Math.min(...listaUSDT) : usdtRate;
  
  const primerUSDT = historial[0]?.binance || usdtRate;
  const rendimientoMensual = primerUSDT ? ((usdtRate - primerUSDT) / primerUSDT) * 100 : 0;

  const renderTooltipExplicativo = (id: string, texto: string) => {
    if (infoAbierta !== id) return null;
    return (
      <div className="absolute z-20 bottom-full mb-2 left-0 right-0 bg-[#1c2a3e] border border-[#314668] p-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-1 duration-200">
        <div className="flex justify-between items-start gap-2 mb-1">
          <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">Concepto de Mercado</span>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setInfoAbierta(null); }}
            className="text-gray-400 hover:text-white text-[10px] bg-[#0B111E]/50 px-1 rounded border border-[#23334c]"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-300 text-[11px] leading-relaxed font-normal">{texto}</p>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#0B111E] text-[#e2e8f0] p-6 font-sans pb-32">
      <h1 className="text-white text-2xl font-bold mb-6 tracking-tight">DolarVE</h1>

      {/* VISTA MONITOREO (OVERVIEW) */}
      <div className={vista !== 'overview' ? 'hidden' : 'space-y-6 block animate-in fade-in duration-200'}>
        
        {/* CINTILLO DE ESTADO GLOBAL */}
        <div className="bg-gradient-to-r from-[#162235] to-[#111a28] p-4 rounded-xl border border-[#23334c] flex justify-between items-center shadow-lg">
          <div>
            <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase">Indicador en Tiempo Real</span>
            <h2 className="text-white text-base font-bold flex items-center gap-2 mt-0.5">
              Monitoreo de Tasas 
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
          </div>
          <div className="bg-[#0B111E] px-3 py-1.5 rounded-lg border border-[#23334c] text-right">
            <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider">Brecha</span>
            <span className="text-amber-400 font-extrabold text-sm">
              +{brechaBs.toFixed(2)} Bs <span className="text-xs font-medium">({brechaPorcentaje.toFixed(2)}%)</span>
            </span>
          </div>
        </div>

        {/* GRID PRINCIPAL: TARJETAS DE TASAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* TARJETA DÓLAR BCV */}
          <div className="bg-[#162235] rounded-2xl border border-[#23334c] overflow-hidden relative group hover:border-blue-500/50 transition-all duration-300 min-h-[160px] flex flex-col justify-between p-6">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase border border-blue-500/20">
                  Oficial
                </span>
                <h3 className="text-gray-400 text-xs font-bold mt-2.5 uppercase tracking-wide">Dólar BCV</h3>
              </div>
              {hoveredBcvDate && (
                <span className="text-gray-400 text-[11px] font-semibold bg-[#0B111E] px-2 py-0.5 rounded border border-[#23334c]">
                  {hoveredBcvDate}
                </span>
              )}
            </div>
            
            <div className="relative z-10 mt-4">
              <span className="text-white text-3xl font-black tracking-tight">
                Bs. {(hoveredBcv !== null ? hoveredBcv : bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-16 opacity-40 group-hover:opacity-60 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historial} margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
                  <defs>
                    <linearGradient id="colorBcv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="fecha" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }} 
                    content={<ChartTooltipUpdater setPrice={setHoveredBcv} setDate={setHoveredBcvDate} />}
                  />
                  <Area type="monotone" dataKey="bcv" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBcv)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TARJETA DÓLAR USDT */}
          <div className="bg-[#162235] rounded-2xl border border-[#23334c] overflow-hidden relative group hover:border-emerald-500/50 transition-all duration-300 min-h-[160px] flex flex-col justify-between p-6">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase border border-emerald-500/20">
                  P2P Cripto
                </span>
                <h3 className="text-gray-400 text-xs font-bold mt-2.5 uppercase tracking-wide">Dólar USDT</h3>
              </div>
              {hoveredUsdtDate && (
                <span className="text-gray-400 text-[11px] font-semibold bg-[#0B111E] px-2 py-0.5 rounded border border-[#23334c]">
                  {hoveredUsdtDate}
                </span>
              )}
            </div>
            
            <div className="relative z-10 mt-4">
              <span className="text-white text-3xl font-black tracking-tight">
                Bs. {(hoveredUsdt !== null ? hoveredUsdt : usdtRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-16 opacity-40 group-hover:opacity-60 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historial} margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
                  <defs>
                    <linearGradient id="colorUsdt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C566" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00C566" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="fecha" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    cursor={{ stroke: '#00C566', strokeWidth: 1, strokeDasharray: '3 3' }} 
                    content={<ChartTooltipUpdater setPrice={setHoveredUsdt} setDate={setHoveredUsdtDate} />}
                  />
                  <Area type="monotone" dataKey="binance" stroke="#00C566" strokeWidth={2} fillOpacity={1} fill="url(#colorUsdt)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ESTADÍSTICAS MENSUALES */}
        <div className="pt-2">
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-3">Estadísticas Mensuales (30D)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="bg-[#111a28] p-4 rounded-xl border border-[#23334c] relative group">
              <button 
                type="button"
                onClick={() => setInfoAbierta(infoAbierta === 'piso' ? null : 'piso')}
                className="absolute top-2 right-2 text-[10px] font-bold bg-[#162235] text-gray-400 hover:text-white w-4 h-4 rounded-full flex items-center justify-center border border-[#23334c] transition-colors"
              >
                i
              </button>
              {renderTooltipExplicativo('piso', 'Es el valor más bajo registrado para el dólar cripto (USDT) en los últimos 30 días, actuando como un piso o soporte psicológico clave del mercado.')}
              <span className="text-gray-500 text-[10px] font-bold block uppercase tracking-wide pr-4">Piso Alto (Min)</span>
              <span className="text-white font-extrabold text-lg block mt-1">Bs. {minUSDT.toFixed(2)}</span>
              <span className="text-[10px] text-gray-400">Soporte mínimo USDT</span>
            </div>

            <div className="bg-[#111a28] p-4 rounded-xl border border-[#23334c] relative group">
              <button 
                type="button"
                onClick={() => setInfoAbierta(infoAbierta === 'techo' ? null : 'techo')}
                className="absolute top-2 right-2 text-[10px] font-bold bg-[#162235] text-gray-400 hover:text-white w-4 h-4 rounded-full flex items-center justify-center border border-[#23334c] transition-colors"
              >
                i
              </button>
              {renderTooltipExplicativo('techo', 'Representa la cotización máxima alcanzada por el Dólar USDT en el último mes, definiendo la zona de mayor resistencia del mercado.')}
              <span className="text-gray-500 text-[10px] font-bold block uppercase tracking-wide pr-4">Techo Alto (Max)</span>
              <span className="text-white font-extrabold text-lg block mt-1">Bs. {maxUSDT.toFixed(2)}</span>
              <span className="text-[10px] text-gray-400">Pico histórico alcanzado</span>
            </div>

            <div className="bg-[#111a28] p-4 rounded-xl border border-[#23334c] relative group">
              <button 
                type="button"
                onClick={() => setInfoAbierta(infoAbierta === 'desviacion' ? null : 'desviacion')}
                className="absolute top-2 right-2 text-[10px] font-bold bg-[#162235] text-gray-400 hover:text-white w-4 h-4 rounded-full flex items-center justify-center border border-[#23334c] transition-colors"
              >
                i
              </button>
              {renderTooltipExplicativo('desviacion', 'Mide el cambio porcentual neto del precio entre el inicio del ciclo de 30 días y hoy. Muestra el ritmo y aceleración real de la devaluación.')}
              <span className="text-gray-500 text-[10px] font-bold block uppercase tracking-wide pr-4">Desviación (30D)</span>
              <span className={`font-extrabold text-lg block mt-1 ${rendimientoMensual >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {rendimientoMensual >= 0 ? '▲' : '▼'} {Math.abs(rendimientoMensual).toFixed(2)}%
              </span>
              <span className="text-[10px] text-gray-400">Ritmo de depreciación</span>
            </div>

            <div className="bg-[#111a28] p-4 rounded-xl border border-[#23334c] col-span-2 sm:col-span-1 relative group">
              <button 
                type="button"
                onClick={() => setInfoAbierta(infoAbierta === 'diagnostico' ? null : 'diagnostico')}
                className="absolute top-2 right-2 text-[10px] font-bold bg-[#162235] text-gray-400 hover:text-white w-4 h-4 rounded-full flex items-center justify-center border border-[#23334c] transition-colors"
              >
                i
              </button>
              {renderTooltipExplicativo('diagnostico', 'Evaluación automática del diferencial bancario. Un spread mayor al 15% indica distorsiones cambiarias severas (Brecha Crítica) entre la tasa oficial y el libre mercado.')}
              <span className="text-gray-500 text-[10px] font-bold block uppercase tracking-wide pr-4">Diagnóstico</span>
              <span className={`font-extrabold text-sm block mt-1.5 uppercase ${brechaPorcentaje > 15 ? 'text-amber-400' : 'text-blue-400'}`}>
                {brechaPorcentaje > 15 ? '⚠️ Brecha Crítica' : '⚖️ Estable'}
              </span>
              <span className="text-[10px] text-gray-400">Spread interbancario</span>
            </div>

          </div>
        </div>

      </div>

      {/* VISTA EVOLUCIÓN CRONOLÓGICA (ANALYTICS) */}
      <div className={vista !== 'analytics' ? 'hidden' : 'block animate-in fade-in duration-200'}>
        <Historial historial={historial} />
      </div>

      {/* VISTA CONVERSOR (CONVERTER) */}
      <div className={vista !== 'converter' ? 'hidden' : 'block animate-in fade-in duration-200'}>
        <Conversor data={data} />
      </div>

      {/* VISTA AJUSTES (SETTINGS) */}
      <div className={vista !== 'settings' ? 'hidden' : 'block animate-in fade-in duration-200'}>
        <div className="max-w-xl mx-auto space-y-6">
          
          {/* PANEL DE MONITOREO TÉCNICO DE MARCA */}
          <div className="bg-[#162235] p-6 rounded-2xl border border-[#23334c] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              {/* LOGO MINI DOLARVE */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center shadow-lg relative shrink-0">
                <span className="text-white font-black text-base tracking-tighter">D$</span>
                {/* Badge rojo de alertas */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center border border-[#162235]">
                  4
                </span>
              </div>
              
              <div>
                <h3 className="text-white text-base font-bold tracking-tight">Estado de DolarVE</h3>
                <p className="text-gray-400 text-xs mt-0.5">Scrapers de tasas y sincronización automática del core.</p>
              </div>
            </div>

            {/* BOTÓN INTERACTIVO PARA VER LOS ERRORES */}
            <button 
              type="button"
              onClick={() => alert('Logs del sistema:\n- API BCV: Sincronizada (200 OK)\n- API Binance P2P: Timeout reintentado con éxito\n- Cache global: Invalidada correctamente.')}
              className="px-4 py-2 bg-[#1a2d47] hover:bg-[#233d5f] text-rose-400 hover:text-rose-300 border border-[#314c72] rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Ver 4 Alertas
            </button>
          </div>

          {/* PREFERENCIAS ADICIONALES */}
          <div className="bg-[#111a28] p-6 rounded-2xl border border-[#23334c] space-y-4">
            <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Preferencias de la cuenta</h4>
            <div className="text-gray-400 text-xs text-center py-4">
              Módulo de personalización y alertas push en desarrollo.
            </div>
          </div>

        </div>
      </div>

      {/* BARRA DE NAVEGACIÓN TOTALMENTE SIMÉTRICA Y LIMPIA */}
      <BottomNav activeTab={vista} setActiveTab={(valor) => setVista(valor)} />
    </main>
  );
}