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
  Text,
  useGLTF,
} from "@react-three/drei";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { UnrealBloomPass } from "three-stdlib";
import resultJson from "@/data/result";
extend({ UnrealBloomPass });
import { Poppins } from "next/font/google";

const poppinsFont = Poppins({ subsets: ["latin"], weight: "400" });
const poppinsFont1 = Poppins({ subsets: ["latin"], weight: "500" });

const SPACE_SIZE = 3;
const ORBIT_TO_SUN = 0.003;
const DISTANCE_FROM_EARTH_TO_SUN = 23479.8304;
const SUN_RADIUS = 109.2983;
const LIMIT_VALUE = 20;

const DEFAULT_DATA = {
  Sun: {
    pl_name: "Earth",
    sun_name: "Sun",
    orbit_distance: 1,
    pl_size: 1,
    sun_size: 1,
    world_position: [0, 0, 0],
  },
};

for (let i = 0; i < resultJson.length; i++) {
  const exoSpace = resultJson[i];
  const orbDis = exoSpace["Semi-Major Axis"].replace(" AU", "");
  // % of distance from earth to sun same for below
  const plSize = exoSpace["Planet Radius"].replace(" Earth radii", "");
  const sunSize = exoSpace["Stellar Radius"].replace(" Solar radii", "");
  const worldPosDis = exoSpace["Distance from Earth"].replace(" parsecs", "");
  const distance = Number(worldPosDis) * 300;
  const theta = Math.random() * 2 * Math.PI;
  const x = distance * Math.cos(theta);
  const z = distance * Math.sin(theta);
  const worldPosition = [x, 0, z];
  DEFAULT_DATA[exoSpace["hostname"]] = {
    pl_name: exoSpace["pl_name"],
    sun_name: exoSpace["hostname"],
    orbit_distance: orbDis === "" ? 1 : Number(orbDis),
    pl_size: plSize === "" ? 1 : Number(plSize),
    sun_size: sunSize === "" ? 1 : Number(sunSize),
    world_position: worldPosition,
  };
}

function AdjacentText({ systemName }) {
  const textRef = useRef();
  const textOffset = new THREE.Vector3(50, 30, -10); // Example offset to the right of the object

  useFrame(({ camera }) => {
    textRef.current.lookAt(camera.position);
  });

  return (
    <Text
      position={textOffset}
      ref={textRef}
      scale={[17, 17, 17]} // Adjust scale as needed
      color="#cbcbcb"
      anchorX="center"
      anchorY="middle"
      font="/fonts/fox_version_5_by_mickeyfan123_daxvfx5.ttf"
    >
      {systemName}
    </Text>
  );
}

function BigSphereObj({
  scaleRatio,
  sunRef,
  setHostName,
  setPlaOrSun,
  hostName,
  systemName,
  colorMapLoc = "/texture/solar/sun/2k_sun.jpg",
  emissiveColor = "orange",
}) {
  const meshRef = useRef();
  const colorMap = useLoader(TextureLoader, colorMapLoc);
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.3;
  });
  return (
    <mesh ref={sunRef}>
      {hostName !== systemName && (
        <Html>
          <div className={poppinsFont1.className}>
          <div
            onClick={() => {
              setHostName(systemName);
              setPlaOrSun(0);
            }}
            className="text-white text-lg select-none cursor-pointer"
          >
            {systemName}
          </div>
          </div>
        </Html>
      )}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]} ref={meshRef}>
        <pointLight
          position={[0, 0, 0]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI * 0.2 * scaleRatio}
        />
        <sphereGeometry
          args={[SPACE_SIZE * ORBIT_TO_SUN * SUN_RADIUS * scaleRatio, 64, 64]}
        />
        <meshStandardMaterial
          map={colorMap}
          emissive={emissiveColor}
          emissiveIntensity={2 * scaleRatio}
          toneMapped={false}
        />
      </mesh>
    </mesh>
  );
}

function SmallSphereObj({
  colorMapLoc = "/texture/solar/earth/2k_earth_daymap.jpg",
  scaleRatio,
  planetRef,
  plaName = "Earth",
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
  hostName,
  plaName,
  systemName,
  zValue = 1,
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
    <mesh
      ref={eliRef}
      position={[0, 0, 0]}
      rotation={[(Math.PI / 2) * zValue, 0, 0]}
    >
      <mesh ref={boxRef} position={[0, 0, 0]}>
        <SmallSphereObj
          colorMapLoc={colorMapLoc}
          scaleRatio={scaleRatio}
          planetRef={planetRef}
          plaName={plaName}
        />
      </mesh>
      <mesh>
        <Line
          points={points}
          color={"cyan"}
          lineWidth={1}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
    </mesh>
  );
}

