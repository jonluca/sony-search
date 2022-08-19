import type { AppProps } from "next/app";
import { GoogleAnalytics, usePageViews, event } from "nextjs-google-analytics";
import type { NextWebVitalsMetric } from "next/app";
import "..//index.css";
import Head from "next/head";

import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import "react-toastify/dist/ReactToastify.css";

export function reportWebVitals({ id, name, label, value }: NextWebVitalsMetric) {
  event(name, {
    category: label === "web-vital" ? "Web Vitals" : "Next.js custom metric",
    value: Math.round(name === "CLS" ? value * 1000 : value), // values must be integers
    label: id, // id unique to current page load
    nonInteraction: true, // avoids affecting bounce rate.
  });
}

function MyApp({ Component, pageProps }: AppProps) {
  usePageViews();

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/static/favicon.ico" />
        <title>Sony Alpha Search</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/static/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/static/icons/favicon.svg" />
        <link rel="alternate icon" type="image/png" sizes="32x32" href="/static/icons/favicon-32x32.png" />
        <link rel="alternate icon" type="image/png" sizes="16x16" href="/static/icons/favicon-16x16.png" />
        <link rel="alternate shortcut icon" href="/static/icons/favicon.ico" />
        <link rel="manifest" href="/static/icons/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#2d89ef" />
        <meta name="msapplication-config" content="/static/icons/browserconfig.xml" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </Head>
      <div className="mainContent">
        <GoogleAnalytics gaMeasurementId={"G-BTJMKGNN1B"} />
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
