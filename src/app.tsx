import * as React from "react";

import { Constants } from "./constants";
import * as ReactGA from "nextjs-google-analytics";
import { Facets } from "./components/facets";
import { ContentContainer } from "./components/content-container";
import { SearchModal } from "./components/search-modal";

export const handleOutboundClick = (event) => {
  if (!Constants.isDevMode) {
    ReactGA.event("click", {
      category: "Outbound",
      action: "Click",
      label: event.target.href,
    });
  }
};

export const App = () => {
  return (
    <>
      <div id="search-form-panel" className="md:w-1/6 xl:w-1/6 min-w-500 p-4 bg-blue-200 dark:bg-gray-900 shadow-lg">
        <SearchModal />
        <Facets />
      </div>
      <div id="results-panel" className="flex-1 flex flex-col bg-white dark:bg-black overflow-hidden">
        <ContentContainer />
      </div>
    </>
  );
};
