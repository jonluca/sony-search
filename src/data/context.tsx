import type { Dispatch, SetStateAction } from "react";
import * as React from "react";
import { useEffect, useState } from "react";
import { subDays } from "date-fns";
import { usePushshiftQuery } from "./usePushshiftQuery";
import type { QueryObserverResult } from "@tanstack/react-query";
import type { SearchSettings } from "../api";
import type { Content } from "../components/content";
import { Constants } from "../constants";
import { isEmpty } from "underscore";
import LZString from "lz-string";

const defaultState = {
  query: "",
  author: "",
  subreddit: Constants.appSubreddit,
  time: "1y",
  selectionRange: {
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
    key: "selection",
  },
  sort: "desc",
  score: "",
  old: true, // whether to use old or www reddit links
  postsImageOnly: true, // whether to use old or www reddit links
  posts: true, // whether to use old or www reddit links
  showDate: false,
};
export interface ExtensionContext extends SearchSettings {
  setState: Dispatch<SetStateAction<SearchSettings>>;
  search: () => Promise<QueryObserverResult<any, unknown>>;
  error: any | null;
  searching: boolean;
  shareUrl: string;
  commentsOrPosts: Array<Content>;
  allData: Array<Content>;
  selectedEntry: null | Content;
  setSelectedEntry: Dispatch<SetStateAction<null | Content>>;
  totalCount: number;
  filteredCount: number;
  errorStart?: any;
  errorEnd?: any;
  setThreadOptions: Dispatch<SetStateAction<Record<string, boolean>>>;
  threadOptions: Record<string, boolean>;
}

const SearchContext = React.createContext<ExtensionContext>({
  setState: () => undefined,
  setThreadOptions: () => undefined,
  setSelectedEntry: () => undefined,
  search: () => undefined,
  error: null,
  selectedEntry: null,
  searching: false,
  commentsOrPosts: [],
  allData: [],
  threadOptions: {},
  filteredCount: 0,
  totalCount: 0,
  shareUrl: "",
  ...defaultState,
});
export const utils = {
  compress(obj: any) {
    try {
      return LZString.compressToEncodedURIComponent(JSON.stringify(obj));
    } catch (e) {
      console.log("utils.compress did not happen", "\n", e, "\n", obj);
      return "";
    }
  },
  decompress(string: string) {
    try {
      const decompressedEscaped = LZString.decompressFromEncodedURIComponent(string);
      const decompressed = decodeURIComponent(decompressedEscaped);
      if (decompressedEscaped) {
        return JSON.parse(decompressed);
      } else {
        return {};
      }
    } catch (e) {
      console.log("utils.decompress did not happen", "\n", e, "\n", string);
      return {};
    }
  },
};

const SearchContextProvider = (props: React.PropsWithChildren) => {
  const [state, setState] = useState<SearchSettings>(defaultState);
  const [threadOptions, setThreadOptions] = useState({});
  const [selectedEntry, setSelectedEntry] = useState(null);
  const { refetch, error, data, isLoading, fetchStatus } = usePushshiftQuery(state);

  useEffect(() => {
    localStorage.setItem(Constants.appId, utils.compress(state));
  }, [state]);

  useEffect(() => {
    const loadSavedState = (formData: any = {}, shouldSearch = false) => {
      if (!isEmpty(formData)) {
        if (formData.selectionRange && formData.selectionRange.startDate && formData.selectionRange.endDate) {
          formData.selectionRange.startDate = new Date(formData.selectionRange.startDate);
          formData.selectionRange.endDate = new Date(formData.selectionRange.endDate);
        }
        if (formData.threadType && !isEmpty(formData.threadType)) {
          setThreadOptions(formData.threadType);
        }
        if (formData.selectedEntry && !isEmpty(formData.selectedEntry)) {
          setSelectedEntry(formData.selectedEntry);
        }
        setState({ ...defaultState, ...formData });
        if (shouldSearch) {
          setTimeout(refetch, 200);
        }
      }
    };

    if (window.location.hash) {
      const formData = utils.decompress(window.location.hash.slice(1));
      loadSavedState(formData, true);
      console.log("Loaded state from location.hash");
      // Remove hash now that we have the data
      history.replaceState(null, null, " ");
      return;
    }

    // Load stored form data if exists
    const localStorageData = utils.decompress(localStorage.getItem(Constants.appId));
    if (!isEmpty(localStorageData)) {
      loadSavedState(localStorageData);
      console.log("Loaded state from local storage");
    }
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    setThreadOptions((oldThreadOptions) => {
      // Build a list of unique threads and sort
      const threadsOptions = {};
      const threadsList: string[] = Array.from(new Set(data.map((c) => c.thread))).sort();
      for (let thread of threadsList) {
        thread ||= "None";
        if (!isEmpty(threadOptions) && "thread" in oldThreadOptions) {
          threadsOptions[thread] = oldThreadOptions[thread];
        } else {
          threadsOptions[thread] = true;
        }
      }

      return threadsOptions;
    });
  }, [data]);

  const commentsOrPosts = React.useMemo(() => {
    return (data || []).filter((comment) => {
      const selected = Object.keys(threadOptions).filter((x) => threadOptions[x]);
      if (!comment.thread) {
        return selected.includes("None");
      } else {
        return selected.includes(comment.thread);
      }
    });
  }, [threadOptions, data]);
  const shareUrl = `${typeof window === "undefined" ? "/" : window.location.href}#${utils.compress(state)}`;
  return (
    <SearchContext.Provider
      value={{
        ...state,
        setState,
        search: refetch,
        error,
        commentsOrPosts,
        allData: data,
        totalCount: (data || []).length,
        filteredCount: (commentsOrPosts || []).length,
        searching: isLoading && fetchStatus !== "idle",
        threadOptions,
        setThreadOptions,
        shareUrl,
        selectedEntry,
        setSelectedEntry,
      }}
    >
      {props.children}
    </SearchContext.Provider>
  );
};

const useSearchContext = () => React.useContext(SearchContext);

export { SearchContextProvider, useSearchContext };
