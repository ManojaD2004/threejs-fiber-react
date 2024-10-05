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
// the ratio between distance between SUN and Earth to Radius of the SUN

function BigSphereObj({
  position,
  scaleRatio,
  sunRef,
  colorMapLoc = "/texture/solar/sun/2k_sun.jpg",
  emissiveColor = "orange",
  setChangeView,
  changeViewPer,
}) {
  const meshRef = useRef();
  const colorMap = useLoader(TextureLoader, colorMapLoc);
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.3;
  });
  return (
    <mesh ref={sunRef}>
      {/* {changeViewPer === false && (
        <Html>
          <div
            onClick={() => setChangeView(true)}
            className="text-white text-lg select-none cursor-pointer"
          >
            I am here
          </div>
        </Html>
      )} */}
      <mesh position={position} rotation={[0, 0, 0]} ref={meshRef}>
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
          emissive={emissiveColor}
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
  setChangeView,
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
      {/* {changeViewPer === true && (
        <Html>
          <div
            onClick={() => setChangeView(false)}
            className="text-white text-lg select-none cursor-pointer"
          >
            I am here
          </div>
        </Html>
      )} */}
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
  setChangeView,
  zValue = 1
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
      window.performance.now() * 0.0003 * speedPla
    );
    boxRef.current.position.x = newP.x;
    boxRef.current.position.y = newP.y;
  });
  return (
    <mesh ref={eliRef} position={[0, 0, 0]} rotation={[Math.PI / 2 * zValue, 0, 0]}>
      <mesh ref={boxRef} position={[0, 0, 0]}>
        <SmallSphereObj
          planetRef={planetRef}
          scaleRatio={scaleRatio}
          colorMapLoc={colorMapLoc}
          changeViewPer={changeViewPer}
          setChangeView={setChangeView}
        />
      </mesh>
      <mesh>
        <Line
          points={points}
          color={"white"}
          lineWidth={1}
          transparent={true}
          opacity={0.9} // Adjust the opacity as needed
        />
      </mesh>
    </mesh>
  );
}

function ThreeDComp({ changeViewPer, setChangeView }) {
  const planetRef = useRef();
  const cameraRef = useRef();
  const controlsRef = useRef();
  const stopRef = useRef(false);
  const sunRef = useRef();
  const earthOrbit = 23479.8304;
  useThree(({ camera }) => {
    cameraRef.current = camera;
  });
  useEffect(() => {
    if (changeViewPer === false && planetRef.current && cameraRef.current) {
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
      planetRef.current.scale.set(10 / distance, 10 / distance, 10 / distance);
    }
    if (
      changeViewPer === false &&
      planetRef.current &&
      controlsRef.current &&
      cameraRef.current
    ) {
      const target = new THREE.Vector3();
      planetRef.current.getWorldPosition(target);
      // if (stopRef.current === false) {
      //   const cameraDistance = 10;
      //   const cameraOffset = new THREE.Vector3(cameraDistance, 0, 0);
      //   const target1 = new THREE.Vector3();
      //   const final1 = target.clone().add(cameraOffset);
      //   sunRef.current.getWorldPosition(target1);
      //   cameraRef.current.position.lerp(final1, 0.05);
      //   console.log(cameraRef.current);
      //   cameraRef.current.lookAt(target1);
      // }

      controlsRef.current.target.lerp(target, 0.1);
      controlsRef.current.update();
      stopRef.current = false;
    } else if (
      changeViewPer === true &&
      sunRef.current &&
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
        changeViewPer={changeViewPer}
        position={[0, 0, 0]}
        setChangeView={setChangeView}
      />
      <OrbitComponent
        xRadius={earthOrbit}
        yRadius={earthOrbit}
        scaleRatio={changeViewPer === true ? 1 * ORBIT_TO_SUN : 1}
        colorMapLoc={"/texture/solar/earth/2k_earth_daymap.jpg"}
        speedPla={0.01}
        setChangeView={setChangeView}
        planetRef={planetRef}
        changeViewPer={changeViewPer}
      />
      {/* <OrbitComponent
        xRadius={earthOrbit}
        yRadius={earthOrbit}
        scaleRatio={changeViewPer === true ? 1 * ORBIT_TO_SUN : 1}
        colorMapLoc={"/texture/solar/earth/2k_earth_daymap.jpg"}
        speedPla={0.01}
        setChangeView={setChangeView}
        planetRef={planetRef}
        changeViewPer={changeViewPer}
        zValue={1.25}
      /> */}
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
        <ThreeDComp setChangeView={setChangeView} changeViewPer={changeView} />
      </Canvas>
    </main>
  );
}
