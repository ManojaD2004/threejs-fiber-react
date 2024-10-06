import Image from "next/image";
import Calculator from "./components/Calculator";
import Herosection from "./components/Herosection";

export default function Home() {
  return (
    <div>
      <Herosection/>
      <Calculator />
    </div>
  );
}
