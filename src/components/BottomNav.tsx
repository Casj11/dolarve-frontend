'use client';
import React from 'react';

interface BottomNavProps {
  activeTab: 'overview' | 'analytics' | 'converter' | 'settings';
  setActiveTab: (tab: 'overview' | 'analytics' | 'converter' | 'settings') => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-6 left-6 right-6 bg-[#111a28]/90 backdrop-blur-md h-20 rounded-2xl flex items-center justify-around border border-[#23334c] shadow-2xl z-40 max-w-5xl mx-auto px-4">
      
      {/* PESTAÑA: MONITOREO */}
      <button 
        type="button"
        onClick={() => setActiveTab('overview')}
        className={`flex flex-col items-center justify-center gap-1 h-full w-20 transition-all ${
          activeTab === 'overview' ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <span className="text-[10px] uppercase tracking-wide">Monitoreo</span>
        {activeTab === 'overview' && <span className="w-4 h-0.5 bg-blue-500 rounded-full" />}
      </button>

      {/* PESTAÑA: EVOLUCIÓN */}
      <button 
        type="button"
        onClick={() => setActiveTab('analytics')}
        className={`flex flex-col items-center justify-center gap-1 h-full w-20 transition-all ${
          activeTab === 'analytics' ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span className="text-[10px] uppercase tracking-wide">Evolución</span>
        {activeTab === 'analytics' && <span className="w-4 h-0.5 bg-blue-500 rounded-full" />}
      </button>

      {/* PESTAÑA: CONVERSOR */}
      <button 
        type="button"
        onClick={() => setActiveTab('converter')}
        className={`flex flex-col items-center justify-center gap-1 h-full w-20 transition-all ${
          activeTab === 'converter' ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span className="text-[10px] uppercase tracking-wide">Conversor</span>
        {activeTab === 'converter' && <span className="w-4 h-0.5 bg-blue-500 rounded-full" />}
      </button>

      {/* PESTAÑA: AJUSTES */}
      <button 
        type="button"
        onClick={() => setActiveTab('settings')}
        className={`flex flex-col items-center justify-center gap-1 h-full w-20 transition-all ${
          activeTab === 'settings' ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-[10px] uppercase tracking-wide">Ajustes</span>
        {activeTab === 'settings' && <span className="w-4 h-0.5 bg-blue-500 rounded-full" />}
      </button>

    </nav>
  );
}