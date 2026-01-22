
export interface Entity {
  id: string;
  x: number;
  y: number;
  type: 'ghost' | 'hero' | 'pumpkin' | 'tree' | 'tombstone';
  health?: number;
  energy?: number;
}

export interface GameState {
  hero: Entity;
  entities: Entity[];
  isExorcismActive: boolean;
  score: number;
  spiritEnergy: number;
  health: number;
}

export interface SpectralAnalysis {
  riskLevel: string;
  strategy: string;
  lore: string;
}
