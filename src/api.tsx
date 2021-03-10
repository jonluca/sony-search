import * as React from "react";

export interface SearchSettings {
  query: string,
  author: string,
  after: string,
  start: string,
  end: string,
  sort: string,
  sortType: string,
  filter: string
}

export class PushshiftAPI {
  get_url(settings: SearchSettings): string {
    let args = {
      html_decode: "true",
      subreddit: "churning",
      size: 100, // API limit
	  user_removed: "false",
	  mod_removed: "false",
	  filter: "permalink,link_id,id,body,author,score,created_utc"
    };
	if (settings.query) {
      args["q"] = settings.query;
    }
    if (settings.author) {
      args["author"] = settings.author;
    }
	if (settings.after !== "") {
      args["after"] = settings.after;
    } else {
	  let startTime = settings.start + " 00:00:00";
	  args["after"] = parseInt((new Date(startTime).getTime() / 1000).toFixed(0));
	  let endTime = settings.end + " 23:59:59";
	  args["before"] = parseInt((new Date(endTime).getTime() / 1000).toFixed(0));
    }
    if (settings.sort) {
      args["sort"] = settings.sort;
    }
    if (settings.sortType) {
      args["sort_type"] = settings.sortType;
    }
	if (settings.filter) {
      args["score"] = settings.filter;
    }
    let joinedArgs = Object.entries(args).map(([k, v]) => `${k}=${v}`).join('&');
    return `https://api.pushshift.io/reddit/comment/search?${joinedArgs}`
  }

  async query(url: string): Promise<any> {
    let resp = await fetch(url, {
      referrerPolicy: 'no-referrer'
    });
    let data = await resp.json();
    for (let i = 0, len = data.data.length; i < len; i++) {
      let permalink = data.data[i].permalink;
      switch (true) {
        case /(bank_account_bonus_week_|bank_bonus_weekly_)/.test(permalink):
          data.data[i].thread = "Bank Account Bonus";
          break;
        case /(question_thread_|newbie_question_weekly_|newbie_weekly_question_)/.test(permalink):
          data.data[i].thread = "Daily Question";
          break;
        case /(discussion_thread_|daily_discussion_)/.test(permalink):
          data.data[i].thread = "Daily Discussion";
          break;
        case /manufactured_spending_weekly_/.test(permalink):
          data.data[i].thread = "Manufactured Spend";
          break;
        case /(data_points_central_|data_points_weekly_)/.test(permalink):
          data.data[i].thread = "Data Points";
          break;
        case /what_card_should_i_get_/.test(permalink):
          data.data[i].thread = "What Card Should I Get";
          break;
        case /frustration_friday_/.test(permalink):
          data.data[i].thread = "Frustration";
          break;
		case /mods_choice_/.test(permalink):
          data.data[i].thread = "Mod's Choice";
          break;
        case /(weekly_offtopic_thread_|weekly_off_topic_thread_|anything_goes_thread_)/.test(permalink):
          data.data[i].thread = "Off Topic";
          break;
        case /(trip_reports_and_churning_success_stories_|storytime_weekly_|trip_report_weekly_)/.test(permalink):
          data.data[i].thread = "Trip Report/Success";
          break;
        default:
          data.data[i].thread = "";
      }
    }
    return data;
  }
}
