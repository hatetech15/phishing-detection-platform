import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const RotatingCube = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
      meshRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2.2, 2.2, 2.2]} />
      <meshStandardMaterial
        color="#a0a0a0"
        wireframe
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};

const InnerCube = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x -= delta * 0.6;
      meshRef.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial
        color="#ffffff"
        wireframe
        transparent
        opacity={0.4}
      />
    </mesh>
  );
};

const CyberCube = () => {
  return (
    <div className="w-full h-[350px] md:h-[450px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#888888" />
        <RotatingCube />
        <InnerCube />
      </Canvas>
    </div>
  );
};

export default CyberCube;
