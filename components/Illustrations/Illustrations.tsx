import Image from 'next/image';
import { dessins, type NomDessin } from './dessins';

export type Illustration = NomDessin;

type Props = {
  nom: Illustration;
  photo?: string;
  alt: string;
  className?: string;
  /** Largeur d'affichage indicative, pour next/image. */
  sizes?: string;
};

/**
 * Visuel d'un produit : la photo détourée si elle existe, sinon le dessin.
 */
export function VisuelProduit({ nom, photo, alt, className, sizes = '220px' }: Props) {
  if (photo) {
    return <Image src={photo} alt={alt} width={480} height={320} sizes={sizes} className={className} style={{ objectFit: 'contain' }} />;
  }
  return (
    <svg
      className={className}
      viewBox="0 0 240 160"
      role="img"
      aria-label={alt}
      dangerouslySetInnerHTML={{ __html: dessins[nom] }}
    />
  );
}
