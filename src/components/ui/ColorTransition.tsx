interface ColorTransitionProps {
  fromColor: string;
  toColor: string;
}

export default function ColorTransition({
  fromColor,
  toColor,
}: ColorTransitionProps) {
  return (
    <div
      className={`h-12 bg-linear-to-b from-${fromColor} to-${toColor}`}
    ></div>
  );
}
