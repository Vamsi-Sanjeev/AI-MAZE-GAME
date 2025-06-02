import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Maze } from './Maze';
import { Player } from './Player';
import { Treasure } from './Treasure';
import { useGameStore } from '../store/gameStore';
import { Position } from '../types';

const PathTrail = ({ positions }: { positions: Position[] }) => {
  return (
    <group>
      {positions.map((pos, index) => (
        <mesh
          key={`trail-${index}`}
          position={[pos.x, 0.1, pos.y]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.1, 16]} />
          <meshBasicMaterial color="#ff6b6b" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

export const GameScene = () => {
  const resetGame = useGameStore((state) => state.resetGame);
  const pathHistory = useGameStore((state) => state.pathHistory);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return (
    <Canvas shadows className="bg-black">
      <PerspectiveCamera makeDefault position={[12, 12, 12]} />
      <OrbitControls
        target={[3.5, 0, 3.5]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={20}
      />
      
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Maze />
      <PathTrail positions={pathHistory} />
      <Player />
      <Treasure />
    </Canvas>
  );
};