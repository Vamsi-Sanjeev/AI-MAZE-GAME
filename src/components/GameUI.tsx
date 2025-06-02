import { Trophy, RotateCcw, Play, Brain, XCircle, Clock, TrendingUp, AlertCircle, Footprints, Target } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const GameUI = () => {
  const { 
    score, 
    moves, 
    isGameOver, 
    resetGame, 
    gameStarted, 
    initializeGame,
    episodeCount,
    showCongrats,
    mazeStats,
    exitGame,
    grid,
    playerPosition,
    treasurePosition
  } = useGameStore();

  // Check if there's a valid path to the goal
  const hasValidPath = () => {
    const visited = Array(grid.length).fill(0).map(() => Array(grid[0].length).fill(false));
    const queue = [[playerPosition.x, playerPosition.y]];
    visited[playerPosition.y][playerPosition.x] = true;

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      if (x === treasurePosition.x && y === treasurePosition.y) return true;

      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        if (
          newX >= 0 && newX < grid[0].length &&
          newY >= 0 && newY < grid.length &&
          !visited[newY][newX] &&
          grid[newY][newX] !== 1 && 
          grid[newY][newX] !== 2
        ) {
          queue.push([newX, newY]);
          visited[newY][newX] = true;
        }
      }
    }
    return false;
  };

  const noValidPath = gameStarted && !isGameOver && !hasValidPath();

  return (
    <>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-gray-900/95 to-transparent p-6 text-center">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3 mb-2">
          <Brain className="w-10 h-10" />
          AI Maze Explorer
        </h1>
        <p className="text-gray-300 text-lg">Navigate through mazes using reinforcement learning</p>
      </div>

      {/* Game Stats Panel */}
      <div className="absolute top-32 left-6 bg-gray-900/90 p-6 rounded-2xl shadow-lg border border-blue-500/50 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xl font-semibold text-blue-400">
            <Trophy className="w-7 h-7" />
            <span>Score: {score}</span>
          </div>
          <div className="flex items-center gap-3 text-lg text-gray-300">
            <Footprints className="w-6 h-6" />
            <span>Moves: {moves}</span>
          </div>
          <div className="flex items-center gap-3 text-lg text-blue-400">
            <Target className="w-6 h-6" />
            <span>Maze #{episodeCount + 1}</span>
          </div>
          <button
            className="w-full mt-2 bg-red-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
            onClick={resetGame}
          >
            <RotateCcw className="w-5 h-5" />
            Reset Game
          </button>
        </div>
      </div>

      {/* Stats History Panel */}
      {gameStarted && (
        <div className="absolute top-32 right-6 bg-gray-900/90 p-6 rounded-2xl shadow-lg border border-blue-500/50 backdrop-blur-sm w-80">
          <h3 className="text-xl text-blue-400 font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Maze Statistics
          </h3>
          <div className="bg-gray-800/70 p-3 rounded-xl mb-3">
            <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-gray-400 border-b border-gray-700 pb-2">
              <div>Maze</div>
              <div>Moves</div>
              <div>Score</div>
              <div>Time</div>
            </div>
          </div>
          {mazeStats.length > 0 && (
            <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
              {mazeStats.map((stat, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 p-3 bg-gray-800/50 rounded-xl text-sm">
                  <div className="text-blue-400">#{stat.mazeNumber}</div>
                  <div className="text-gray-300">{stat.moves}</div>
                  <div className="text-green-400">{stat.score}</div>
                  <div className="text-gray-400">{stat.timeInSeconds}s</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Valid Path Warning */}
      {noValidPath && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-red-900/90 p-6 rounded-2xl border-2 border-red-500 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3 text-red-300 text-xl font-semibold mb-3">
              <AlertCircle className="w-8 h-8" />
              No Valid Path Available
            </div>
            <p className="text-gray-300 mb-4">
              The AI cannot find a safe path to the goal in this maze configuration.
            </p>
            <button
              onClick={resetGame}
              className="w-full bg-red-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Generate New Maze
            </button>
          </div>
        </div>
      )}

      {/* Welcome Screen */}
      {!gameStarted && !isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900/95 p-8 rounded-2xl shadow-2xl border border-blue-500/50 max-w-lg mx-4">
            <h1 className="text-4xl font-bold mb-6 text-blue-400 flex items-center justify-center gap-3">
              <Brain className="w-10 h-10" />
              AI Maze Explorer
            </h1>
            <p className="text-lg text-gray-300 mb-6 text-center">
              Watch AI navigate through mazes filled with walls and dangerous pit holes!
            </p>
            <div className="mb-8 p-6 bg-gray-800/50 rounded-xl">
              <h3 className="text-xl text-blue-400 font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                Game Elements
              </h3>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-3 text-red-400">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  Red Ball: AI Player
                </li>
                <li className="flex items-center gap-3 text-green-400">
                  <div className="w-4 h-4 bg-green-500 rotate-45"></div>
                  Green Diamond: Goal
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-4 h-4 bg-white"></div>
                  White Blocks: Walls
                </li>
                <li className="flex items-center gap-3 text-blue-400">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  Blue Holes: Pit Traps
                </li>
              </ul>
            </div>
            <button
              className="w-full bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              onClick={initializeGame}
            >
              <Play className="w-6 h-6" />
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900/95 p-8 rounded-2xl shadow-2xl border border-green-500/50 max-w-md mx-4">
            <div className="text-center">
              <div className="inline-block p-4 bg-green-500/20 rounded-full mb-4">
                <Trophy className="w-16 h-16 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-green-400">Congratulations!</h2>
              <p className="text-xl text-gray-300 mb-6">
                The AI successfully solved Maze #{episodeCount}!
                <br />
                <span className="text-green-400 font-semibold">Score: {score}</span> | 
                <span className="text-blue-400 font-semibold"> Moves: {moves}</span>
              </p>
              <div className="flex gap-4">
                <button
                  className="flex-1 bg-green-500 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  onClick={initializeGame}
                >
                  <Play className="w-5 h-5" />
                  Next Maze
                </button>
                <button
                  className="flex-1 bg-red-500 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  onClick={exitGame}
                >
                  <XCircle className="w-5 h-5" />
                  Exit Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/95 to-transparent p-6">
        <div className="max-w-3xl mx-auto grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-red-500 mx-auto mb-2"></div>
            <div className="text-red-400 font-semibold">AI Player</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-green-500 rotate-45 mx-auto mb-2"></div>
            <div className="text-green-400 font-semibold">Goal</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-white mx-auto mb-2"></div>
            <div className="text-gray-300 font-semibold">Walls</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 mx-auto mb-2"></div>
            <div className="text-blue-400 font-semibold">Pit Traps</div>
          </div>
        </div>
      </div>
    </>
  );
};