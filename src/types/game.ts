export interface EmojiPuzzle {
  emoji: string;
  answer: string;
  options: string[];
  type: "movie" | "song";
  hints: string[];
}

export interface GameState {
  currentPuzzle: EmojiPuzzle | null;
  score: number;
  streak: number;
  lives: number;
  gameMode: "movie" | "song" | "mixed";
  isGameActive: boolean;
  timeBonus: number;
  startTime: number;
}

export interface LeaderboardEntry {
  publicKey: string;
  score: number;
  timestamp: number;
  displayName?: string;
}

export type GameMode = "movie" | "song" | "mixed";
export type Screen = "menu" | "game" | "leaderboard";
