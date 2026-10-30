"use client";

import React, { useRef, useState, useEffect } from "react";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export function Card3D({ children, className = "", accentColor = "#00F0FF" }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation limits (-10deg to +10deg)
    const rotX = ((y - centerY) / centerY) * -8;
    const rotY = ((x - centerX) / centerX) * 8;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
      }}
      className={`relative group ${className}`}
    >
      <div
        style={{
          transform: prefersReducedMotion
            ? "none"
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${
                isHovered ? "translateZ(10px)" : "translateZ(0px)"
              }`,
          transition: isHovered
            ? "transform 0.1s ease-out"
            : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
          boxShadow: isHovered
            ? `0 20px 40px -15px ${accentColor}33, 0 0 1px 1px ${accentColor}44`
            : "0 10px 30px -15px rgba(0,0,0,0.7)",
        }}
        className="w-full h-full rounded-xl transition-shadow duration-500 overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}
