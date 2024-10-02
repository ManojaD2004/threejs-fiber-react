import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {"ThreeJS Fiber React, Visit different pages"}
      <a href="/interactive">Interactive Page</a>
      <a href="/orbit-rotation">Orbit Rotation Page</a>
    </main>
  );
}
