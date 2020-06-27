import * as React from "react";

export interface SearchSettings {
  query: string,
  author: string,
  after: string,
  sort: string,
  sortType: string,
  filter: string
}

export class PushshiftAPI {
  get_url(settings: SearchSettings): string {
    let args = {
      html_decode: "true",
      subreddit: "churning",
      size: "500"
    };
    if (settings.after) {
      args["after"] = settings.after;
    }
    if (settings.author) {
      args["author"] = settings.author;
    }
    if (settings.query) {
      args["q"] = settings.query;
    }
    if (settings.filter) {
      args["score"] = settings.filter;
    }
    if (settings.sort) {
      args["sort"] = settings.sort;
    }
    if (settings.sortType) {
      args["sort_type"] = settings.sortType;
    }
    let joinedArgs = Object.entries(args).map(([k, v]) => `${k}=${v}`).join('&');
    return `https://api.pushshift.io/reddit/comment/search?${joinedArgs}`
  }

  async query(url: string): Promise<any> {
    console.log(`Pushshift request ${url}`);
    let resp = await fetch(url, {
      referrerPolicy: "no-referrer"
    });
    let data = await resp.json();

    for (let i = 0, len = data.data.length; i < len; i++) {
      let permalink = data.data[i].permalink;
      switch (true) {
        case /bank_account_bonus_week_/.test(permalink):
          data.data[i].thread = "Bank Account Bonus";
          break;
        case /(question_thread_|newbie_question_)/.test(permalink):
          data.data[i].thread = "Daily Question";
          break;
        case /discussion_thread_/.test(permalink):
          data.data[i].thread = "Daily Discussion";
          break;
        case /manufactured_spending_weekly_thread_/.test(permalink):
          data.data[i].thread = "Manufactured Spend";
          break;
        case /data_points_central_thread_/.test(permalink):
          data.data[i].thread = "Data Points";
          break;
        case /what_card_should_i_/.test(permalink):
          data.data[i].thread = "What Card Should I Get";
          break;
        case /frustration_friday_/.test(permalink):
          data.data[i].thread = "Frustration Friday";
          break;
        case /weekly_offtopic_thread_week_/.test(permalink):
          data.data[i].thread = "Off Topic";
          break;
        case /(trip_reports_and_churning_success_stories_|storytime_weekly_|trip_report_weekly_)/.test(permalink):
          data.data[i].thread = "Trip Report/Storytime";
          break;
        default:
          data.data[i].thread = "";
      }
    }

    return data;
  }
}
