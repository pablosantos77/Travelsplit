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
  duration = 8,
  shineColor = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  className,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 size-full overflow-hidden rounded-[--border-radius] ${className}`}
    >
      <div 
        className="absolute inset-0"
        style={{
          padding: `${borderWidth}px`,
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        } as React.CSSProperties}
      >
        <div
          className="absolute inset-[-100%] size-[300%] animate-shine-fix"
          style={
            {
              "--duration": `${duration}s`,
              background: `conic-gradient(from 0deg, transparent 0%, ${
                Array.isArray(shineColor) ? shineColor.join(",") : shineColor
              } 50%, transparent 100%)`,
            } as React.CSSProperties
          }
        ></div>
      </div>
    </div>
  );
}
