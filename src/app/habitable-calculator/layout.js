import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ThreeJS Fiber React Interactive",
  description: "ThreeJS Fiber React Learning and Testing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-black">
      <body className={inter.className}>{children}
      <Toaster position="top-right" /></body>
    </html>
  );
}