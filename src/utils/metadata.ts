/**
 * Metadata Utility
 * Handles page titles and meta tags for SEO
 */

/**
 * Interface for page metadata
 */
export interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

/**
 * Default metadata configuration
 */
const DEFAULT_METADATA: PageMetadata = {
  title: 'Profile Manager',
  description: 'A production-ready React application',
  keywords: 'react, typescript, web application',
};

/**
 * Updates the document title
 */
export const updateTitle = (title?: string): void => {
  if (title) {
    document.title = title;
  }
};

/**
 * Updates or creates a meta tag
 */
const updateMetaTag = (name: string, content: string, attribute: string = 'name'): void => {
  const existingMeta = document.querySelector(`meta[${attribute}="${name}"]`);

  if (existingMeta) {
    existingMeta.setAttribute('content', content);
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }
};

/**
 * Updates the canonical URL
 */
const updateCanonical = (url?: string): void => {
  const existingCanonical = document.querySelector('link[rel="canonical"]');

  if (url) {
    if (existingCanonical) {
      existingCanonical.setAttribute('href', url);
    } else {
      const canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', url);
      document.head.appendChild(canonical);
    }
  } else {
    existingCanonical?.remove();
  }
};

/**
 * Sets page metadata (title and meta tags)
 * This function should be called in useEffect when the route changes
 */
export const setPageMetadata = (metadata: PageMetadata = {}): void => {
  const finalMetadata = { ...DEFAULT_METADATA, ...metadata };

  // Update title
  if (finalMetadata.title) {
    updateTitle(finalMetadata.title);
  }

  // Update description
  if (finalMetadata.description) {
    updateMetaTag('description', finalMetadata.description);
  }

  // Update keywords
  if (finalMetadata.keywords) {
    updateMetaTag('keywords', finalMetadata.keywords);
  }

  // Update Open Graph tags
  if (finalMetadata.ogTitle) {
    updateMetaTag('og:title', finalMetadata.ogTitle, 'property');
  }

  if (finalMetadata.ogDescription) {
    updateMetaTag('og:description', finalMetadata.ogDescription, 'property');
  }

  if (finalMetadata.ogImage) {
    updateMetaTag('og:image', finalMetadata.ogImage, 'property');
  }

  // Update canonical URL
  if (finalMetadata.canonical) {
    updateCanonical(finalMetadata.canonical);
  }
};

/**
 * Resets metadata to default values
 */
export const resetPageMetadata = (): void => {
  setPageMetadata(DEFAULT_METADATA);
};
