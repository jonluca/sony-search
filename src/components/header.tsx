import * as React from "react";
import { Constants } from "../constants";

export const Header = () => {
  return (
    <h1 id="app-title" className="text-2xl text-gray-700 dark:text-gray-100 font-mono tracking-tighter">
      {Constants.appName}
    </h1>
  );
};
