import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pivotaimm.vercel.app'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/_next/',
        '/dashboard/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
