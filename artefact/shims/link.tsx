import { forwardRef, type AnchorHTMLAttributes } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean; scroll?: boolean; replace?: boolean };

const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ prefetch: _p, scroll: _s, replace: _r, ...props }, ref) {
  return <a ref={ref} {...props} />;
});
export default Link;
