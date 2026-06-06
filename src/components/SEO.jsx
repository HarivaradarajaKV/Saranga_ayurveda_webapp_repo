import { useEffect } from 'react';

export default function SEO({ 
  title, 
  description, 
  keywords, 
  ogTitle, 
  ogDescription, 
  ogImage, 
  canonicalPath = '', 
  schema 
}) {
  const baseTitle = 'Saranga Ayurveda | Premium Ayurvedic Beauty & Wellness';
  const baseDescription = 'Saranga Ayurveda – Premium Ayurvedic Beauty & Wellness Products. Authentic, natural formulations for skincare, haircare, lip care, and holistic wellness.';
  const domain = 'https://sarangaayurveda.com';

  useEffect(() => {
    // 1. Update Title
    const pageTitle = title ? `${title} | Saranga Ayurveda` : baseTitle;
    document.title = pageTitle;

    // Helper function to create or update meta tags
    const updateMetaTag = (attrName, attrVal, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (el) {
        el.setAttribute('content', content);
      } else {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        el.setAttribute('content', content);
        document.head.appendChild(el);
      }
    };

    // 2. Update Descriptions
    const pageDescription = description || baseDescription;
    updateMetaTag('name', 'description', pageDescription);
    updateMetaTag('property', 'og:description', ogDescription || pageDescription);
    updateMetaTag('property', 'twitter:description', ogDescription || pageDescription);

    // 3. Update Titles (OG / Twitter)
    const shareTitle = ogTitle || title || baseTitle;
    updateMetaTag('property', 'og:title', shareTitle);
    updateMetaTag('property', 'twitter:title', shareTitle);

    // 4. Update Keywords
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // 5. Update Images
    if (ogImage) {
      updateMetaTag('property', 'og:image', ogImage);
      updateMetaTag('property', 'twitter:image', ogImage);
    }

    // 6. Update URL & Canonical
    const currentUrl = `${domain}${canonicalPath || window.location.pathname}`;
    updateMetaTag('property', 'og:url', currentUrl);
    updateMetaTag('property', 'twitter:url', currentUrl);

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', currentUrl);
    } else {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      canonicalEl.setAttribute('href', currentUrl);
      document.head.appendChild(canonicalEl);
    }

    // 7. Inject / Update Schema JSON-LD
    let schemaEl = document.getElementById('jsonld-schema');
    if (schema) {
      if (schemaEl) {
        schemaEl.textContent = JSON.stringify(schema);
      } else {
        schemaEl = document.createElement('script');
        schemaEl.id = 'jsonld-schema';
        schemaEl.type = 'application/ld+json';
        schemaEl.textContent = JSON.stringify(schema);
        document.head.appendChild(schemaEl);
      }
    } else {
      if (schemaEl) {
        schemaEl.remove();
      }
    }

    // Cleanup logic on unmount
    return () => {
      // We don't necessarily need to delete the tags, just let next pages overwrite them,
      // but we should remove the JSON-LD schema so it doesn't leak.
      const currentSchemaEl = document.getElementById('jsonld-schema');
      if (currentSchemaEl) {
        currentSchemaEl.remove();
      }
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonicalPath, schema]);

  return null; // This component doesn't render any visible DOM
}
