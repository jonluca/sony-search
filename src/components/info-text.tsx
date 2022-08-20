import * as React from "react";
import { Constants, linkClass } from "../constants";
import { handleOutboundClick } from "../app";

export const InfoText = () => {
  return (
    <>
      <p>
        Maintained by{" "}
        <a
          href={`https://reddit.com/user/${Constants.appAuthor}`}
          className={linkClass + " no-underline hover:underline"}
          target="_blank"
          onClick={(e) => handleOutboundClick(e)}
          rel="noreferrer"
        >
          {Constants.appAuthor}
        </a>
      </p>

      <p>
        <a
          href={`https://github.com/jonluca/sony-search`}
          target="_blank"
          className={linkClass + " no-underline hover:underline"}
          onClick={(e) => handleOutboundClick(e)}
          rel="noreferrer"
        >
          Open source on GitHub
        </a>
      </p>
      <p>Based on churning search by /u/garettg</p>
    </>
  );
};
