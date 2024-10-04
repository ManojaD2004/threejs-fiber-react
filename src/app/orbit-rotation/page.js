"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import {
  BakeShadows,
  Effects,
  Html,
  OrbitControls,
  PointMaterial,
  Points,
  Stars,
  useGLTF,
} from "@react-three/drei";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { UnrealBloomPass } from "three-stdlib";
import { random } from "maath";
extend({ UnrealBloomPass });

function BigSphereObj({ position, color1, color2 }) {
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
      {/* <hemisphereLight position={[0,0,0]} intensity={5}  color="red" groundColor="yellow" /> */}
      <pointLight
        position={[0, 0, 0]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI * 5}
      />
      <sphereGeometry args={[20, 64, 64]} />
      <meshStandardMaterial
        color={hovered ? color1 : color2}
        emissive="orange"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  );
}

function SmallSphereObj({ color1, color2, sizePla, plaName = "Planet" }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  return (
    <mesh
      rotation={[0, 0, 20]}
      ref={meshRef}
      scale={hovered ? 3 : 1}
      onPointerOver={(event) => {
        setHover(true);
      }}
      onPointerOut={(event) => {
        setHover(false);
      }}
    >
      <Html>
        <div className=" text-white text-xl pointer-events-none pb-96 select-none">
          {plaName}
        </div>
      </Html>
      <sphereGeometry args={[sizePla, 64, 64]} />
      <meshStandardMaterial
        color={hovered ? color1 : color2}
        toneMapped={false}
      />
    </mesh>
  );
}

function OrbitComponent({
  xRadius,
  yRadius,
  colorOrbit,
  colorPla1,
  colorPla2,
  sizePla,
  speedPla,
}) {
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
    const newP = ellipseCurve.getPoint(
      window.performance.now() * 0.0003 * speedPla + 0.1
    );
    boxRef.current.position.x = newP.x;
    boxRef.current.position.y = newP.y;
  });
  return (
    <mesh ref={eliRef} rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={boxRef} position={[0, 0, 0]}>
        <SmallSphereObj
          color1={colorPla1}
          color2={colorPla2}
          sizePla={sizePla}
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

function Asteriod1({ position }) {
  const { scene } = useGLTF("/model/asteriod_1.glb");
  const [hovered, setHover] = useState(false);
  // const [active, setActive] = useState(false);
  const clone = useMemo(() => scene.clone(), [scene]);
  return (
    <mesh
      position={position}
      onPointerOver={(event) => {
        setHover(true);
      }}
      onPointerOut={(event) => {
        setHover(false);
      }}
      scale={hovered ? 2 : 1}
    >
      <primitive object={clone} scale={1} rotation-z={0} position={[0, 0, 0]} />
    </mesh>
  );
}

function AsteriodOrbitComponent({ xRadius, yRadius, colorOrbit, speedPla }) {
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
  const ASTERIODS_SIZE = 500;
  const maxXYZ = 15;
  const boxesRef = useMemo(
    () => Array.from({ length: ASTERIODS_SIZE }, () => React.createRef()),
    [ASTERIODS_SIZE]
  ); // Create refs outside of the loop
  const boxesMeta = useMemo(() => {
    const maxXYZ = 15;
    return Array.from({ length: ASTERIODS_SIZE }, () => ({
      x: Math.random() * maxXYZ * 2 - maxXYZ / 2,
      y: Math.random() * maxXYZ * 2 - maxXYZ / 2,
      z: Math.random() * maxXYZ * 2 - maxXYZ / 2,
    }));
  }, [ASTERIODS_SIZE]);

  const points = ellipseCurve.getPoints(100);
  useFrame((state, delta) => {
    const time = window.performance.now() * 0.0003 * speedPla;
    for (let i = 0; i < ASTERIODS_SIZE; i++) {
      const newP = ellipseCurve.getPoint(time + i * 0.02);
      boxesRef[i].current.position.x = newP.x;
      boxesRef[i].current.position.y = newP.y;
      boxesRef[i].current.rotation.x += delta * Math.random() * 0.5;
      boxesRef[i].current.rotation.y += delta * Math.random() * 1;
      boxesRef[i].current.rotation.z += delta * Math.random() * 0.7;
    }
  });
  return (
    <mesh ref={eliRef} rotation={[Math.PI / 2, 0, 0]}>
      {boxesRef.map((ele, index) => (
        <mesh key={index} ref={ele} position={[0, 0, 0]}>
          <Asteriod1
            position={[
              boxesMeta[index].x,
              boxesMeta[index].y,
              boxesMeta[index].z,
            ]}
          />
        </mesh>
      ))}
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
  return (
    <main className="h-screen m-[unset] bg-slate-950">
      <Canvas
        camera={{ position: [240, 120, 120], fov: 50, far: 5000, near: 1 }}
      >
        <OrbitControls />
        <ambientLight intensity={Math.PI / 2} />
        <Stars
          radius={500}
          count={50000}
          depth={600}
          factor={20}
          // saturation={100}
          fade={true}
          speed={1}
        />
        {/* <pointLight
          position={[100, 90, 90]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI * 1}
        /> */}
        <Effects disableGamma>
          <unrealBloomPass threshold={1} strength={1.0} radius={0.5} />
        </Effects>
        <BakeShadows />
        {/* <Bloom
          intensity={1.0} // The bloom intensity.
          blurPass={undefined} // A blur pass.
          kernelSize={KernelSize.LARGE} // blur kernel size
          luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
          luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
          mipmapBlur={false} // Enables or disables mipmap blur.
          resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
          resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
        /> */}
        <OrbitComponent
          xRadius={50}
          yRadius={45}
          colorOrbit={"red"}
          colorPla1={"#E5E5E5"}
          colorPla2={"#b0b0b0"}
          speedPla={0.2}
          sizePla={3}
        />
        <OrbitComponent
          xRadius={80}
          yRadius={75}
          colorOrbit={"gray"}
          colorPla1={"#f8e2b0"}
          colorPla2={"#bdac86"}
          speedPla={0.15}
          sizePla={3.5}
        />
        <OrbitComponent
          xRadius={150}
          yRadius={145}
          colorOrbit={"green"}
          colorPla1={"#233675"}
          colorPla2={"#40de55"}
          speedPla={0.1}
          sizePla={4.5}
        />
        <OrbitComponent
          xRadius={200}
          yRadius={195}
          colorOrbit={"lime"}
          colorPla1={"#663023"}
          colorPla2={"#a14b35"}
          speedPla={0.05}
          sizePla={4.5}
        />
        <AsteriodOrbitComponent
          colorOrbit={"gray"}
          speedPla={0.03}
          xRadius={300}
          yRadius={290}
        />
        <OrbitComponent
          xRadius={450}
          yRadius={435}
          colorOrbit={"orange"}
          colorPla1={"yellow"}
          colorPla2={"red"}
          speedPla={0.02}
          sizePla={6}
        />
        <BigSphereObj
          position={[0, 0, 0]}
          color1={"#FFA500"}
          color2={"#FF8C00"}
        />
      </Canvas>
    </main>
  );
}
