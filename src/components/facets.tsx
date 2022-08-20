import * as React from "react";
import { Constants, linkClass } from "../constants";
import { useSearchContext } from "../data/context";
import * as ReactGA from "nextjs-google-analytics";

export const Facets = () => {
  const { threadOptions, setThreadOptions } = useSearchContext();

  if (!threadOptions || Object.keys(threadOptions).length <= 1) {
    return null;
  }
  const allChecked = Object.values(threadOptions).every((v) => v);
  const threadsFilter = Object.entries(threadOptions).map(([key, value], i) => {
    return (
      <li className="facet flex items-baseline" key={i}>
        <label className="inline-block text-black dark:text-white cursor-pointer relative pl-6 pr-1">
          <span className="absolute left-0 inset-y-0 flex items-center">
            <input
              type="checkbox"
              value={key}
              checked={Boolean(value)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                threadOptions[e.target.value] = e.target.checked;
                if (!Constants.isDevMode) {
                  ReactGA.event("filter", {
                    category: "Filter",
                    action: e.target.value,
                    label: e.target.checked ? "Show" : "Hide",
                  });
                }
                setThreadOptions({ ...threadOptions });
              }}
              className="rounded-md"
            />
          </span>
          <span className="text-sm">{key}</span>
        </label>
        <button
          className={"only cursor-pointer text-sm ml-2 px-1 hidden lg:inline-block " + linkClass}
          aria-label={`show only ${key} thread results`}
          onClick={() => {
            for (const subkey in threadOptions) {
              threadOptions[subkey] = subkey === key;
            }
            if (!Constants.isDevMode) {
              ReactGA.event("filter", {
                category: "Filter",
                action: key,
                label: "Only",
              });
            }
            setThreadOptions({ ...threadOptions });
          }}
        >
          only
        </button>
      </li>
    );
  });
  return (
    <div className="mt-8 mb-4" role="region" aria-label="Search Result Filters">
      <div className="flex justify-between items-center mb-1">
        <label className="text-gray-700 dark:text-gray-100 text-xs font-bold ">Threads Filter</label>
        {allChecked ? null : (
          <button
            className="text-xs focus:outline-none hidden lg:block text-blue-700 hover:text-blue-500 dark:text-cyan-500 dark:hover:text-cyan-300 hover:underline"
            onClick={() => {
              for (const key in threadOptions) {
                threadOptions[key] = true;
              }
              if (!Constants.isDevMode) {
                ReactGA.event("filter", {
                  category: "Filter",
                  action: "All",
                  label: "Show",
                });
              }
              setThreadOptions({ ...threadOptions });
            }}
          >
            Select All
          </button>
        )}
      </div>
      <ul className="py-2 px-4 block w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100 rounded-md">
        {threadsFilter}
      </ul>
    </div>
  );
};
