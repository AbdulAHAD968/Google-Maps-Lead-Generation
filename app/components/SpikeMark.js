export default function SpikeMark({ className = "", dark = false }) {
  const fill = dark ? "#faf9f5" : "#141413";
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        d="M12 0 L13.6 10.4 L24 12 L13.6 13.6 L12 24 L10.4 13.6 L0 12 L10.4 10.4 Z"
        fill={fill}
      />
    </svg>
  );
}
