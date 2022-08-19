import type { AppProps } from "next/app";
import { GoogleAnalytics, usePageViews, event } from "nextjs-google-analytics";
import type { NextWebVitalsMetric } from "next/app";
import "../index.css";

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
      <div className="mainContent">
        <GoogleAnalytics gaMeasurementId={"G-BTJMKGNN1B"} />
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
