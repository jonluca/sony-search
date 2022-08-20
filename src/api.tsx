import { subDays } from "date-fns";
import { Constants, SearchRange } from "./constants";
import type { Content } from "./components/content";

export interface SearchSettings {
  query: string;
  author: string;
  time: string;
  subreddit: string;
  selectionRange: any;
  sort: string;
  score: number | string;
  old: boolean;
  posts: boolean;
  postsImageOnly: boolean;
  showDate: boolean;
}

export class PushshiftAPI {
  constructUrl(settings: SearchSettings, beta: boolean): string {
    const args: Record<string, any> = {
      subreddit: settings.subreddit || Constants.appSubreddit,
    };

    if (!beta) {
      args["html_decode"] = true;
      args["user_removed"] = false;
      args["mod_removed"] = false;
      args["sortType"] = "created_utc";
      args["size"] = Constants.limit;
    } else {
      args["sort"] = "created_utc";
      args["limit"] = Constants.limit;
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
      const startDate = Math.floor(settings.selectionRange.startDate.getTime() / 1000);
      const endDate = Math.floor(settings.selectionRange.endDate.setHours(23, 59, 59, 999) / 1000);
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
    if (settings.posts && settings.postsImageOnly) {
      args["is_self"] = false;
    }

    const joinedArgs = new URLSearchParams(args).toString();

    // For testing error handling
    // return 'https://httpstat.us/521';
    const commentPath = beta ? "search/reddit/comments" : "reddit/comment/search";
    const path = settings.posts ? "reddit/submission/search" : commentPath;
    return `https://${beta ? "beta" : "api"}.pushshift.io/${path}?${joinedArgs}`;
  }

  async query(url: string): Promise<any> {
    const response = await fetch(url, {
      referrerPolicy: "no-referrer",
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const results = isJson ? await response.json() : null;

    // check for error response
    if (!response.ok) {
      throw response.statusText;
    }

    return results.data as Content[];
  }
}
