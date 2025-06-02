import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';

export const Treasure = () => {
  const treasurePosition = useGameStore((state) => state.treasurePosition);
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.3;
    }
  });

  return (
    <mesh
      ref={ref}
      position={[treasurePosition.x, 0.3, treasurePosition.y]}
      castShadow
    >
      <octahedronGeometry args={[0.3]} />
      <meshStandardMaterial color="#00ff00" emissive="#004000" />
    </mesh>
  );
};