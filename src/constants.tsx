import type * as React from "react";

export const Constants = {
  appId: "sonyalpha-search",
  appName: "Sony Alpha Search",
  appAnalyticsProfile: "G-BTJMKGNN1B",
  appAuthor: "jonluca",
  appSubreddit: "SonyAlpha",
  limit: 100,
  isDevMode: process.env.NODE_ENV !== "production",
};

export const SearchRange = {
  "1d": { name: "1 Day", beta: 1 },
  "7d": { name: "1 Week", beta: 7 },
  "31d": { name: "1 Month", beta: 31 },
  "90d": { name: "3 Months", beta: 90 },
  "182d": { name: "6 Months", beta: 182 },
  "1y": { name: "1 Year", beta: 366 },
  "2y": { name: "2 Years", beta: 732 },
};
export const linkClass = "text-blue-700 dark:text-blue-300 hover:text-blue-500 hover:underline";
export const inputProps: Partial<
  React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
> = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: "false",
};
