interface CircularCountdownProps {
  seconds: number;
  total?: number;
}

export function CircularCountdown({ seconds, total = 20 }: CircularCountdownProps) {
  const radius = 32;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = (seconds / total) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#facc15"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + " " + circumference}
        strokeDashoffset={circumference - progress}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="1.5rem"
        fill="#facc15"
      >
        {seconds}
      </text>
    </svg>
  );
} 