import * as React from "react";
import { App } from "../app";
import { ErrorWrapper } from "../error";
import { EntryView } from "../components/entry-view";

const Page = () => {
  return (
    <ErrorWrapper>
      <EntryView />
      <App />
    </ErrorWrapper>
  );
};
export default Page;
