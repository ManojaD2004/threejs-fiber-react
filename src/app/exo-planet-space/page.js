"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, extend, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import {
  BakeShadows,
  Effects,
  Html,
  OrbitControls,
  Stars,
  useGLTF,
} from "@react-three/drei";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { UnrealBloomPass } from "three-stdlib";
extend({ UnrealBloomPass });

const SPACE_SIZE = 0.3;

function BigSphereObj({ position, scaleRatio }) {
  const meshRef = useRef();
  const colorMap = useLoader(TextureLoader, "/texture/solar/sun/2k_sun.jpg");
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.3;
  });
  return (
    <mesh
      position={position}
      rotation={[0, 0, 0]}
      ref={meshRef}
    >
      <perspectiveCamera  />
      <pointLight
        position={[0, 0, 0]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI * 2}
      />
      <sphereGeometry args={[SPACE_SIZE * scaleRatio, 64, 64]} />
      <meshStandardMaterial
        map={colorMap}
        emissive="orange"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  );
}

function SmallSphereObj({
  plaName = "Earth",
  colorMapLoc = "/texture/solar/earth/2k_earth_daymap.jpg",
  scaleRatio,
}) {
  const meshRef1 = useRef();
  const [colorMap, displacementMap, normalMap] = useLoader(TextureLoader, [
    colorMapLoc,
    "/texture/solar/earth/2k_earth_specular_map.jpg",
    "/texture/solar/earth/2k_earth_normal_map.jpg",
  ]);
  const [hovered, setHover] = useState(false);
  useFrame((state, delta) => {
    meshRef1.current.rotation.y += delta;
  });
  return (
    <group
      scale={hovered ? 3 : 1}
      onPointerOver={(event) => {
        setHover(true);
      }}
      onPointerOut={(event) => {
        setHover(false);
      }}
    >
      <mesh rotation={[-Math.PI / 10, 0, 0]}>
        <mesh ref={meshRef1} rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[SPACE_SIZE * scaleRatio, 64, 64]} />
          <meshStandardMaterial
            map={colorMap}
            displacementScale={-0.1 * SPACE_SIZE * scaleRatio}
            displacementMap={displacementMap}
            normalMap={normalMap}
            toneMapped={false}
          />
        </mesh>
      </mesh>
    </group>
  );
}

function OrbitComponent({
  xRadius,
  yRadius,
  colorMapLoc,
  speedPla,
  scaleRatio,
  planetRef,
}) {
  const ellipseCurve = new THREE.EllipseCurve(
    0,
    0,
    xRadius * SPACE_SIZE,
    yRadius * SPACE_SIZE,
    0,
    2 * Math.PI,
    false,
    0
  );
  const eliRef = useRef();
  const boxRef = useRef();

  const points = ellipseCurve.getPoints(100);
  useFrame((state, delta) => {
    const newP = ellipseCurve.getPoint(
      window.performance.now() * 0.0003 * speedPla + 0.1
    );
    boxRef.current.position.x = newP.x;
    boxRef.current.position.y = newP.y;
  });
  return (
    <mesh ref={eliRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={boxRef} position={[0, 0, 0]}>
        <SmallSphereObj
          planetRef={planetRef}
          scaleRatio={scaleRatio}
          colorMapLoc={colorMapLoc}
        />
      </mesh>
      <mesh>
        <Line
          points={points}
          color={"white"}
          lineWidth={1}
          transparent={true}
          opacity={0.1} // Adjust the opacity as needed
        />
      </mesh>
    </mesh>
  );
}

export default function Home() {
  const planetRef = useRef();
  return (
    <main className="h-screen m-[unset] bg-slate-950">
      <Canvas
        camera={{ position: [240, 120, 120], fov: 50, far: 100000, near: 1 }}
      >
        <OrbitControls />
        <ambientLight intensity={Math.PI / 2} />
        {/* <Stars
          radius={500}
          count={50000}
          depth={600}
          factor={20}
          // saturation={100}
          fade={true}
          speed={1}
        /> */}
        <Effects disableGamma>
          <unrealBloomPass threshold={1} strength={1.0} radius={0.5} />
        </Effects>
        <BakeShadows />
        <BigSphereObj scaleRatio={109.2983} position={[0, 0, 0]} />
        <OrbitComponent
          xRadius={23479.8304}
          yRadius={23479.8304}
          scaleRatio={1}
          colorMapLoc={"/texture/solar/earth/2k_earth_daymap.jpg"}
          speedPla={0.01}
          planetRef={planetRef}
        />
      </Canvas>
    </main>
  );
}
