import * as React from "react";
import { Constants } from "../constants";
import Clipboard from "react-clipboard.js";
import { useSearchContext } from "../data/context";
import { toast } from "react-toastify";
import * as ReactGA from "nextjs-google-analytics";

export const ContentHeader = () => {
  const { setState, filteredCount, totalCount, shareUrl } = useSearchContext();

  return (
    <div
      id="results-top-bar"
      className="flex justify-between items-center flex-none px-4 py-2 border-b border-gray-200 dark:border-gray-700"
    >
      <div
        id="results-title"
        aria-live="polite"
        aria-atomic="true"
        className="font-bold text-lg text-gray-700 dark:text-gray-100"
      >
        Showing {filteredCount < totalCount ? `${filteredCount} of ` : ""}
        {totalCount} result{totalCount === 1 ? "" : "s"}
      </div>
      <div id="results-actions" className="flex space-x-2 md:space-x-4">
        <Clipboard
          component="button"
          className="text-xs bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 py-1 px-2 rounded inline-flex items-center"
          button-href="#"
          button-title="Share Results"
          onSuccess={(toShare) => {
            toast.success("Share Link Copied!");
            if (!Constants.isDevMode) {
              ReactGA.event("share", {
                category: "Share",
                action: "Click",
                label: JSON.stringify(toShare),
              });
            }
          }}
          data-clipboard-text={shareUrl}
        >
          <svg
            className="fill-current w-4 h-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span className="hidden md:inline">Share</span>
        </Clipboard>
        <button
          className="text-xs bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 py-1 px-2 rounded inline-flex items-center"
          title="Clear Results"
          onClick={() => {
            setState((oldState) => ({
              ...oldState,
              threadType: {},
              error: null,
              commentsOrPosts: null,
              searching: false,
            }));
          }}
        >
          <svg
            className="fill-current w-4 h-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden md:inline">Clear</span>
        </button>
      </div>
    </div>
  );
};
