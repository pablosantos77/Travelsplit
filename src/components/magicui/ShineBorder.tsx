import React from "react";

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  shineColor?: string | string[];
  className?: string;
}

/**
 * @name Shine Border
 * @description Shine Border is a background animation that creates a shining border effect around a container.
 */
export function ShineBorder({
  borderRadius = 32,
  borderWidth = 2,
  duration = 14,
  shineColor = "#000000",
  className,
}: ShineBorderProps) {
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
          "--duration": `${duration}s`,
          "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          "--background-radial-gradient": `radial-gradient(transparent,transparent, ${
            Array.isArray(shineColor) ? shineColor.join(",") : shineColor
          },transparent,transparent)`,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 size-full overflow-hidden rounded-[--border-radius] ${className}`}
    >
      <div
        className={`before:absolute before:inset-0 before:size-full before:rounded-[--border-radius] before:p-[--border-width] before:will-change-[background-position] before:content-[""] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:[mask:--mask-linear-gradient] motion-safe:before:animate-shine`}
        style={{
           "--border-width": `${borderWidth}px`,
        } as React.CSSProperties}
      ></div>
    </div>
  );
}
