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
          "--background-conic-gradient": `conic-gradient(from 0deg at 50% 50%, transparent 45%, ${
            Array.isArray(shineColor) ? shineColor.join(",") : shineColor
          } 50%, transparent 55%)`,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 size-full overflow-hidden rounded-[--border-radius] ${className}`}
    >
      <div
        className={`before:absolute before:inset-[-100%] before:size-[300%] before:rounded-[--border-radius] before:p-[--border-width] before:will-change-[transform] before:content-[""] before:![mask-composite:exclude] before:[background-image:--background-conic-gradient] before:[mask:--mask-linear-gradient] before:animate-shine`}
        style={{
           "--border-width": `${borderWidth}px`,
        } as React.CSSProperties}
      ></div>
    </div>
  );
}
