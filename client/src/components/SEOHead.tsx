import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SITE_NAME = "MindPrism";
const DEFAULT_DESCRIPTION =
  "Transform dense psychology books into bite-sized principles, interactive exercises, stories, and audio summaries.";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage,
  ogType = "website",
  noIndex = false,
}: SEOHeadProps) {
  const [location] = useLocation();
  const fullTitle = title ? `${title} | ${SITE_NAME} - Psychology Made Simple` : `${SITE_NAME} - Psychology Made Simple`;
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
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
