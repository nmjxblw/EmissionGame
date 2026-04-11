import { Piece } from './Piece';
import { Character } from './Character';
import { ElementalStats } from './ElementalStats';

export interface GameState {
  board: Piece[];
  player: Character;
  enemy: Character;
  spellProgress?: ElementalStats;
  timestamp: number;
}
