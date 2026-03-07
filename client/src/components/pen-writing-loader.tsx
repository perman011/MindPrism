import mindprismLogo from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";

/**
 * PenWritingLoader — branded loading animation.
 * The golden feather pen tilts and "writes" an ink trail that
 * grows, pauses, then resets in an infinite loop.
 *
 * Accepts an optional `size` prop ("sm" | "md" | "lg") and
 * an optional `label` string rendered beneath the animation.
 */

interface PenWritingLoaderProps {
  /** sm = 32px pen, md = 48px (default), lg = 64px */
  size?: "sm" | "md" | "lg";
  /** Optional text shown beneath the animation */
  label?: string;
}

const sizes = {
  sm: { pen: 32, container: 56, line: 40 },
  md: { pen: 48, container: 80, line: 60 },
  lg: { pen: 64, container: 100, line: 80 },
} as const;

export function PenWritingLoader({ size = "md", label }: PenWritingLoaderProps) {
  const s = sizes[size];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* pen + ink-line wrapper */}
      <div
        className="relative flex items-end justify-center"
        style={{ width: s.container, height: s.container }}
      >
        {/* pen image — rocks gently while "writing" */}
        <img
          src={mindprismLogo}
          alt=""
          className="pen-writing-rock absolute select-none"
          style={{
            width: s.pen,
            height: s.pen,
            objectFit: "contain",
            /* position the nib near the bottom-center */
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            filter: "drop-shadow(0 2px 8px rgba(212,170,50,0.35))",
          }}
        />

        {/* growing ink line beneath the pen nib */}
        <div
          className="absolute pen-writing-ink rounded-full"
          style={{
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            height: 2.5,
            width: s.line,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(212,170,50,0.5) 30%, rgba(212,170,50,0.8) 100%)",
          }}
        />
      </div>

      {/* optional label */}
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse" style={{ animationDuration: "2s" }}>
          {label}
        </p>
      )}
    </div>
  );
}
