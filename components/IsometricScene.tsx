
import React, { useEffect, useRef } from 'react';
import { Entity } from '../types';

interface IsometricSceneProps {
  entities: Entity[];
  onEntityClick: (id: string) => void;
  isExorcismActive: boolean;
}

export const IsometricScene: React.FC<IsometricSceneProps> = ({ 
  entities, 
  onEntityClick, 
  isExorcismActive 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Isometric projection constants
  const TILE_WIDTH = 120;
  const TILE_HEIGHT = 60;

  const toIso = (x: number, y: number) => {
    return {
      isoX: (x - y) * (TILE_WIDTH / 2),
      isoY: (x + y) * (TILE_HEIGHT / 2)
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 3;

      // Draw Grid/Ground
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Ground texture / Fog effect
      const gradient = ctx.createRadialGradient(0, 0, 100, 0, 0, 1000);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.6, '#0f0f1a');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      
      // Base diamond ground
      ctx.beginPath();
      ctx.moveTo(0, -500);
      ctx.lineTo(800, 0);
      ctx.lineTo(0, 500);
      ctx.lineTo(-800, 0);
      ctx.closePath();
      ctx.fill();

      // Salt Circle around Hero
      ctx.strokeStyle = isExorcismActive ? '#00ffff' : '#ffffff';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.ellipse(0, 0, 100, 50, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 15;
      ctx.shadowColor = isExorcismActive ? '#00ffff' : 'white';
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);

      // Sort entities by their Y position (depth sorting)
      const sortedEntities = [...entities].sort((a, b) => (a.x + a.y) - (b.x + b.y));

      sortedEntities.forEach(ent => {
        const { isoX, isoY } = toIso(ent.x, ent.y);
        
        ctx.save();
        ctx.translate(isoX, isoY);

        if (ent.type === 'hero') {
          // Draw Hero (Simplified Isometric)
          ctx.fillStyle = '#4a5568';
          ctx.beginPath();
          ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          // Body
          ctx.fillStyle = '#2d3748';
          ctx.fillRect(-10, -50, 20, 45);
          // Head
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.arc(0, -60, 12, 0, Math.PI * 2);
          ctx.fill();
          // Crossbow
          ctx.strokeStyle = '#cbd5e0';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(10, -40);
          ctx.lineTo(30, -35);
          ctx.stroke();
        } 
        else if (ent.type === 'ghost') {
          // Draw Ghost
          const floatOffset = Math.sin(Date.now() / 500) * 10;
          ctx.translate(0, floatOffset);
          
          ctx.fillStyle = 'rgba(50, 255, 100, 0.4)';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#32ff64';
          ctx.beginPath();
          ctx.moveTo(-15, 0);
          ctx.lineTo(0, -40);
          ctx.lineTo(15, 0);
          ctx.arc(0, -40, 15, Math.PI, 0);
          ctx.fill();
          // Eyes
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(-5, -45, 2, 0, Math.PI * 2);
          ctx.arc(5, -45, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        else if (ent.type === 'tombstone') {
          ctx.fillStyle = '#4a4a4a';
          ctx.beginPath();
          ctx.roundRect(-15, -40, 30, 45, [10, 10, 0, 0]);
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.strokeText('RIP', -8, -25);
        }
        else if (ent.type === 'pumpkin') {
          ctx.fillStyle = '#ff7a00';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffaa00';
          ctx.beginPath();
          ctx.arc(0, -5, 12, 0, Math.PI * 2);
          ctx.fill();
          // Stem
          ctx.fillStyle = '#2d5a27';
          ctx.fillRect(-2, -18, 4, 6);
          // Glowing Eyes
          ctx.fillStyle = '#ffff00';
          ctx.beginPath();
          ctx.moveTo(-5, -8); ctx.lineTo(-2, -10); ctx.lineTo(-1, -7); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(5, -8); ctx.lineTo(2, -10); ctx.lineTo(1, -7); ctx.fill();
        }
        else if (ent.type === 'tree') {
          ctx.strokeStyle = '#2d1a1a';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-5, -60);
          ctx.stroke();
          // Branches
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-2, -30); ctx.lineTo(-20, -45);
          ctx.moveTo(-3, -45); ctx.lineTo(15, -65);
          ctx.stroke();
        }

        ctx.restore();
      });

      ctx.restore();

      // Atmospheric Fog overlay
      const fog = ctx.createLinearGradient(0, 0, 0, canvas.height);
      fog.addColorStop(0, 'rgba(0,0,0,0)');
      fog.addColorStop(0.8, 'rgba(10, 40, 10, 0.2)');
      fog.addColorStop(1, 'rgba(0, 20, 0, 0.4)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [entities, isExorcismActive]);

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;

    // Inverse isometric projection to find matching entity
    entities.forEach(ent => {
      const { isoX, isoY } = toIso(ent.x, ent.y);
      const absX = centerX + isoX;
      const absY = centerY + isoY;
      
      const dist = Math.sqrt(Math.pow(clickX - absX, 2) + Math.pow(clickY - absY, 2));
      if (dist < 40 && ent.type === 'ghost') {
        onEntityClick(ent.id);
      }
    });
  };

  return (
    <canvas 
      ref={canvasRef} 
      width={window.innerWidth} 
      height={window.innerHeight}
      className="block cursor-crosshair"
      onClick={handleClick}
    />
  );
};
