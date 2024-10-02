"use client";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import getRandomColor from "../helpers/getRandomColor";

function Box({ position, color1, color2, setBoxText }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const [shakeRadius] = useState(6); // Shake radius
  const [theta, setTheta] = useState(Math.random() * Math.PI); // Angle from Y-axis
  const [phi, setPhi] = useState(Math.random() * 2 * Math.PI); // Angle from XZ-plane
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta;
    meshRef.current.rotation.z += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.5;
    // Shake logic: Formula Way
    const speed = 2; // Speed of shaking
    const newTheta = theta + speed * delta * (Math.random() - 0.5); // Randomize theta
    const newPhi = phi + speed * delta * (Math.random() - 0.5); // Randomize phi

    // Convert spherical coordinates to Cartesian coordinates
    const newX =
      position[0] + shakeRadius * Math.sin(newTheta) * Math.cos(newPhi);
    const newY = position[1] + shakeRadius * Math.cos(newTheta);
    const newZ =
      position[2] + shakeRadius * Math.sin(newTheta) * Math.sin(newPhi);

    // Update the box position
    meshRef.current.position.set(newX, newY, newZ);

    // Update theta and phi for the next frame
    setTheta(newTheta);
    setPhi(newPhi);
  });
  return (
    <mesh
      position={position}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => {
        setHover(true);
        setBoxText(
          `This Sphere/Box used a color of ${color2} when not hovered and ${color1} when hovered!`
        );
      }}
      onPointerOut={(event) => {
        setHover(false);
        setBoxText(null);
      }}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color={hovered ? color1 : color2} />
    </mesh>
  );
}

export default function Home() {
  const [boxCoords, setBoxCoords] = useState([]);
  const [boxText, setBoxText] = useState(null);
  const [sphereCount, setSphereCount] = useState(30);
  const [prevSphereCount, setPrevSphereCount] = useState(0);
  const [execEffect, setExecEffect] = useState(true);
  useEffect(() => {
    // console.log(execEffect, prevSphereCount, sphereCount, boxCoords);
    if (execEffect === true) {
      const MaxXCord = 30;
      const MaxYCord = 30;
      const MaxZCord = 90;
      const newBoxCoords = [...boxCoords];
      let spher1 = prevSphereCount;
      if (sphereCount === prevSphereCount) {
        setExecEffect(false);
        return;
      } else if (sphereCount > prevSphereCount) {
        // console.log("in");
        const intId = setInterval(() => {
          // console.log("in 2");
          if (spher1 === sphereCount) {
            clearInterval(intId);
            setExecEffect(false);
            setPrevSphereCount(sphereCount);
            return;
          } else {
            const x1 = Math.floor(Math.random() * MaxXCord) - 15;
            const y1 = Math.floor(Math.random() * MaxYCord) - 15;
            const z1 = Math.floor(Math.random() * MaxZCord) - 45;
            newBoxCoords.push({
              position: [x1, y1, z1],
              color1: getRandomColor(),
              color2: getRandomColor(),
            });
            setBoxCoords([...newBoxCoords]);
            spher1 += 1;
          }
        }, 50);

        return () => {
          clearInterval(intId);
          setPrevSphereCount(sphereCount);
        };
      } else {
        const intId = setInterval(() => {
          if (spher1 === sphereCount) {
            clearInterval(intId);
            setExecEffect(false);
            setPrevSphereCount(sphereCount);
            return;
          } else {
            newBoxCoords.pop();
            setBoxCoords([...newBoxCoords]);
            spher1 -= 1;
          }
        }, 50);
        return () => {
          clearInterval(intId);
          setPrevSphereCount(sphereCount);
        };
      }
    }
  }, [execEffect]);
  return (
    <main className="h-screen m-[unset] bg-slate-200">
      {/* <p>{boxCoords}</p> */}
      {boxText !== null && (
        <div
          style={{ backgroundColor: getRandomColor() }}
          className="fixed bg-red-500 w-48 shadow-xl text-white
      z-50 flex flex-col space-y-10 px-4 py-7 top-0 right-0 m-4"
        >
          <h2 className="font-bold">Details of Sphere/Box</h2>
          <p>{boxText}</p>
        </div>
      )}
      <div
        className="fixed bg-red-500 w-48 shadow-xl text-white
      z-50 flex flex-col space-y-5 px-4 py-3 bottom-0 right-0 m-4"
      >
        <h2 className="font-bold">Change Sphere Count</h2>
        <input
          className="w-full border-0 bg-red-400 rounded-md pl-3 py-2 outline-none text-white"
          type="text"
          onChange={(e) => {
            const value1 = parseInt(e.target.value === "" ? 0 : e.target.value);
            setSphereCount(value1);
          }}
          value={sphereCount}
        />
        <button
          onClick={() => {
            if (execEffect === false) {
              setExecEffect(true);
            } else {
              console.log("Hello wait for the completion!");
            }
          }}
          className="bg-red-700 hover:bg-red-800 text-white w-full h-9 rounded-lg  border-0"
        >
          Change
        </button>
      </div>
      <Canvas camera={{ position: [60, 30, 30], fov: 75, far: 5000, near: 1 }}>
        <OrbitControls />
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        {boxCoords.map((ele, index) => (
          <Box
            key={index}
            position={ele.position}
            color2={ele.color2}
            color1={ele.color1}
            setBoxText={setBoxText}
          />
        ))}
      </Canvas>
    </main>
  );
}
