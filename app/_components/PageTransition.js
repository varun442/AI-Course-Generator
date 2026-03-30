"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      className={`transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {children}
    </div>
  );
}
