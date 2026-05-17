import { useEffect } from 'react'

const SITE_NAME = 'Voseguime'
const BASE_URL = 'https://voseguime.com'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

interface SEOOptions {
  title: string
  description: string
  path?: string
  image?: string
}

function setMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"], meta[name="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      el.setAttribute('property', property)
    } else {
      el.setAttribute('name', property)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(path: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', `${BASE_URL}${path}`)
}

export function useSEO({ title, description, path = '/', image = DEFAULT_IMAGE }: SEOOptions) {
  useEffect(() => {
    const fullTitle = `${title} — ${SITE_NAME}`

    document.title = fullTitle
    setMeta('description', description)
    setCanonical(path)

    setMeta('og:title', fullTitle)
    setMeta('og:description', description)
    setMeta('og:url', `${BASE_URL}${path}`)
    setMeta('og:image', image)

    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description)
    setMeta('twitter:image', image)
  }, [title, description, path, image])
}
