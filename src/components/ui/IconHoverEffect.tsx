type IconHoverEffectProps = {
  children: React.ReactNode;
  color?: string;
};

export default function IconHoverEffect({
  children,
  color,
}: IconHoverEffectProps) {
  const colorClasses = Boolean(color)
    // ? `outline-red-400 hover:bg-red-200 group-hover:bg-red-200 focus-visible:bg-red-200 group-focus-visible:bg-red-200`
    ? `outline-${color}-400 hover:bg-${color}-200 group-hover:bg-${color}-200 focus-visible:bg-${color}-200 group-focus-visible:bg-${color}-200`
    : "outline-gray-400 hover:bg-gray-200 group-hover:bg-gray-200 focus-visible:bg-gray-200 group-focus-visible:bg-gray-200";

  return (
    <div
      className={`rounded-full p-2 transition-colors duration-200  
    ${colorClasses}
    `}
    >
      {children}
    </div>
  );
}
