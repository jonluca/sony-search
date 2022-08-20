import * as React from "react";
import { inputProps, SearchRange } from "../constants";
import { Header } from "./header";
import { DateRange } from "react-date-range";
import { useSearchContext } from "../data/context";
import { subDays } from "date-fns";
const textInputClasses =
  "dark:bg-black text-sm text-gray-700 dark:text-gray-100 mt-1 block w-full rounded-md bg-gray-100 focus:bg-white dark:focus:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-800 dark:focus:border-blue-300 focus:ring focus:ring-blue-800 dark:focus:ring-blue-400 focus:ring-opacity-50";

export const SearchModal = () => {
  const {
    query,
    author,
    selectionRange,
    sort,
    score,
    time,
    postsImageOnly,
    subreddit,
    posts,
    old,
    search,
    setState,
    searching,
  } = useSearchContext();

  const searchSubmit = async (e) => {
    // Update state
    e.preventDefault();
    search();
  };

  const handleTextChange = (text: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setState((oldState) => ({ ...oldState, [text]: e.target.value }));
  };
  const handleCheckboxChange = (text: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((oldState) => ({ ...oldState, [text]: e.target.checked }));
  };

  return (
    <form role="search" aria-label="Search Form" onSubmit={searchSubmit}>
      <Header />
      {/* Search Query */}
      <div className="mt-2">
        <label className="block text-gray-700 dark:text-gray-100 text-xs font-bold mb-1" htmlFor="search-query">
          Search
        </label>
        <input
          onChange={handleTextChange("query")}
          id="search-query"
          type="search"
          value={query}
          className={textInputClasses}
          {...inputProps}
        />
      </div>
      {/* Author */}
      <div className="mt-2">
        <label className="block text-gray-700 dark:text-gray-100 text-xs font-bold mb-1" htmlFor="author">
          Author
        </label>
        <input
          onChange={handleTextChange("author")}
          id="author"
          type="search"
          value={author}
          className={textInputClasses}
          {...inputProps}
        />
      </div>{" "}
      {/* subreddit */}
      <div className="mt-2">
        <label className="block text-gray-700 dark:text-gray-100 text-xs font-bold mb-1" htmlFor="subreddit">
          Subreddit
        </label>
        <input
          onChange={handleTextChange("subreddit")}
          id="subreddit"
          type="search"
          value={subreddit}
          className={textInputClasses}
          {...inputProps}
        />
      </div>
      {/* Time Range */}
      <div className="mt-2">
        <label className="block text-gray-700 dark:text-gray-100 text-xs font-bold mb-1" htmlFor="time-range">
          Time Range
        </label>
        <div className="relative">
          <select
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const tempState: Record<string, any> = { time: e.target.value };
              if (e.target.value !== "") {
                tempState.selectionRange = {
                  startDate: subDays(new Date(), 7),
                  endDate: new Date(),
                  key: "selection",
                };
              }
              setState((oldState) => ({ ...oldState, ...tempState }));
            }}
            id="time-range"
            value={time}
            className={textInputClasses}
          >
            {Object.entries(SearchRange).map(([key, obj], index) => {
              return (
                <option value={key} key={index}>
                  {obj.name}
                </option>
              );
            })}
            <option value="">Custom</option>
          </select>
        </div>
      </div>
      {/* Date Range Picker */}
      <div className={`mt-2 customize-date-range ${time === "" ? "block" : "hidden"}`}>
        <DateRange
          editableDateInputs={false}
          onChange={(item) => setState((oldState) => ({ ...oldState, selectionRange: item.selection }))}
          moveRangeOnFirstSelection={false}
          minDate={new Date(2012, 11, 11, 0, 0, 0, 0)}
          maxDate={new Date()}
          ranges={[selectionRange]}
          rangeColors={["#3182ce", "#3ecf8e", "#fed14c"]}
        />
      </div>
      <div className="mt-2 grid grid-cols-8 gap-3">
        {/* Sort Direction */}
        <div className="col-span-3">
          <label
            className="block text-gray-700 dark:text-gray-100 text-xs font-bold truncate mb-1"
            htmlFor="sort-order"
          >
            Sort By
          </label>
          <div className="relative">
            <select onChange={handleTextChange("sort")} id="sort-order" value={sort} className={textInputClasses}>
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
        </div>
        {/* Score */}
        <div className="col-span-3">
          <label className="block text-gray-700 dark:text-gray-100 text-xs font-bold truncate mb-1" htmlFor="min-score">
            <abbr title="Minimum" className="no-underline">
              Min
            </abbr>{" "}
            Score
          </label>
          <input
            onChange={handleTextChange("score")}
            id="min-score"
            type="text"
            value={score}
            className={textInputClasses}
            placeholder="e.g. 1"
            {...inputProps}
          />
        </div>
        {/* Old Reddit Toggle */}
        <div className="col-span-2">
          <label htmlFor="toggle-old" className="block cursor-pointer">
            <div className="text-gray-700 dark:text-gray-100 text-xs font-bold truncate mb-1">Old Reddit</div>
            <div className="relative mt-4 mx-2">
              <input
                id="toggle-old"
                type="checkbox"
                checked={old}
                onChange={handleCheckboxChange("old")}
                className="sr-only custom-toggle"
              />
              <div className="w-8 h-3 bg-gray-300 dark:bg-gray-700 rounded-full shadow-inner" />
              <div className="dot absolute w-5 h-5 bg-white dark:bg-black rounded-full shadow -left-1 -top-1 transition" />
            </div>
          </label>
        </div>
        <span className="col-span-3">
          <label htmlFor="toggle-posts" className="block cursor-pointer">
            <div className="text-gray-700 dark:text-gray-100 text-xs font-bold truncate mb-1">Posts</div>
            <div className="relative mt-4 mx-2">
              <input
                id="toggle-posts"
                type="checkbox"
                checked={posts}
                onChange={handleCheckboxChange("posts")}
                className="sr-only custom-toggle"
              />
              <div className="w-8 h-3 bg-gray-300 dark:bg-gray-700 rounded-full shadow-inner" />
              <div className="dot absolute w-5 h-5 bg-white dark:bg-black rounded-full shadow -left-1 -top-1 transition" />
            </div>
          </label>
        </span>
        <span className="col-span-3">
          {posts && (
            <label htmlFor="toggle-images-only" className="block cursor-pointer">
              <div className="text-gray-700 dark:text-gray-100 text-xs font-bold truncate mb-1">
                Images & Video only
              </div>
              <div className="relative mt-4 mx-2">
                <input
                  id="toggle-images-only"
                  type="checkbox"
                  checked={postsImageOnly}
                  onChange={handleCheckboxChange("postsImageOnly")}
                  className="sr-only custom-toggle"
                />
                <div className="w-8 h-3 bg-gray-300 dark:bg-gray-700 rounded-full shadow-inner" />
                <div className="dot absolute w-5 h-5 bg-white dark:bg-black rounded-full shadow -left-1 -top-1 transition" />
              </div>
            </label>
          )}
        </span>
      </div>
      {/* Submit Button */}
      <div className="mt-4">
        <button
          type="submit"
          disabled={searching}
          className={
            "w-full rounded-md text-lg px-4 py-2 font-semibold tracking-wider text-white dark:text-gray-100 bg-blue-900 dark:bg-cyan-900 " +
            (searching ? "cursor-not-allowed" : "hover:bg-blue-700 dark:hover:bg-cyan-700")
          }
        >
          <span>{searching ? "Searching..." : "Search"}</span>
        </button>
      </div>
    </form>
  );
};
