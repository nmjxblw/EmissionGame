export type PieceType = 0 | 1 | 2 | 3 | 4;
export type SpecialType = 'none' | 'power' | 'bomb';

export interface Piece {
  id: string;
  type: PieceType;
  special: SpecialType;
  row: number;
  col: number;
}
