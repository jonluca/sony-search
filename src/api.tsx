import * as React from "react";

import { subDays } from 'date-fns';

export interface SearchSettings {
    query: string,
    author: string,
    after: string,
    start: string,
    end: string,
    sort: string
}

const SearchRange = {
    "1d": {
        "name": "1 Day",
        "beta": 1
    },
    "7d": {
        "name": "1 Week",
        "beta": 7
    },
    "31d": {
        "name": "1 Month",
        "beta": 31
    },
    "90d": {
        "name": "3 Months",
        "beta": 90
    },
    "182d": {
        "name": "6 Months",
        "beta": 182
    },
    "1y": {
        "name": "1 Year",
        "beta": 366
    },
    "2y": {
        "name": "2 Years",
        "beta": 732
    },
}

export class PushshiftAPI {
    get_url(settings: SearchSettings, beta: boolean): string {
        let args = {
            sortType: "created_utc",
            subreddit: "churning",
            size: 250, // API limit
            filter: "permalink,link_id,id,body,author,score,created_utc"
        };

        if (!beta) {
            args["html_decode"] = true;
            args["user_removed"] = false;
            args["mod_removed"] = false;
        }
        if (settings.query) {
            args["q"] = settings.query;
        }
        if (settings.author) {
            args["author"] = settings.author;
        }
        if (settings.after !== "") {
            if (beta) {
                args["min_created_utc"] = Math.floor((subDays(new Date().setHours(0,0,0,0), SearchRange[settings.after].beta).getTime()) / 1000 );
            } else {
                args["after"] = settings.after;
            }
        } else {
            if (beta) {
                args["min_created_utc"] = Math.floor(new Date(settings.start).getTime() / 1000);
                args["max_created_utc"] = Math.floor(new Date(settings.end).getTime() / 1000);
            } else {
                args["after"] = Math.floor(new Date(settings.start).getTime() / 1000);
                args["before"] = Math.floor(new Date(settings.end).getTime() / 1000);
            }
        }
        if (settings.sort) {
            args["sort"] = settings.sort;
        }
        if (settings.score) {
            if (beta) {
                args["min_score"] = settings.score;
            } else {
                args["score"] = `>${settings.score}`
            }
        }

        let joinedArgs = Object.entries(args).map(([k, v]) => `${k}=${v}`).join('&');

        if (beta) {
            return `https://beta.pushshift.io/search/reddit/comments?${joinedArgs}`;
        } else {
            return `https://api.pushshift.io/reddit/comment/search?${joinedArgs}`;
        }
    }

    async query(url: string): Promise<any> {
        let resp = await fetch(url, {
            referrerPolicy: 'no-referrer'
        });
        let data = await resp.json();
        return data.data;
    }
}
