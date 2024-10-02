"use client";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Line } from "@react-three/drei";
import * as THREE from "three";

function SphereObj({ position, color1, color2 }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  return (
    <mesh
      position={position}
      rotation={[0, 0, 20]}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => {
        setHover(true);
      }}
      onPointerOut={(event) => {
        setHover(false);
      }}
    >
      <sphereGeometry args={[9, 64, 64]} />
      <meshStandardMaterial color={hovered ? color1 : color2} />
    </mesh>
  );
}

function CurveComponent({ xRadius, yRadius, color }) {
  // Define control points for the curve

  const ellipseCurve = new THREE.EllipseCurve(
    0,
    0,
    xRadius,
    yRadius,
    0,
    2 * Math.PI,
    false,
    0
  );
  const eliRef = useRef();
  const boxRef = useRef();

  const points = ellipseCurve.getPoints(100);
  useFrame((state, delta) => {
    // eliRef.current.rotation.x += delta;
    // console.log(eliRef.current.rotation);
    // console.log(delta);
    const newP = ellipseCurve.getPoint(window.performance.now() * 0.0003 + 0.1);
    boxRef.current.position.x = newP.x;
    boxRef.current.position.y = newP.y;
  });
  return (
    <mesh ref={eliRef} rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={boxRef} position={[0, 0, 0]}>
        <boxGeometry args={[20, 20, 20]} />
        <meshStandardMaterial color={"lime"} />
      </mesh>
      <Line
        points={points} // Array of points to form the line
        color={color} // Color of the line
        lineWidth={5} // Width of the line
      />
    </mesh>
  );
}

export default function Home() {
  return (
    <main className="h-screen m-[unset] bg-slate-700">
      <Canvas camera={{ position: [60, 30, 30], fov: 75, far: 5000, near: 1 }}>
        <OrbitControls />
        <ambientLight intensity={Math.PI / 2} />
        <pointLight
          position={[100, 90, 90]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI * 1}
        />
        <mesh position={[100, 90, 90]}>
          <boxGeometry args={[5, 5, 5]} />
        </mesh>

        <CurveComponent xRadius={50} yRadius={45} color={"red"} />
        <SphereObj position={[0, 0, 0]} color1={"#FFA500"} color2={"#FF8C00"} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -30, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color={"#ff0000"} />
        </mesh>
      </Canvas>
    </main>
  );
}
