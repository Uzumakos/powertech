import Image, { type ImageProps } from "next/image";

// Must mirror images.remotePatterns in next.config.ts.
const optimizedHosts = [/^images\.unsplash\.com$/, /\.supabase\.co$/];

function isOptimizable(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const { protocol, hostname } = new URL(src);
    return protocol === "https:" && optimizedHosts.some((host) => host.test(hostname));
  } catch {
    return false;
  }
}

/**
 * next/image for media whose URL comes from the admin. Known hosts go through
 * the optimizer; any other link is rendered as-is, so pasting an image URL from
 * anywhere works without touching the config.
 */
export function MediaImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  return <Image src={src} alt={alt} unoptimized={!isOptimizable(src)} {...props} />;
}
