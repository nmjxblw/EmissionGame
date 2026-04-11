import { GameState } from './GameState';

export interface SaveSlot {
  id: string;
  state: GameState | null;
}
