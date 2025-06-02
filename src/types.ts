export interface Position {
  x: number;
  y: number;
}

export interface MazeStats {
  mazeNumber: number;
  moves: number;
  score: number;
  timeInSeconds: number;
}

export interface GameState {
  grid: number[][];
  playerPosition: Position;
  previousPosition: Position;
  treasurePosition: Position;
  isGameOver: boolean;
  score: number;
  moves: number;
  gameStarted: boolean;
  isTraining: boolean;
  episodeCount: number;
  isLearning: boolean;
  showCongrats: boolean;
  mazeStats: MazeStats[];
  currentMazeStartTime: number;
  pathHistory: Position[]; // Add path history to track movement
}

export interface GameStore extends GameState {
  initializeGame: () => void;
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  resetGame: () => void;
  startSolving: () => void;
  exitGame: () => void;
}