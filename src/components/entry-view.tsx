import * as React from "react";
import { useSearchContext } from "../data/context";
import { ContentView } from "./content";
import Dialog from "@mui/material/Dialog";

export const EntryView = () => {
  const { selectedEntry, setSelectedEntry } = useSearchContext();
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
