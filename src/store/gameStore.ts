import { create } from 'zustand';
import { GameStore } from '../types';

// Function to check if a path exists from start to goal
const hasValidPath = (maze: number[][], size: number) => {
  const visited = Array(size).fill(0).map(() => Array(size).fill(false));
  const queue: [number, number][] = [[0, 0]];
  visited[0][0] = true;

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    if (x === size - 1 && y === size - 1) return true;

    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (
        newX >= 0 && newX < size &&
        newY >= 0 && newY < size &&
        !visited[newX][newY] &&
        maze[newX][newY] !== 1
      ) {
        queue.push([newX, newY]);
        visited[newX][newY] = true;
      }
    }
  }
  return false;
};

const generateMaze = (size: number, difficulty: number) => {
  let maze: number[][];
  let isValid = false;

  // Adjust obstacle probabilities based on difficulty
  const wallProb = 0.15 + (difficulty * 0.02);
  const pitProb = 0.1 + (difficulty * 0.01);

  while (!isValid) {
    maze = Array(size).fill(0).map(() => Array(size).fill(0));
    
    // Generate obstacles
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (x === 0 && y === 0) continue;
        if (x === size - 1 && y === size - 1) continue;
        
        const rand = Math.random();
        if (rand < wallProb) {
          maze[x][y] = 1;
        } else if (rand < wallProb + pitProb) {
          maze[x][y] = 2;
        }
      }
    }

    // Ensure the edges have fewer obstacles for better pathfinding
    for (let i = 0; i < size; i++) {
      if (Math.random() > 0.3) maze[0][i] = 0;
      if (Math.random() > 0.3) maze[i][size-1] = 0;
    }

    isValid = hasValidPath(maze, size);
  }

  return maze;
};

const MAZE_SIZE = 8;
const ACTIONS = ['up', 'down', 'left', 'right'] as const;
const LEARNING_RATE = 0.7;
const DISCOUNT_FACTOR = 0.95;
const EPSILON = 0.1;
const MOVE_DELAY = 300; // Reduced delay for smoother movement

const createQTable = (() => {
  let cachedTable: Record<string, number[]> | null = null;
  
  return (size: number) => {
    if (!cachedTable) {
      cachedTable = {};
      const totalCells = size * size;
      for (let i = 0; i < totalCells; i++) {
        const x = Math.floor(i / size);
        const y = i % size;
        cachedTable[`${x},${y}`] = [0, 0, 0, 0];
      }
    }
    return JSON.parse(JSON.stringify(cachedTable));
  };
})();

// Function to find the best safe path to goal
const findBestSafePath = (grid: number[][], currentPos: Position, goalPos: Position) => {
  const visited = Array(MAZE_SIZE).fill(0).map(() => Array(MAZE_SIZE).fill(false));
  const queue: Array<{ pos: Position; path: Position[] }> = [];
  queue.push({ pos: currentPos, path: [currentPos] });
  visited[currentPos.y][currentPos.x] = true;

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    if (pos.x === goalPos.x && pos.y === goalPos.y) {
      return path[1] || pos; // Return next position in the path
    }

    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }   // right
    ];

    for (const { dx, dy } of directions) {
      const newX = pos.x + dx;
      const newY = pos.y + dy;

      if (
        newX >= 0 && newX < MAZE_SIZE &&
        newY >= 0 && newY < MAZE_SIZE &&
        !visited[newY][newX] &&
        grid[newY][newX] !== 1 && // Not a wall
        grid[newY][newX] !== 2    // Not a pit
      ) {
        visited[newY][newX] = true;
        queue.push({
          pos: { x: newX, y: newY },
          path: [...path, { x: newX, y: newY }]
        });
      }
    }
  }

  return null; // No safe path found
};

let qTable = createQTable(MAZE_SIZE);
let stuckCounter = 0;
let lastPosition = { x: 0, y: 0 };
let consecutiveSamePosition = 0;
let solveTimeout: NodeJS.Timeout | null = null;
let gameLoopInterval: NodeJS.Timeout | null = null;

