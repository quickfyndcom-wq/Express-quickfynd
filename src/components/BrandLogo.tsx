import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
  /** Show Express sub-brand label beside the mark. */
  showExpress?: boolean;
  /** Show “Powered by Nilaas” line. Default off for compact nav. */
  showPoweredBy?: boolean;
};

const sizes = {
  sm: { height: 36, width: 150, express: "text-sm", powered: "text-[10px]" },
  md: { height: 44, width: 184, express: "text-base", powered: "text-xs" },
  lg: { height: 56, width: 236, express: "text-xl", powered: "text-sm" },
};

export function BrandLogo({
  variant = "dark",
  size = "md",
  href = "/",
  className = "",
  showExpress = false,
  showPoweredBy = false,
}: BrandLogoProps) {
  const dims = sizes[size];
  const src = variant === "light" ? "/brand-logo-light.png" : "/brand-logo-dark.png";
  const poweredColor = variant === "light" ? "text-white/55" : "text-muted";

  const mark = (
    <span
      className={`inline-flex flex-col items-start gap-0.5 ${className}`}
      aria-label={
        showExpress
          ? "QuickFynd Express — Powered by Nilaas"
          : "QuickFynd — Powered by Nilaas"
      }
    >
      <span className="inline-flex items-center gap-2">
        <Image
          src={src}
          alt="quickfynd."
          width={dims.width}
          height={dims.height}
          className="object-contain object-left"
          style={{ height: dims.height, width: "auto" }}
          priority
          unoptimized
        />
        {showExpress ? (
          <span
            className={`font-[family-name:var(--font-syne)] font-bold tracking-tight text-brand ${dims.express}`}
          >
            Express
          </span>
        ) : null}
      </span>
      {showPoweredBy ? (
        <span
          className={`font-[family-name:var(--font-syne)] font-semibold tracking-wide ${poweredColor} ${dims.powered}`}
        >
          Powered by Nilaas
        </span>
      ) : null}
    </span>
  );

  if (href === null) return mark;

  return (
    <Link href={href} className="inline-flex transition hover:opacity-90">
      {mark}
    </Link>
  );
}
