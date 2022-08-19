import * as React from "react";

import { subDays } from "date-fns";
import { Constants, SearchRange } from "./constants";

export interface SearchSettings {
  query: string;
  author: string;
  time: string;
  selectionRange: any;
  sort: string;
  score: number | string;
  old: boolean;
  showDate: boolean;
  threadType?: object;
}

export class PushshiftAPI {
  get_url(settings: SearchSettings, beta: boolean): string {
    let args: Record<string, any> = {
      subreddit: Constants.appSubreddit,
      filter: "permalink,link_id,id,body,author,score,created_utc",
    };

    if (!beta) {
      args["html_decode"] = true;
      args["user_removed"] = false;
      args["mod_removed"] = false;
      args["sortType"] = "created_utc";
      args["size"] = 100;
    } else {
      args["sort"] = "created_utc";
      args["limit"] = 250;
    }

    if (settings.query) {
      args["q"] = settings.query;
    }

    if (settings.author) {
      args["author"] = settings.author;
    }

    if (settings.time !== "") {
      if (beta) {
        args["since"] = Math.floor(
          subDays(new Date().setHours(0, 0, 0, 0), SearchRange[settings.time].beta).getTime() / 1000,
        );
      } else {
        args["after"] = settings.time;
      }
    } else {
      let startDate = Math.floor(settings.selectionRange.startDate.getTime() / 1000);
      let endDate = Math.floor(settings.selectionRange.endDate.setHours(23, 59, 59, 999) / 1000);
      if (beta) {
        args["since"] = startDate;
        args["until"] = endDate;
      } else {
        args["after"] = startDate;
        args["before"] = endDate;
      }
    }

    if (settings.sort) {
      if (beta) {
        args["order"] = settings.sort;
      } else {
        args["sort"] = settings.sort;
      }
    }
    if (settings.score) {
      if (beta) {
        args["min_score"] = settings.score;
      } else {
        args["score"] = `>${settings.score}`;
      }
    }

    let joinedArgs = Object.entries(args)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    // For testing error handling
    // return 'https://httpstat.us/521';
    return `https://${beta ? "beta" : "api"}.pushshift.io/${
      beta ? "search/reddit/comments" : "reddit/comment/search"
    }?${joinedArgs}`;
  }

  async query(url: string): Promise<any> {
    let results;
    let response = await fetch(url, {
      referrerPolicy: "no-referrer",
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    results = isJson ? await response.json() : null;

    // check for error response
    if (!response.ok) {
      throw response.statusText;
    }

    return results.data;
  }
}
