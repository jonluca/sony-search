import * as React from "react";
import { App } from "../app";
import { ErrorWrapper } from "../error";

const Page = () => {
  return (
    <ErrorWrapper>
      <App />
    </ErrorWrapper>
  );
};
export default Page;
