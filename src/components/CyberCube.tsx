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

  const geometry = useMemo(
    () => new THREE.RoundedBoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, 2, 0.04),
    []
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.35;
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {cubelets.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          geometry={geometry}
          material={createCubeletMaterials()}
        />
      ))}
      {/* Thin black lines between cubelets */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(OFFSET * 2 + CUBE_SIZE, OFFSET * 2 + CUBE_SIZE, OFFSET * 2 + CUBE_SIZE)]} />
        <lineBasicMaterial color="#222222" transparent opacity={0.3} />
      </lineSegments>
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
