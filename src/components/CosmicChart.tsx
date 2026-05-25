import { useEffect, useRef, useState } from 'react';
import { isMasterNumber } from '@/utils/numerology';

interface CosmicChartProps {
  numbers: {
    label: string;
    value: number;
    compound?: number | null;
    color: string;
  }[];
  onSegmentClick?: (index: number) => void;
}

/**
 * SVG radial chart displaying all core numbers as segments of a circle.
 * Each number is rendered as a colored arc with an animated draw-on effect.
 */
const CosmicChart = ({ numbers, onSegmentClick }: CosmicChartProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const size = 320;
  const center = size / 2;
  const outerRadius = 140;
  const innerRadius = 80;
  const segmentAngle = (2 * Math.PI) / numbers.length;
  const gap = 0.03; // gap between segments in radians

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => ({
    x: cx + r * Math.cos(angle - Math.PI / 2),
    y: cy + r * Math.sin(angle - Math.PI / 2),
  });

  const createArcPath = (index: number) => {
    const startAngle = index * segmentAngle + gap / 2;
    const endAngle = (index + 1) * segmentAngle - gap / 2;

    const outerStart = polarToCartesian(center, center, outerRadius, startAngle);
    const outerEnd = polarToCartesian(center, center, outerRadius, endAngle);
    const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      'Z',
    ].join(' ');
  };

  const getLabelPosition = (index: number) => {
    const midAngle = (index + 0.5) * segmentAngle;
    const labelRadius = outerRadius + 22;
    return polarToCartesian(center, center, labelRadius, midAngle);
  };

  const getValuePosition = (index: number) => {
    const midAngle = (index + 0.5) * segmentAngle;
    const r = (outerRadius + innerRadius) / 2;
    return polarToCartesian(center, center, r, midAngle);
  };

  return (
    <div ref={containerRef} className="flex justify-center" role="img" aria-label="Radial chart showing your 7 core numerology numbers">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className={`w-full max-w-[320px] h-auto transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      >
        {/* Background glow */}
        <defs>
          {numbers.map((n, i) => (
            <radialGradient key={`grad-${i}`} id={`segment-grad-${i}`}>
              <stop offset="0%" stopColor={n.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={n.color} stopOpacity="0.08" />
            </radialGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 8}
          fill="rgba(14, 14, 36, 0.8)"
          stroke="rgba(222, 174, 82, 0.15)"
          strokeWidth="1"
        />
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="fill-gray-400 text-[9px]"
          fontFamily="'Space Grotesk', sans-serif"
        >
          YOUR CORE
        </text>
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          className="fill-amber-400 text-[10px] font-semibold"
          fontFamily="'Cinzel', serif"
        >
          NUMBERS
        </text>

        {/* Segments */}
        {numbers.map((n, i) => {
          const isHovered = hoveredIndex === i;
          const labelPos = getLabelPosition(i);
          const valuePos = getValuePosition(i);

          return (
            <g
              key={i}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSegmentClick?.(i)}
              role="button"
              tabIndex={0}
              aria-label={`${n.label}: ${n.value}`}
              onKeyDown={(e) => { if (e.key === 'Enter') onSegmentClick?.(i); }}
            >
              <path
                d={createArcPath(i)}
                fill={`url(#segment-grad-${i})`}
                stroke={n.color}
                strokeWidth={isHovered ? 2 : 1}
                opacity={isHovered ? 1 : 0.7}
                filter={isHovered ? 'url(#glow)' : undefined}
                className={`transition-all duration-300 ${isVisible ? '' : 'opacity-0'}`}
                style={{
                  transitionDelay: `${i * 100}ms`,
                  transform: isHovered ? `scale(1.03)` : 'scale(1)',
                  transformOrigin: `${center}px ${center}px`,
                }}
              />

              {/* Number value in the segment */}
              <text
                x={valuePos.x}
                y={valuePos.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                className={`font-bold transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  fill: n.color,
                  fontSize: isHovered ? '16px' : '14px',
                  transitionDelay: `${i * 100 + 300}ms`,
                  fontFamily: "'Cinzel', serif",
                }}
              >
                {n.value}
                {isMasterNumber(n.value) && (
                  <tspan className="text-[7px]" dy="-6">✦</tspan>
                )}
              </text>

              {/* Compound sub-label on hover */}
              {isHovered && n.compound && (
                <text
                  x={valuePos.x}
                  y={valuePos.y + 13}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="opacity-80"
                  style={{
                    fill: 'rgba(255,255,255,0.6)',
                    fontSize: '7px',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  ({n.compound})
                </text>
              )}

              {/* Label outside */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  fill: isHovered ? n.color : 'rgba(255,255,255,0.5)',
                  fontSize: '8px',
                  fontWeight: isHovered ? 600 : 400,
                  transitionDelay: `${i * 100 + 500}ms`,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default CosmicChart;
