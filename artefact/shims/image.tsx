import type { ImgHTMLAttributes } from 'react';

export default function Image({ priority: _p, ...props }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; src: string }) {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img loading="lazy" decoding="async" {...props} />;
}
