// src/app/loading.js

import LoadingScreen from "@/Components/LoadingScreen";


export default function GlobalLoading() {
  // Uses the full screen, blurred overlay variant we built
  return <LoadingScreen label="Please wait..." />;
}