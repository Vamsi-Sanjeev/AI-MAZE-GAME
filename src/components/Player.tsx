import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh, Vector3 } from 'three';
import { useGameStore } from '../store/gameStore';

export const Player = () => {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const meshRef = useRef<Mesh>(null);
  const targetPosition = new Vector3(playerPosition.x, 0.3, playerPosition.y);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPosition, 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.3, 0]} castShadow>
      <sphereGeometry args={[0.3]} />
      <meshStandardMaterial color="#ff0000" emissive="#400000" />
    </mesh>
  );
};