import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import ExcelSplitter from "./ExcelSplitter.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/", // The index root path
    element: <App />,
  },
  {
    path: "/splitter",
    element: <ExcelSplitter />,
  },
  {
    path: "/wordToPdf",
    element: <wToP />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/*  Defer the application views structure entirely to the router */}
    <RouterProvider router={router} />
  </React.StrictMode>,
);
