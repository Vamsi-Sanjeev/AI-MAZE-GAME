import { useGameStore } from '../store/gameStore';
import { Line } from '@react-three/drei';

export const Maze = () => {
  const grid = useGameStore((state) => state.grid);

  return (
    <group>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[grid.length, grid[0].length]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Walls and Pit Holes */}
      {grid.map((row, y) =>
        row.map((cell, x) => {
          if (cell === 1) {
            return (
              <mesh
                key={`wall-${x}-${y}`}
                position={[x, 0.5, y]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.8, 1, 0.8]} />
                <meshStandardMaterial color="#ffffff" emissive="#101010" />
              </mesh>
            );
          }
          if (cell === 2) {
            return (
              <mesh
                key={`pit-${x}-${y}`}
                position={[x, -0.2, y]}
                rotation-x={Math.PI * 0.5}
              >
                <cylinderGeometry args={[0.4, 0.4, 0.4, 32]} />
                <meshStandardMaterial color="#4a9eff" emissive="#1e3f66" />
              </mesh>
            );
          }
          return null;
        })
      )}

      {/* Grid Lines */}
      {grid.map((row, i) => (
        <Line
          key={`horizontal-${i}`}
          points={[[0, 0, i], [grid[0].length, 0, i]]}
          color="#ffffff"
          opacity={0.2}
          transparent
        />
      ))}
      {grid[0].map((_, i) => (
        <Line
          key={`vertical-${i}`}
          points={[[i, 0, 0], [i, 0, grid.length]]}
          color="#ffffff"
          opacity={0.2}
          transparent
        />
      ))}
    </group>
  );
};