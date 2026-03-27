import { useCallback, useEffect, useRef, useState } from "react";

interface PatternLockProps {
  onComplete: (indices: number[]) => void;
  disabled?: boolean;
  error?: boolean;
  size?: number;
}

const DOT_RADIUS = 28;
const GRID_SIZE = 3;
const DOT_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function getDotCenter(
  index: number,
  containerSize: number,
): { x: number; y: number } {
  const col = index % GRID_SIZE;
  const row = Math.floor(index / GRID_SIZE);
  const spacing = containerSize / GRID_SIZE;
  return {
    x: spacing * col + spacing / 2,
    y: spacing * row + spacing / 2,
  };
}

export default function PatternLock({
  onComplete,
  disabled = false,
  error = false,
  size = 280,
}: PatternLockProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const isDrawing = useRef(false);

  const reset = useCallback(() => {
    setSelected([]);
    setCurrentPos(null);
    isDrawing.current = false;
  }, []);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(reset, 600);
    return () => clearTimeout(timer);
  }, [error, reset]);

  const getRelativePos = (
    e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent,
  ) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    let clientX: number;
    let clientY: number;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return null;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const getNearestDot = (x: number, y: number): number | null => {
    for (const i of DOT_INDICES) {
      const center = getDotCenter(i, size);
      const dist = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
      if (dist <= DOT_RADIUS + 4) return i;
    }
    return null;
  };

  const handleStart = (
    e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>,
  ) => {
    if (disabled) return;
    e.preventDefault();
    reset();
    const pos = getRelativePos(e);
    if (!pos) return;
    isDrawing.current = true;
    const dot = getNearestDot(pos.x, pos.y);
    if (dot !== null) {
      setSelected([dot]);
    }
    setCurrentPos(pos);
  };

  const handleMove = (
    e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>,
  ) => {
    if (!isDrawing.current || disabled) return;
    e.preventDefault();
    const pos = getRelativePos(e);
    if (!pos) return;
    setCurrentPos(pos);
    const dot = getNearestDot(pos.x, pos.y);
    if (dot !== null) {
      setSelected((prev) => {
        if (prev.includes(dot)) return prev;
        return [...prev, dot];
      });
    }
  };

  const handleEnd = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    setCurrentPos(null);
    if (selected.length >= 4) {
      onComplete(selected);
    } else {
      setTimeout(reset, 300);
    }
  };

  useEffect(() => {
    const onUp = () => handleEnd();
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  });

  const dotCenters = DOT_INDICES.map((i) => ({
    ...getDotCenter(i, size),
    id: i,
  }));

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      role="img"
      aria-label="Pattern lock grid"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      style={{
        touchAction: "none",
        cursor: disabled ? "default" : "crosshair",
      }}
      className={error ? "animate-shake" : ""}
    >
      <title>Pattern Lock</title>
      {/* Connection lines */}
      {selected.length > 1 &&
        selected.slice(0, -1).map((dotIdx, i) => {
          const nextDot = selected[i + 1];
          const from = dotCenters[dotIdx];
          const to = dotCenters[nextDot];
          return (
            <line
              key={`line-${dotIdx}-${nextDot}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="oklch(0.74 0.16 195)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
          );
        })}

      {/* Line to current cursor */}
      {selected.length > 0 && currentPos && isDrawing.current && (
        <line
          x1={dotCenters[selected[selected.length - 1]].x}
          y1={dotCenters[selected[selected.length - 1]].y}
          x2={currentPos.x}
          y2={currentPos.y}
          stroke="oklch(0.74 0.16 195)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
          opacity="0.5"
        />
      )}

      {/* Dots */}
      {dotCenters.map(({ x, y, id }) => {
        const isSelected = selected.includes(id);
        const isFirst = selected[0] === id;
        return (
          <g key={`dot-${id}`}>
            <circle
              cx={x}
              cy={y}
              r={DOT_RADIUS}
              fill="transparent"
              stroke={
                isSelected ? "oklch(0.74 0.16 195)" : "oklch(0.35 0.05 245)"
              }
              strokeWidth={isSelected ? "2" : "1.5"}
              opacity={isSelected ? "0.8" : "0.4"}
            />
            <circle
              cx={x}
              cy={y}
              r={isSelected ? (isFirst ? 12 : 9) : 6}
              fill={
                error
                  ? "oklch(0.62 0.22 25)"
                  : isSelected
                    ? "oklch(0.74 0.16 195)"
                    : "oklch(0.45 0.05 245)"
              }
              style={{
                transition: "r 0.15s ease, fill 0.15s ease",
                filter: isSelected
                  ? "drop-shadow(0 0 6px oklch(0.74 0.16 195 / 0.6))"
                  : "none",
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
