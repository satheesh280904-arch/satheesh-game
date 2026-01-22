
import React from 'react';

interface MobileUIProps {
  health: number;
  spiritEnergy: number;
  score: number;
  onRitualClick: () => void;
  analysis: { riskLevel: string; lore: string } | null;
}

export const MobileUI: React.FC<MobileUIProps> = ({ 
  health, 
  spiritEnergy, 
  score, 
  onRitualClick,
  analysis 
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 z-50">
      {/* Top Bar: Health & Spirit Energy */}
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-2 w-1/3 md:w-1/4">
          {/* Health Bar */}
          <div className="bg-gray-900 border-2 border-red-900 rounded-full h-6 relative overflow-hidden pointer-events-auto">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300" 
              style={{ width: `${health}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">
              HP: {Math.round(health)}
            </span>
          </div>
          {/* Spirit Energy Bar */}
          <div className="bg-gray-900 border-2 border-cyan-900 rounded-full h-6 relative overflow-hidden pointer-events-auto">
            <div 
              className="bg-gradient-to-r from-cyan-600 to-emerald-400 h-full transition-all duration-300" 
              style={{ width: `${spiritEnergy}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">
              SPIRIT: {Math.round(spiritEnergy)}
            </span>
          </div>
        </div>

        <div className="text-right pointer-events-auto">
          <div className="bg-black/60 px-4 py-1 rounded-bl-xl border-l-2 border-b-2 border-green-500">
            <h1 className="text-green-500 font-spooky text-2xl">Graveyard Lv. 1</h1>
            <p className="text-white font-medieval text-sm">Souls Reaped: {score}</p>
          </div>
        </div>
      </div>

      {/* Center Prompt/Warning */}
      {analysis && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center w-full max-w-md px-4">
          <p className="text-red-500 font-bold uppercase tracking-widest animate-pulse drop-shadow-[0_0_5px_red]">
            Warning: {analysis.riskLevel} Spectral Activity Detected
          </p>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex justify-between items-end w-full">
        <div className="w-1/3 md:w-1/4">
          {analysis && (
            <div className="bg-black/80 p-3 border-t-2 border-r-2 border-green-700 rounded-tr-2xl pointer-events-auto max-h-32 overflow-y-auto">
              <h3 className="text-green-400 text-xs font-bold uppercase mb-1">Hunter's Log:</h3>
              <p className="text-white/80 text-[10px] italic leading-tight">{analysis.lore}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={onRitualClick}
            disabled={spiritEnergy < 50}
            className={`
              w-20 h-20 rounded-full border-4 flex items-center justify-center text-center p-2 transition-all pointer-events-auto
              ${spiritEnergy >= 50 
                ? 'bg-emerald-900/40 border-emerald-400 text-white shadow-[0_0_15px_#10b981]' 
                : 'bg-gray-800 border-gray-600 text-gray-500 grayscale cursor-not-allowed'}
            `}
          >
            <span className="font-medieval text-xs leading-none">CAST RITUAL</span>
          </button>
          <div className="bg-black/40 px-3 py-1 rounded text-white/40 text-[8px] pointer-events-auto">
            TAP TARGETS TO EXORCISE
          </div>
        </div>
      </div>
    </div>
  );
};
