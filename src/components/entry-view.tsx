import * as React from "react";
import { useSearchContext } from "../data/context";
import { ContentView } from "./content";
import Dialog from "@mui/material/Dialog";
import { useEffect } from "react";

export const EntryView = () => {
  const { selectedEntry, setSelectedEntry, commentsOrPosts } = useSearchContext();

  useEffect(() => {
    const listener = (e) => {
      if (e.key === "ArrowLeft") {
        const currentIndex = commentsOrPosts.findIndex(({ id }) => id === selectedEntry.id);
        const newIndex = Math.max(0, currentIndex - 1);
        setSelectedEntry(commentsOrPosts[newIndex]);
      }
      if (e.key === "ArrowRight") {
        const currentIndex = commentsOrPosts.findIndex(({ id }) => id === selectedEntry.id);
        const newIndex = Math.min(commentsOrPosts.length - 1, currentIndex + 1);
        setSelectedEntry(commentsOrPosts[newIndex]);
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [selectedEntry]);

  if (!selectedEntry) {
    return null;
  }
  const onRequestClose = () => setSelectedEntry(null);
  return (
    <Dialog
      onClose={onRequestClose}
      open
      PaperProps={{ sx: { p: 0, m: 0, background: "none", minWidth: "80vw", maxHeight: "90vh", overflow: "auto" } }}
    >
      <ContentView content={selectedEntry} isFull />
    </Dialog>
  );
};
