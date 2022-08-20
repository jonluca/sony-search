import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import * as React from "react";
import ta from "time-ago";
import { Constants, linkClass } from "../constants";
import type { Comment, Post } from "../types";
import { useSearchContext } from "../data/context";
import * as ReactGA from "nextjs-google-analytics";

export type Content = (Comment | Post) & { thread: string };

const getImageUrl = (content: Content) => {
  const url = "url" in content && String(content.url);
  if (url) {
    try {
      const parsed = new URL(url.startsWith("/r/") ? `https://reddit.com${url}` : url);
      if (parsed.pathname.match(/\.(jpeg|jpg|gif|png)$/)) {
        return parsed.href;
      }
    } catch (e) {
      console.error(e);
    }
  }
  if ("thumbnail" in content && content.thumbnail) {
    try {
      const url = new URL(content.thumbnail);
      return url.href;
    } catch {
      // do nothing here;
    }
  }
  return null;
};
const disallowedElements = ["link"];
const remarkPlugins = [gfm];
const getVideoEmbed = (content: Content) => {
  const embed = "secure_media_embed" in content && content.secure_media_embed;
  if (embed) {
    try {
      const doc = new DOMParser().parseFromString(embed.content, "text/html");
      return doc.documentElement.textContent;
    } catch (e) {
      console.error(e);
    }
  }

  return null;
};
export const ContentView = ({ content, isFull }: { isFull?: boolean; content: Content }) => {
  const { setSelectedEntry, setState, showDate, old, selectedEntry } = useSearchContext();
  if (!content) {
    return null;
  }

  let permalink;
  if (content.permalink) {
    permalink = content.permalink;
  } else {
    if ("link_id" in content) {
      permalink = `/comments/${content.link_id.split("_")[1]}/_/${content.id}/`;
    }
  }

  let threadBadge;
  if ("thread" in content && content.thread) {
    threadBadge = (
      <div className="bg-blue-600 dark:bg-cyan-600 rounded-full px-3 py-1 text-xs text-white">
        <span className="sr-only">Comment Thread:</span> {content.thread}
      </div>
    );
  }

  const timeAgo = ta.ago(content.created_utc * 1000);
  const date = format(new Date(content.created_utc * 1000), "M/d/yy h:mm aaa");
  let timeText = timeAgo;
  let timeTitle = date;
  if (showDate) {
    timeText = date;
    timeTitle = timeAgo;
  }

  const permalinkLink = `https://${old ? "old" : "www"}.reddit.com${permalink}?context=1`;
  const isGallery = "url" in content && String(content.url).includes("gallery");
  const isSelf = "is_self" in content && content.is_self;

  const imageUrl = getImageUrl(content);
  const videoEmbed = getVideoEmbed(content);

  const body = ("body" in content && content.body) || ("selftext" in content && content.selftext);

  return (
    <div
      className="flex flex-col w-full rounded-md bg-gray-100 dark:bg-gray-900 shadow p-2 mb-2 overflow-hidden"
      key={content.id}
    >
      <div className="flex justify-between items-start">
        <span>
          <a
            className={linkClass + " text-md font-semibold leading-5"}
            target="_blank"
            onClick={() => {
              if (!Constants.isDevMode) {
                ReactGA.event("click", {
                  category: "Author",
                  action: "Click",
                  label: content.author,
                });
              }
            }}
            href={`https://${old ? "old" : "www"}.reddit.com/u/${content.author}`}
            rel="noreferrer"
          >
            <span className="sr-only">Comment Author:</span> {content.author}
          </a>
          {"title" in content && (
            <>
              {" - "}
              <a
                className={linkClass + " text-md font-semibold leading-5"}
                target="_blank"
                onClick={() => {
                  if (!Constants.isDevMode) {
                    ReactGA.event("click", {
                      category: "Title",
                      action: "Click",
                      label: content.title,
                    });
                  }
                }}
                href={permalinkLink}
                rel="noreferrer"
              >
                <span className="sr-only">Title:</span>
                {content.title}
              </a>
            </>
          )}
        </span>
        <div className={`flex ${threadBadge ? "justify-between" : "justify-end"}`}>
          <span
            className="bg-orange-600 rounded-full px-2 mx-2 py-1 mx-1 text-xs text-white"
            title={`Score: ${content.score} point${content.score !== 1 ? "s" : ""}`}
          >
            <span className="sr-only">Comment Score:</span> {content.score}
          </span>
          {isGallery && (
            <span
              className="bg-blue-600 rounded-full px-1 mx-2 py-1 mx-1 text-xs text-white"
              title={`Score: ${content.score} point${content.score !== 1 ? "s" : ""}`}
            >
              Gallery
            </span>
          )}
          {isSelf && (
            <span
              className="bg-blue-600 rounded-full px-1 mx-2 py-1 mx-1 text-xs text-white"
              title={`Score: ${content.score} point${content.score !== 1 ? "s" : ""}`}
            >
              Self
            </span>
          )}
          {threadBadge}
          <span
            className="bg-blue-900 dark:bg-cyan-900 rounded-full px-3 py-1 mx-1 text-xs text-white cursor-pointer"
            onClick={() => {
              setState((oldState) => ({
                ...oldState,
                showDate: !oldState.showDate,
              }));
            }}
            title={timeTitle}
          >
            <span className="sr-only">Comment Posted:</span> {timeText}
          </span>
        </div>
      </div>
      <div
        onClick={() => {
          if (selectedEntry === content) {
            window.open(permalinkLink, "_blank");
          } else {
            setSelectedEntry(content);
          }
          if (!Constants.isDevMode) {
            ReactGA.event("Result", {
              category: "Result",
              action: "Thread",
              label: content.thread,
            });
            ReactGA.event("Result", {
              category: "Result",
              action: "Author",
              label: content.author,
            });
          }
        }}
        className="flex h-full overflow-hidden text-sm leading-0 py-1 px-1fz reddit-comment cursor-pointer"
      >
        {body && (
          <ReactMarkdown
            children={body.replace(/^(?:&gt;)/gm, "\n>")}
            remarkPlugins={remarkPlugins}
            disallowedElements={disallowedElements}
            unwrapDisallowed
          />
        )}
        {!videoEmbed && imageUrl && (
          <img className={"object-contain max-h-100"} src={imageUrl} style={{ maxHeight: isFull ? undefined : 400 }} />
        )}
        {videoEmbed && <div dangerouslySetInnerHTML={{ __html: videoEmbed }} />}
      </div>
    </div>
  );
};
