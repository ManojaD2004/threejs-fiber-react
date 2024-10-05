"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Canvas,
  useFrame,
  extend,
  useLoader,
  useThree,
} from "@react-three/fiber";
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

const SPACE_SIZE = 3;
const ORBIT_TO_SUN = 0.003;

function BigSphereObj({ position, scaleRatio, sunRef }) {
  const meshRef = useRef();
  const colorMap = useLoader(TextureLoader, "/texture/solar/sun/2k_sun.jpg");
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.3;
  });
  return (
    <mesh ref={sunRef}>
      <mesh position={position} rotation={[0, 0, 0]} ref={meshRef}>
        <perspectiveCamera />
        <pointLight
          position={[0, 0, 0]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI * 0.5}
        />
        <sphereGeometry
          args={[SPACE_SIZE * ORBIT_TO_SUN * scaleRatio, 64, 64]}
        />
        <meshStandardMaterial
          map={colorMap}
          emissive="orange"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </mesh>
  );
}

function SmallSphereObj({
  plaName = "Earth",
  colorMapLoc = "/texture/solar/earth/2k_earth_daymap.jpg",
  scaleRatio,
  planetRef,
  changeViewPer,
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
      // scale={hovered ? 3 : 1}
      onPointerOver={(event) => {
        setHover(true);
      }}
      onPointerOut={(event) => {
        setHover(false);
      }}
    >
      {changeViewPer === true && (
        <Html>
          <div className="text-white text-lg select-none">I am here</div>
        </Html>
      )}
      <mesh rotation={[-Math.PI / 10, 0, 0]} ref={planetRef}>
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
  changeViewPer,
}) {
  const ellipseCurve = new THREE.EllipseCurve(
    0,
    0,
    xRadius * SPACE_SIZE * ORBIT_TO_SUN,
    yRadius * SPACE_SIZE * ORBIT_TO_SUN,
    0,
    2 * Math.PI,
    false,
    0
  );
  const eliRef = useRef();
  const boxRef = useRef();

  const points = ellipseCurve.getPoints(500);
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
          changeViewPer={changeViewPer}
        />
      </mesh>
      <mesh>
        <Line
          points={points}
          color={"blue"}
          lineWidth={1}
          transparent={true}
          opacity={0.5} // Adjust the opacity as needed
        />
      </mesh>
    </mesh>
  );
}

function ThreeDComp({ changeViewPer }) {
  const planetRef = useRef();
  const cameraRef = useRef();
  const controlsRef = useRef();
  const stopRef = useRef(false);
  const sunRef = useRef();
  const distanceCamRef = useRef(16);
  const earthOrbit = 23479.8304;
  useThree(({ camera }) => {
    cameraRef.current = camera;
  });
  useEffect(() => {
    if (
      changeViewPer === false &&
      planetRef.current &&
      cameraRef.current &&
      controlsRef.current
    ) {
      const target = new THREE.Vector3();
      const target1 = new THREE.Vector3();
      sunRef.current.getWorldPosition(target1);
      planetRef.current.getWorldPosition(target);
      const cameraDistance = 16;
      const cameraOffset = new THREE.Vector3(cameraDistance, 0, 0);
      cameraRef.current.position.copy(target.clone().add(cameraOffset));
      cameraRef.current.lookAt(target1);
      cameraRef.current.rotation.set(0, Math.PI / 2, 0);
    } else if (
      changeViewPer === true &&
      sunRef.current &&
      cameraRef.current &&
      controlsRef.current
    ) {
      const target = new THREE.Vector3();

      sunRef.current.getWorldPosition(target);
      const cameraDistance = 5;
      const cameraOffset = new THREE.Vector3(cameraDistance, 0, 0);
      cameraRef.current.position.copy(target.clone().add(cameraOffset));
      cameraRef.current.lookAt(target);
      cameraRef.current.rotation.set(0, -Math.PI / 2, 0);
    }
  }, [changeViewPer]);

  useFrame((state, delta) => {
    if (changeViewPer === false && controlsRef.current && cameraRef.current) {
      const target = controlsRef.current.target;
      const distance = cameraRef.current.position.distanceTo(target);
      distanceCamRef.current = distance;
      planetRef.current.scale.set(
        200 / distanceCamRef.current,
        200 / distanceCamRef.current,
        200 / distanceCamRef.current
      );
    }
    if (
      changeViewPer === false &&
      planetRef.current &&
      cameraRef.current &&
      controlsRef.current
    ) {
      const target = new THREE.Vector3();
      planetRef.current.getWorldPosition(target);

      // const target1 = new THREE.Vector3();
      const cameraDistance = 10;
      const cameraOffset = new THREE.Vector3(cameraDistance, 0, 0);
      const target2 = controlsRef.current.target;
      const final1 = target.clone().add(cameraOffset);
      // console.log(cameraRef.current.position);
      if (stopRef.current === false) {
        cameraRef.current.position.lerp(final1, 0.05);
        cameraRef.current.rotation.set(target2.x, target2.y, target2.z);
      }
      controlsRef.current.target.lerp(target, 0.1); // Smoothly follow the planet
      controlsRef.current.update();
    } else if (
      changeViewPer === true &&
      sunRef.current &&
      cameraRef.current &&
      controlsRef.current
    ) {
      const target = new THREE.Vector3();
      sunRef.current.getWorldPosition(target);
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }
  });
  return (
    <>
      <OrbitControls
        ref={controlsRef}
        onChange={() => {
          stopRef.current = true;
        }}
        // enableZoom={changeViewPer}
        enablePan={false}
        zoomToCursor={true}
        zoomSpeed={5}
        rotateSpeed={2}
      />
      <ambientLight intensity={Math.PI / 2} />
      <Stars
        radius={50 * SPACE_SIZE}
        count={10000}
        depth={600}
        factor={20}
        // saturation={100}
        fade={true}
        speed={1}
      />
      <Effects disableGamma>
        <unrealBloomPass threshold={1} strength={1.0} radius={0.5} />
      </Effects>
      <BakeShadows />
      <BigSphereObj
        sunRef={sunRef}
        scaleRatio={109.2983}
        position={[0, 0, 0]}
      />
      <OrbitComponent
        xRadius={earthOrbit}
        yRadius={earthOrbit}
        scaleRatio={0.01}
        colorMapLoc={"/texture/solar/earth/2k_earth_daymap.jpg"}
        speedPla={0.01}
        planetRef={planetRef}
        changeViewPer={changeViewPer}
      />
    </>
  );
}

export default function Home() {
  const [changeView, setChangeView] = useState(true);
  return (
    <main className="h-screen m-[unset] relative bg-slate-950">
      <div className="z-50 fixed top-0 right-0 m-3 rounded-xl h-40 w-44 bg-red-700 p-4 text-white">
        <div
          className="cursor-pointer"
          onClick={() => setChangeView(!changeView)}
        >
          Change The View
        </div>
      </div>
      <Canvas
        camera={{ position: [240, 120, 120], fov: 50, far: 100000, near: 1 }}
      >
        <ThreeDComp changeViewPer={changeView} />
      </Canvas>
    </main>
  );
}
