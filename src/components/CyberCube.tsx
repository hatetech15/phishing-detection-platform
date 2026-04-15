import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

const CUBE_SIZE = 0.55;
const GAP = 0.08;
const OFFSET = CUBE_SIZE + GAP;

// Elegant monochrome palette matching site theme
const FACE_COLORS = {
  right: "hsl(0 0% 85%)",    // primary - light silver
  left: "hsl(0 0% 45%)",      // muted-foreground - medium grey
  top: "hsl(0 0% 95%)",       // foreground - pure white
  bottom: "hsl(0 0% 12%)",    // secondary - dark grey
  front: "hsl(0 0% 70%)",     // ring - light grey
  back: "hsl(222 20% 6%)",    // background - deep dark
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
