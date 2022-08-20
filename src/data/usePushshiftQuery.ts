import { useQuery } from "@tanstack/react-query";
import type { SearchSettings } from "../api";
import { PushshiftAPI } from "../api";
import { Constants } from "../constants";
import { utils } from "./context";
import type { Content } from "../components/content";
const api = new PushshiftAPI();

export const usePushshiftQuery = (searchSettings: SearchSettings) => {
  const { sort } = searchSettings;
  return useQuery(
    ["pushshift", searchSettings],
    async () => {
      const urlProd = api.constructUrl(searchSettings, false);

      localStorage.setItem(Constants.appId, utils.compress(searchSettings));

      const dataResults = await api.query(urlProd);

      const data: Content[] = dataResults.sort((a, b) => {
        if (sort === "asc") {
          return a.created_utc - b.created_utc;
        } else {
          return b.created_utc - a.created_utc;
        }
      });

      for (const datum of data) {
        if ("link_flair_text" in datum) {
          datum.thread = datum.link_flair_text;
        } else {
          // import from permalink
        }
      }

      return data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: false, // disable this query from automatically running
    },
  );
};
