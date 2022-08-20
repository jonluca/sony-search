import * as React from "react";
import { Constants, linkClass } from "../constants";
import { ContentView } from "./content";
import { SearchHelp } from "../help";
import { InfoText } from "./info-text";
import { handleOutboundClick } from "../app";
import { useSearchContext } from "../data/context";
import { ContentHeader } from "./content-header";

const NoContent = () => {
  const { old, error } = useSearchContext();

  return (
    <div
      id="results-panel"
      className="flex-1 p-4 overflow-y-scroll bg-white dark:bg-black text-gray-700 dark:text-gray-100"
    >
      <div className="w-full xl:w-3/4 lg:w-5/6 mx-auto">
        {error && (
          <div className="flex items-start bg-red-100 border border-red-400 text-red-700 p-4 mb-4 rounded" role="alert">
            <svg
              className="w-6 h-6 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="font-bold">Error: {error}</div>
          </div>
        )}
        <div className="text-center py-4">
          Search{" "}
          <a
            href={`https://${old ? "old" : "www"}.reddit.com/r/${Constants.appSubreddit}`}
            className={linkClass}
            onClick={(e) => handleOutboundClick(e)}
          >
            r/{Constants.appSubreddit}
          </a>{" "}
          using the{" "}
          <a href="https://pushshift.io/" className={linkClass} onClick={(e) => handleOutboundClick(e)}>
            pushshift.io API
          </a>
          , the same source as{" "}
          <a href="https://redditsearch.io/" className={linkClass} onClick={(e) => handleOutboundClick(e)}>
            redditsearch.io
          </a>
          .
        </div>
        <SearchHelp />
        <div className="text-center text-xs py-4">
          <InfoText />
        </div>
      </div>
    </div>
  );
};
export const ContentContainer = () => {
  const { error, commentsOrPosts, searching, filteredCount } = useSearchContext();

  if (searching) {
    return (
      <div
        id="results-panel"
        aria-live="polite"
        aria-atomic="true"
        className="p-4 mb-8 loader ease-linear rounded-full border-8 border-t-8 border-gray-200 dark:border-gray-800 h-32 w-32 mx-auto my-4"
      >
        <span className="sr-only">Searching</span>
      </div>
    );
  }

  if (!commentsOrPosts) {
    return <NoContent />;
  }

  return (
    <>
      <ContentHeader />
      <div
        id="results-list"
        role="region"
        aria-label="Search Results"
        className="flex-1 overflow-y-scroll p-4 md:px-6 lg:px-8"
      >
        {error && (
          <div
            className="bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100 border border-red-400 divide-y divide-red-400 p-4 mb-4 rounded"
            role="alert"
          >
            <div className="flex items-start pb-4">
              <svg
                className="w-6 h-6 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="font-bold">Error: {error}</div>
            </div>
            <div className="pt-4 text-sm">
              If{" "}
              <a href="https://redditsearch.io" target="_blank" className="underline" rel="noreferrer">
                Reddit Search
              </a>{" "}
              is not working/available, then {Constants.appName} will not be working. Try again later.
            </div>
          </div>
        )}
        {filteredCount > 0 && (
          <>
            <ul className="list-none">
              {commentsOrPosts.map((content) => {
                return <ContentView content={content} key={content.id + content.created_utc} />;
              })}
            </ul>
            <div className="text-center font-bold text-lg py-4">End of Results</div>
          </>
        )}
        {filteredCount === 0 && <div className="text-center font-bold text-lg py-4">No Results Found</div>}
      </div>
      <div id="results-footer" className="flex-none px-4 py-2 text-center text-xs">
        <InfoText />
      </div>
    </>
  );
};
