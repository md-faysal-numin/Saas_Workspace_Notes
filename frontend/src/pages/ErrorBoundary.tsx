import { useRouteError } from "react-router-dom";

export default function ErrorBoundary() {
  const error: any = useRouteError();
  console.log("hi");
  return (
    <div>
      <h1>Error</h1>
      <p>{error.statusText || error.message}</p>
    </div>
  );
}