export const useGameStore = create<GameStore>((set, get) => ({
  grid: generateMaze(MAZE_SIZE, 0),
  playerPosition: { x: 0, y: 0 },
  previousPosition: { x: 0, y: 0 },
  treasurePosition: { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 },
  isGameOver: false,
  score: 0,
  moves: 0,
  gameStarted: false,
  isTraining: false,
  episodeCount: 0,
  isLearning: true,
  showCongrats: false,
  mazeStats: [],
  currentMazeStartTime: Date.now(),
  pathHistory: [],

  initializeGame: () => {
    if (solveTimeout) clearTimeout(solveTimeout);
    if (gameLoopInterval) clearInterval(gameLoopInterval);

    const difficulty = Math.min(0.5, get().episodeCount * 0.05);
    const newMaze = generateMaze(MAZE_SIZE, difficulty);
    qTable = createQTable(MAZE_SIZE);
    stuckCounter = 0;
    lastPosition = { x: 0, y: 0 };
    consecutiveSamePosition = 0;
    
    set({
      grid: newMaze,
      playerPosition: { x: 0, y: 0 },
      previousPosition: { x: 0, y: 0 },
      treasurePosition: { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 },
      isGameOver: false,
      score: 0,
      moves: 0,
      gameStarted: true,
      isTraining: true,
      showCongrats: false,
      currentMazeStartTime: Date.now(),
      pathHistory: []
    });

    solveTimeout = setTimeout(() => get().startSolving(), 1000);
  },

  movePlayer: (direction) => {
    set((state) => {
      if (!state.gameStarted || state.isGameOver) return state;

      const newPosition = { ...state.playerPosition };
      const previousPosition = { ...state.playerPosition };
      
      switch (direction) {
        case 'up': newPosition.y = Math.max(0, newPosition.y - 1); break;
        case 'down': newPosition.y = Math.min(state.grid.length - 1, newPosition.y + 1); break;
        case 'left': newPosition.x = Math.max(0, newPosition.x - 1); break;
        case 'right': newPosition.x = Math.min(state.grid[0].length - 1, newPosition.x + 1); break;
      }

      if (state.grid[newPosition.y][newPosition.x] === 1) {
        const currentState = `${state.playerPosition.x},${state.playerPosition.y}`;
        const actionIndex = ACTIONS.indexOf(direction);
        qTable[currentState][actionIndex] -= 2; // Increased penalty for hitting walls
        return state;
      }

      const newPathHistory = [...state.pathHistory];
      if (!newPathHistory.some(pos => pos.x === previousPosition.x && pos.y === previousPosition.y)) {
        newPathHistory.push(previousPosition);
      }

      // Handle pit holes differently
      if (state.grid[newPosition.y][newPosition.x] === 2) {
        // Find a safe path to the goal
        const safePath = findBestSafePath(state.grid, state.playerPosition, state.treasurePosition);
        if (safePath) {
          newPosition.x = safePath.x;
          newPosition.y = safePath.y;
        } else {
          // If no safe path, find the nearest safe spot
          let bestDistance = Infinity;
          let bestPosition = { ...newPosition };
          
          for (let x = 0; x < MAZE_SIZE; x++) {
            for (let y = 0; y < MAZE_SIZE; y++) {
              if (state.grid[y][x] === 0) {
                const distanceToGoal = Math.abs(x - state.treasurePosition.x) + 
                                     Math.abs(y - state.treasurePosition.y);
                if (distanceToGoal < bestDistance) {
                  bestDistance = distanceToGoal;
                  bestPosition = { x, y };
                }
              }
            }
          }
          newPosition.x = bestPosition.x;
          newPosition.y = bestPosition.y;
        }
        
        // Apply penalty for falling into a pit
        const currentState = `${state.playerPosition.x},${state.playerPosition.y}`;
        const actionIndex = ACTIONS.indexOf(direction);
        qTable[currentState][actionIndex] -= 1.5;
      }

      if (newPosition.x === lastPosition.x && newPosition.y === lastPosition.y) {
        consecutiveSamePosition++;
        if (consecutiveSamePosition > 5) {
          const validMoves = ACTIONS.filter(action => {
            const testPos = { ...newPosition };
            switch (action) {
              case 'up': testPos.y = Math.max(0, testPos.y - 1); break;
              case 'down': testPos.y = Math.min(state.grid.length - 1, testPos.y + 1); break;
              case 'left': testPos.x = Math.max(0, testPos.x - 1); break;
              case 'right': testPos.x = Math.min(state.grid[0].length - 1, testPos.x + 1); break;
            }
            return state.grid[testPos.y][testPos.x] !== 1 && state.grid[testPos.y][testPos.x] !== 2;
          });
          
          if (validMoves.length > 0) {
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            get().movePlayer(randomMove);
            consecutiveSamePosition = 0;
            return state;
          }
        }
      } else {
        consecutiveSamePosition = 0;
        lastPosition = { ...newPosition };
      }

      const isGameOver = newPosition.x === state.treasurePosition.x && newPosition.y === state.treasurePosition.y;

      const oldDistanceToGoal = Math.abs(state.playerPosition.x - state.treasurePosition.x) + 
                              Math.abs(state.playerPosition.y - state.treasurePosition.y);
      const newDistanceToGoal = Math.abs(newPosition.x - state.treasurePosition.x) + 
                              Math.abs(newPosition.y - state.treasurePosition.y);
      
      const movingTowardsGoal = newDistanceToGoal < oldDistanceToGoal;
      const scoreChange = movingTowardsGoal ? 1 : -1;

      if (isGameOver) {
        const completionTime = Date.now() - state.currentMazeStartTime;
        const newStats = [...state.mazeStats, {
          mazeNumber: state.episodeCount + 1,
          moves: state.moves + 1,
          score: state.score + scoreChange + 100,
          timeInSeconds: Math.floor(completionTime / 1000)
        }];

        if (solveTimeout) clearTimeout(solveTimeout);
        if (gameLoopInterval) clearInterval(gameLoopInterval);

        return {
          ...state,
          playerPosition: newPosition,
          previousPosition,
          moves: state.moves + 1,
          score: state.score + scoreChange + 100,
          isGameOver: true,
          showCongrats: true,
          episodeCount: state.episodeCount + 1,
          mazeStats: newStats,
          pathHistory: newPathHistory
        };
      }

      const currentState = `${state.playerPosition.x},${state.playerPosition.y}`;
      const nextState = `${newPosition.x},${newPosition.y}`;
      const actionIndex = ACTIONS.indexOf(direction);
      const reward = scoreChange;

      const maxNextQ = Math.max(...qTable[nextState]);
      qTable[currentState][actionIndex] = (1 - LEARNING_RATE) * qTable[currentState][actionIndex] +
        LEARNING_RATE * (reward + DISCOUNT_FACTOR * maxNextQ);

      return {
        ...state,
        playerPosition: newPosition,
        previousPosition,
        moves: state.moves + 1,
        score: state.score + scoreChange,
        pathHistory: newPathHistory
      };
    });
  },

  startSolving: () => {
    if (gameLoopInterval) clearInterval(gameLoopInterval);

    const solve = async () => {
      const state = get();
      if (state.isGameOver) {
        if (state.episodeCount < 50) {
          solveTimeout = setTimeout(() => {
            get().initializeGame();
          }, 5000);
        }
        return;
      }

      const currentState = `${state.playerPosition.x},${state.playerPosition.y}`;
      let actionIndex = Math.random() < EPSILON ? 
        Math.floor(Math.random() * ACTIONS.length) : 
        qTable[currentState].indexOf(Math.max(...qTable[currentState]));

      get().movePlayer(ACTIONS[actionIndex]);
    };

    gameLoopInterval = setInterval(solve, MOVE_DELAY);
  },

  resetGame: () => {
    if (solveTimeout) clearTimeout(solveTimeout);
    if (gameLoopInterval) clearInterval(gameLoopInterval);

    const newMaze = generateMaze(MAZE_SIZE, 0);
    qTable = createQTable(MAZE_SIZE);
    stuckCounter = 0;
    lastPosition = { x: 0, y: 0 };
    consecutiveSamePosition = 0;
    
    set({
      grid: newMaze,
      playerPosition: { x: 0, y: 0 },
      previousPosition: { x: 0, y: 0 },
      treasurePosition: { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 },
      isGameOver: false,
      score: 0,
      moves: 0,
      gameStarted: false,
      isTraining: false,
      showCongrats: false,
      mazeStats: [],
      pathHistory: []
    });
  },

  exitGame: () => {
    if (solveTimeout) clearTimeout(solveTimeout);
    if (gameLoopInterval) clearInterval(gameLoopInterval);

    set({
      gameStarted: false,
      isGameOver: false,
      showCongrats: false,
      mazeStats: []
    });
  }
}));