import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "MindPrism";
const DEFAULT_DESCRIPTION =
  "Transform dense psychology books into bite-sized chapters, mental models, and audio summaries.";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage,
  ogType = "website",
  noIndex = false,
  jsonLd,
}: SEOHeadProps) {
  const [location] = useLocation();
  const fullTitle = title ? `${title} | ${SITE_NAME} - Big Ideas, Made Simple` : `${SITE_NAME} - Big Ideas, Made Simple`;
  const canonicalUrl = `${window.location.origin}${location}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <link rel="canonical" href={canonicalUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
