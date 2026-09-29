import type { MetadataRoute } from 'next';
import { urlSite } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const maintenant = new Date();
  return [
    { url: `${urlSite}/`, lastModified: maintenant, changeFrequency: 'daily', priority: 1 },
    { url: `${urlSite}/commander`, lastModified: maintenant, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${urlSite}/la-maison`, lastModified: maintenant, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${urlSite}/mentions-legales`, lastModified: maintenant, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${urlSite}/confidentialite`, lastModified: maintenant, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
