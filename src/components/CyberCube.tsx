import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

const CUBE_SIZE = 0.55;
const GAP = 0.08;
const OFFSET = CUBE_SIZE + GAP;

// Monochrome cyber palette
const FACE_COLORS = {
  right: "#e0e0e0",   // light grey
  left: "#808080",     // mid grey
  top: "#ffffff",      // white
  bottom: "#404040",   // dark grey
  front: "#b0b0b0",    // silver
  back: "#606060",     // charcoal
};

const createCubeletMaterials = () => [
  new THREE.MeshStandardMaterial({ color: FACE_COLORS.right }),
  new THREE.MeshStandardMaterial({ color: FACE_COLORS.left }),
  new THREE.MeshStandardMaterial({ color: FACE_COLORS.top }),
  new THREE.MeshStandardMaterial({ color: FACE_COLORS.bottom }),
  new THREE.MeshStandardMaterial({ color: FACE_COLORS.front }),
  new THREE.MeshStandardMaterial({ color: FACE_COLORS.back }),
];

const RubiksCube = () => {
  const groupRef = useRef<THREE.Group>(null);

  const cubelets = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          positions.push([x * OFFSET, y * OFFSET, z * OFFSET]);
        }
      }
    }
    return positions;
  }, []);

  return (
    <group ref={groupRef}>
      {cubelets.map((pos, i) => (
        <RoundedBox
          key={i}
          position={pos}
          args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]}
          radius={0.04}
          smoothness={2}
          material={createCubeletMaterials()}
        />
      ))}
    </group>
  );
};

const CyberCube = () => {
  return (
    <div className="w-full h-[350px] md:h-[450px]">
      <Canvas camera={{ position: [3.5, 3, 4], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-4, -3, -4]} intensity={0.3} color="#aaaaaa" />
        <RubiksCube />
      </Canvas>
    </div>
  );
};

export default CyberCube;
