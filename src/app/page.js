import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {"ThreeJS Fiber React, Visit different pages"}
      <a className="text-blue-500" href="/interactive">
        Interactive Page
      </a>
      <a className="text-blue-500" href="/orbit-rotation">
        Orbit Rotation Page
      </a>
      <a className="text-blue-500" href="/exo-planet-space">
        Exo Planet Space
      </a>
    </main>
  );
}
