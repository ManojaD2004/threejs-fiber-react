"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";

const Planet = () => {
  const planetRef = useRef();

  // A simple planet representation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Orbiting the planet around the origin (sun)
    planetRef.current.position.set(Math.sin(t) * 10, 0, Math.cos(t) * 10);
  });

  return (
    <mesh ref={planetRef} position={[10, 0, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

const CameraController = ({ targetRef }) => {
  const cameraRef = useRef();

  useFrame(() => {
    if (targetRef.current) {
      // Update the camera to follow the planet
      const targetPosition = new Vector3();
      targetRef.current.getWorldPosition(targetPosition);

      cameraRef.current.position.lerp(
        targetPosition.clone().add(new Vector3(0, 5, 10)),
        0.1
      ); // Smooth following
      cameraRef.current.lookAt(targetPosition); // Always look at the planet
    }
  });

  return (
    <perspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 5, 10]}
      fov={50} // Change this for a wider or narrower view
      near={0.1} // Objects closer than 0.1 units will not be rendered
      far={1000} // Objects further than 1000 units will not be rendered

    />
  );
};

const Scene = () => {
  const planetRef = useRef();

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Planet ref={planetRef} />
      <CameraController targetRef={planetRef} />
      <OrbitControls  enableZoom enableRotate />
    </>
  );
};

const App = () => (
  <Canvas>
    <Scene />
  </Canvas>
);

export default App;
