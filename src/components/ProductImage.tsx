type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function ProductImage({ src, alt, className = "", priority }: Props) {
  const isRemote = src.startsWith("http");

  if (!isRemote) {
    return (
      <div
        className={`flex items-center justify-center text-5xl ${className}`}
        aria-hidden
      >
        🎣
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-water-900 ${className}`}>
      {/* Images come from many store domains discovered during sync, so avoid Next's host allowlist here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-contain p-2"
      />
    </div>
  );
}