function ThreeDComp({
  plaOrSun,
  position,
  sunRef,
  planetRef,
  planetScale,
  sunScale,
  hostName,
  systemName,
  setHostName,
  setPlaOrSun,
  orbitRad,
  plaName,
}) {
  const earthOrbit = DISTANCE_FROM_EARTH_TO_SUN * orbitRad;
  const extractValue = plaOrSun;
  return (
    <group position={position}>
      {hostName === systemName && <AdjacentText systemName={systemName} />}
      <BigSphereObj
        scaleRatio={sunScale}
        sunRef={sunRef}
        hostName={hostName}
        systemName={systemName}
        setHostName={setHostName}
        setPlaOrSun={setPlaOrSun}
      />
      <OrbitComponent
        xRadius={earthOrbit}
        yRadius={earthOrbit}
        colorMapLoc={"/texture/solar/earth/2k_earth_daymap.jpg"}
        speedPla={0.01}
        scaleRatio={
          extractValue === 0 ? planetScale * ORBIT_TO_SUN : planetScale
        }
        planetRef={planetRef}
        hostName={hostName}
        systemName={systemName}
        plaName={plaName}
      />
    </group>
  );
}

function Wrapper3D({ plaOrSun, hostName, setHostName, setPlaOrSun }) {
  const controlsRef = useRef();
  const planetRef = useRef();
  const cameraRef = useRef();
  const sunRef = useRef();
  const distanceRef = useRef(1);
  const distanceRef1 = useRef(1);
  const extractValue = plaOrSun;
  const listOfExo = Object.keys(DEFAULT_DATA).slice(0, LIMIT_VALUE);
  useThree(({ camera }) => {
    cameraRef.current = camera;
  });
  useEffect(() => {
    if (extractValue === 1 && planetRef.current && cameraRef.current) {
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
      extractValue === 0 &&
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
  }, [extractValue, hostName]);

  useFrame((state, delta) => {
    if (controlsRef.current && cameraRef.current && sunRef.current) {
      const target = controlsRef.current.target;
      const distance = cameraRef.current.position.distanceTo(target);
      const target1 = new THREE.Vector3();
      sunRef.current.getWorldPosition(target1);
      const distance1 = cameraRef.current.position.distanceTo(target1);
      distanceRef.current = distance;
      distanceRef1.current = distance1;
      if (extractValue === 1) {
        planetRef.current.scale.set(
          10 / distance,
          10 / distance,
          10 / distance
        );
      }
    }
    if (
      extractValue === 1 &&
      planetRef.current &&
      controlsRef.current &&
      cameraRef.current
    ) {
      const target = new THREE.Vector3();
      planetRef.current.getWorldPosition(target);
      controlsRef.current.target.lerp(target, 0.1);
      controlsRef.current.update();
    } else if (extractValue === 0 && sunRef.current && controlsRef.current) {
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
        enablePan={false}
        zoomToCursor={true}
        zoomSpeed={5}
        rotateSpeed={2}
      />
      <ambientLight intensity={Math.PI / 2} />
      <Effects disableGamma>
        <unrealBloomPass threshold={1} strength={1.0} radius={0.5} />
      </Effects>
      <BakeShadows />
      <Stars
          radius={10000}
          count={50000}
          depth={6000}
          factor={200}
          fade={true}
          speed={1}
        />
       
      {listOfExo.map((ele, index) => (
        <ThreeDComp
          key={index}
          plaOrSun={plaOrSun}
          position={DEFAULT_DATA[ele].world_position}
          sunRef={hostName === DEFAULT_DATA[ele].sun_name ? sunRef : null}
          planetRef={hostName === DEFAULT_DATA[ele].sun_name ? planetRef : null}
          planetScale={DEFAULT_DATA[ele].pl_size}
          sunScale={DEFAULT_DATA[ele].sun_size}
          hostName={hostName}
          systemName={DEFAULT_DATA[ele].sun_name}
          setHostName={setHostName}
          setPlaOrSun={setPlaOrSun}
          orbitRad={DEFAULT_DATA[ele].orbit_distance}
          plaName={DEFAULT_DATA[ele].pl_name}
        />
      ))}
    </>
  );
}

export default function Home() {
  const [hostName, setHostName] = useState("Sun");
  const [plaOrSun, setPlaOrSun] = useState(0);
  const listOfExo = Object.keys(DEFAULT_DATA).slice(0, LIMIT_VALUE);
  for (let i = 0; i < listOfExo.length; i++) {
    console.log(DEFAULT_DATA[listOfExo[i]]);
  }
  return (
    <main className="h-screen m-[unset] relative bg-slate-950">
      <div className="z-[9999] fixed top-0 right-0 m-3 rounded-xl h-auto w-44 bg-red-700 p-4 text-white">
        <div
          className="cursor-pointer font-bold"
          onClick={() => setPlaOrSun(plaOrSun === 0 ? 1 : 0)}
        >
          Change The View
        </div>
        <div className="text-slate-200 flex-col flex">
          {listOfExo.map((ele, index) => (
            <div
              key={index}
              onClick={() => {
                setHostName(ele);
                setPlaOrSun(0);
              }}
              className="text-white cursor-pointer"
            >
              {ele}
            </div>
          ))}
        </div>
      </div>
      <Canvas
        camera={{ position: [240, 120, 120], fov: 50, far: 100000, near: 1 }}
      >
        <Wrapper3D
          hostName={hostName}
          setHostName={setHostName}
          plaOrSun={plaOrSun}
          setPlaOrSun={setPlaOrSun}
        />
      </Canvas>
    </main>
  );
}
