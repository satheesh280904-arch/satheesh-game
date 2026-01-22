
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IsometricScene } from './components/IsometricScene';
import { MobileUI } from './components/MobileUI';
import { Entity, GameState, SpectralAnalysis } from './types';
import { getSpectralAnalysis, generateSplashImage } from './services/geminiService';

const INITIAL_ENTITIES: Entity[] = [
  { id: 'hero', x: 0, y: 0, type: 'hero' },
  { id: 'tree-1', x: -2, y: -2, type: 'tree' },
  { id: 'tree-2', x: 2, y: 2, type: 'tree' },
  { id: 'tomb-1', x: -1, y: 2, type: 'tombstone' },
  { id: 'tomb-2', x: 1, y: -2, type: 'tombstone' },
  { id: 'pump-1', x: 2, y: -1, type: 'pumpkin' },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    hero: INITIAL_ENTITIES[0],
    entities: INITIAL_ENTITIES,
    isExorcismActive: false,
    score: 0,
    spiritEnergy: 30,
    health: 100
  });
  const [spectralAnalysis, setSpectralAnalysis] = useState<SpectralAnalysis | null>(null);
  const [wave, setWave] = useState(1);
  const [splashImage, setSplashImage] = useState<string | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const gameLoopRef = useRef<number>();

  // Spawn ghosts logic
  const spawnGhost = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 4 + Math.random() * 2;
    const newGhost: Entity = {
      id: `ghost-${Date.now()}`,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      type: 'ghost'
    };
    setGameState(prev => ({
      ...prev,
      entities: [...prev.entities, newGhost]
    }));
  }, []);

  // Update game world
  useEffect(() => {
    if (!isGameStarted) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const newEntities = prev.entities.map(ent => {
          if (ent.type === 'ghost') {
            // Move ghost toward hero (0,0)
            const dx = 0 - ent.x;
            const dy = 0 - ent.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = 0.02 + (wave * 0.005);
            
            // If ghost hits hero
            if (dist < 0.5) {
              return { ...ent, reachedHero: true };
            }

            return {
              ...ent,
              x: ent.x + (dx / dist) * speed,
              y: ent.y + (dy / dist) * speed
            };
          }
          return ent;
        });

        // Filter out ghosts that reached hero and apply damage
        const hittingGhosts = newEntities.filter((e: any) => e.reachedHero);
        const remainingEntities = newEntities.filter((e: any) => !e.reachedHero);

        return {
          ...prev,
          entities: remainingEntities,
          health: Math.max(0, prev.health - (hittingGhosts.length * 5))
        };
      });
    }, 50);

    const spawner = setInterval(spawnGhost, 3000 - Math.min(2000, wave * 200));

    return () => {
      clearInterval(interval);
      clearInterval(spawner);
    };
  }, [isGameStarted, spawnGhost, wave]);

  // Handle level scaling and AI analysis
  useEffect(() => {
    if (!isGameStarted) return;
    
    const fetchAnalysis = async () => {
      const data = await getSpectralAnalysis(wave);
      setSpectralAnalysis(data);
    };

    fetchAnalysis();
    const interval = setInterval(() => {
      setWave(w => w + 1);
      fetchAnalysis();
    }, 30000); // New wave every 30s

    return () => clearInterval(interval);
  }, [isGameStarted, wave]);

  // Pre-generate splash image
  useEffect(() => {
    const loadSplash = async () => {
      const img = await generateSplashImage("Top-down isometric view of a spooky graveyard level in a 'Kill Ghost' game. A small hero character is surrounded by a circle of glowing salt, firing a silver crossbow at rising green translucent spirits.");
      setSplashImage(img);
    };
    loadSplash();
  }, []);

  const handleEntityClick = (id: string) => {
    setGameState(prev => {
      const isGhost = prev.entities.find(e => e.id === id)?.type === 'ghost';
      if (!isGhost) return prev;

      return {
        ...prev,
        score: prev.score + 10,
        spiritEnergy: Math.min(100, prev.spiritEnergy + 5),
        entities: prev.entities.filter(e => e.id !== id)
      };
    });
  };

  const handleRitual = () => {
    if (gameState.spiritEnergy < 50) return;
    
    setGameState(prev => ({
      ...prev,
      isExorcismActive: true,
      spiritEnergy: prev.spiritEnergy - 50,
      entities: prev.entities.filter(e => {
        if (e.type === 'ghost') {
          const dist = Math.sqrt(e.x * e.x + e.y * e.y);
          return dist > 3; // Clear ghosts near the circle
        }
        return true;
      }),
      score: prev.score + 50
    }));

    setTimeout(() => {
      setGameState(prev => ({ ...prev, isExorcismActive: false }));
    }, 2000);
  };

  if (!isGameStarted) {
    return (
      <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center text-center p-8">
        {splashImage ? (
          <img 
            src={splashImage} 
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" 
            alt="Graveyard Background"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black" />
        )}
        
        <div className="relative z-10">
          <h1 className="text-6xl md:text-8xl text-green-500 font-spooky mb-4 drop-shadow-[0_0_15px_rgba(0,255,0,0.5)]">
            GHOST HUNTER
          </h1>
          <p className="text-white/80 font-medieval text-xl mb-8 max-w-lg">
            Protect the salt circle. Exorcise the rising spirits of the ancient graveyard.
          </p>
          <button 
            onClick={() => setIsGameStarted(true)}
            className="px-12 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-2xl rounded-full border-b-4 border-green-800 transition-all active:translate-y-1"
          >
            ENTER THE GRAVEYARD
          </button>
        </div>
      </div>
    );
  }

  if (gameState.health <= 0) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-7xl text-red-600 font-spooky mb-4">YOU WERE POSSESSED</h1>
        <p className="text-white font-medieval text-2xl mb-8">Souls reaped: {gameState.score}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-red-900 text-white font-bold rounded-lg border-2 border-red-500"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <IsometricScene 
        entities={gameState.entities} 
        onEntityClick={handleEntityClick}
        isExorcismActive={gameState.isExorcismActive}
      />
      <MobileUI 
        health={gameState.health} 
        spiritEnergy={gameState.spiritEnergy} 
        score={gameState.score}
        onRitualClick={handleRitual}
        analysis={spectralAnalysis}
      />
    </div>
  );
};

export default App;
