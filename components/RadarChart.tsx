import React from 'react';

interface RadarChartProps {
  data: { label: string; value: number }[];
}

const WrappedLabel: React.FC<{
  x: number;
  y: number;
  text: string;
  textAnchor: React.SVGProps<SVGTextElement>['textAnchor'];
  dominantBaseline: React.SVGProps<SVGTextElement>['dominantBaseline'];
}> = ({ x, y, text, textAnchor, dominantBaseline }) => {
  // Logic to split long labels into two lines
  const words = text.split(' ');
  if (words.length > 1) {
    const midpoint = Math.ceil(words.length / 2);
    const line1 = words.slice(0, midpoint).join(' ');
    const line2 = words.slice(midpoint).join(' ');

    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
      fontSize="10"
      fontWeight="600"
      fill="#4b5563" // gray-600
      >
        <tspan x={x} dy="-0.6em">{line1}</tspan>
        <tspan x={x} dy="1.2em">{line2}</tspan>
      </text>
    );
  }

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline={dominantBaseline}
      fontSize="10"
      fontWeight="600"
      fill="#4b5563"
    >
      {text}
    </text>
  );
};


const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const size = 280; // Increased to provide more space for labels
  const center = size / 2;
  const maxVal = 5; // The max value for the scale (1-5)

  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">데이터가 없습니다.</div>;
  }

  const numAxes = data.length;
  const angleSlice = (Math.PI * 2) / numAxes;

  const chartRadiusRatio = 0.55; // Decreased to make chart smaller for label space
  const labelRadiusRatio = 0.92; // Decreased to keep labels inside container

  // Calculate coordinates for the points on the chart
  const points = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const value = Math.max(0, Math.min(d.value, maxVal));
    const radius = (center * chartRadiusRatio) * (value / maxVal);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Calculate coordinates for axis labels
  const labels = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const radius = center * labelRadiusRatio;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    
    let textAnchor: React.SVGProps<SVGTextElement>['textAnchor'] = "middle";
    if (x < center - 10) textAnchor = "end";
    if (x > center + 10) textAnchor = "start";

    let dominantBaseline: React.SVGProps<SVGTextElement>['dominantBaseline'] = "middle";
    if (y < center - 15) dominantBaseline = "auto";
    if (y > center + 15) dominantBaseline = "hanging";


    return {
      x,
      y,
      text: d.label,
      textAnchor,
      dominantBaseline,
    };
  });

  return (
    <div className="relative w-full max-w-full flex items-center justify-center" style={{ padding: '20px' }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" style={{ maxWidth: '100%', height: 'auto' }}>
        <g>
          {/* Concentric polygons (grid) */}
          {[1, 2, 3, 4, 5].map(level => {
            const levelPoints = data.map((_, i) => {
              const angle = angleSlice * i - Math.PI / 2;
              const radius = (center * chartRadiusRatio) * (level / maxVal);
              const x = center + radius * Math.cos(angle);
              const y = center + radius * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polygon
                key={level}
                points={levelPoints}
                fill="none"
                stroke="#e5e7eb" // gray-200
                strokeWidth="1"
              />
            );
          })}

          {/* Axes */}
          {data.map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const radius = center * chartRadiusRatio;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#d1d5db" // gray-300
                strokeWidth="1"
              />
            );
          })}
          
          {/* Data shape */}
          <polygon
            points={points}
            fill="rgba(79, 70, 229, 0.4)" // indigo-600 with opacity
            stroke="#4338ca" // indigo-700
            strokeWidth="2"
          />

           {/* Data points */}
          {data.map((d, i) => {
              const angle = angleSlice * i - Math.PI / 2;
              const value = Math.max(0, Math.min(d.value, maxVal));
              const radius = (center * chartRadiusRatio) * (value / maxVal);
              const x = center + radius * Math.cos(angle);
              const y = center + radius * Math.sin(angle);
              return <circle key={i} cx={x} cy={y} r="3" fill="#4f46e5" />; // indigo-600
          })}
        </g>
        
        {/* Labels */}
        {labels.map((label, i) => (
          <WrappedLabel
            key={i}
            x={label.x}
            y={label.y}
            text={label.text}
            textAnchor={label.textAnchor}
            dominantBaseline={label.dominantBaseline}
          />
        ))}
      </svg>
    </div>
  );
};

export default RadarChart;