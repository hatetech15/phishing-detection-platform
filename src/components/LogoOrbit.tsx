import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Rainbow-spectrum colors matching the Apple Intelligence style
const COLORS = [
  "#F97316", "#F59E0B", "#A3A374", "#7AACAD", "#60B3E0",
  "#3B9FE8", "#2D88E0", "#3B82F6", "#4F72E8",
  "#6366F1", "#7C3AED", "#9333EA", "#A855F7",
  "#D946EF", "#EC4899", "#F43F5E", "#FB7185",
  "#F87171", "#EF7B5B", "#F09460",
];

const DOT_COUNT_OUTER = 36;
const DOT_COUNT_INNER = 28;

interface DotProps {
  index: number;
  total: number;
  radius: number;
  size: number;
  color: string;
  rotationOffset: number;
  scrollExpand: number;
}

const Dot = ({ index, total, radius, size, color, rotationOffset, scrollExpand }: DotProps) => {
  const angle = (index / total) * Math.PI * 2 + rotationOffset;
  const expandedRadius = radius + scrollExpand;
  const x = Math.cos(angle) * expandedRadius;
  const y = Math.sin(angle) * expandedRadius;

  return (
    <circle
      cx={250 + x}
      cy={250 + y}
      r={size}
      fill={color}
      style={{
        transition: "cx 0.1s ease-out, cy 0.1s ease-out",
      }}
    />
  );
};

const LogoOrbit = () => {
  const [rotation, setRotation] = useState(0);
  const [scrollExpand, setScrollExpand] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  // Continuous rotation
  useEffect(() => {
    let last = performance.now();
    const animate = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      setRotation((prev) => prev + delta * 0.4);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Scroll-based expansion
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const expand = Math.min(scrollY * 0.15, 60);
      setScrollExpand(expand);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const outerRadius = 110;
  const innerRadius = 85;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
      className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] mx-auto"
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full"
        style={{ overflow: "visible" }}
      >
        {/* Outer ring */}
        {Array.from({ length: DOT_COUNT_OUTER }).map((_, i) => {
          const colorIndex = Math.floor((i / DOT_COUNT_OUTER) * COLORS.length);
          return (
            <Dot
              key={`outer-${i}`}
              index={i}
              total={DOT_COUNT_OUTER}
              radius={outerRadius}
              size={7 + Math.sin((i / DOT_COUNT_OUTER) * Math.PI * 2) * 2}
              color={COLORS[colorIndex % COLORS.length]}
              rotationOffset={rotation}
              scrollExpand={scrollExpand}
            />
          );
        })}
        {/* Inner ring */}
        {Array.from({ length: DOT_COUNT_INNER }).map((_, i) => {
          const colorIndex = Math.floor((i / DOT_COUNT_INNER) * COLORS.length);
          return (
            <Dot
              key={`inner-${i}`}
              index={i}
              total={DOT_COUNT_INNER}
              radius={innerRadius}
              size={5 + Math.sin((i / DOT_COUNT_INNER) * Math.PI * 2) * 1.5}
              color={COLORS[colorIndex % COLORS.length]}
              rotationOffset={-rotation * 0.7}
              scrollExpand={scrollExpand * 0.6}
            />
          );
        })}
      </svg>
      {/* Logo in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/phishveda-logo.png"
          alt="PhishVeda"
          className="w-20 h-20 md:w-28 md:h-28 invert rounded-full"
          width={112}
          height={112}
        />
      </div>
    </motion.div>
  );
};

export default LogoOrbit;
