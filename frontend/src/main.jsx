import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import ExcelSplitter from "./ExcelSplitter.jsx";
import "./index.css";
import WordToPdf from "./WordToPdf.jsx";
import QRCodeGenerator from "./QRCodeGenerator.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/splitter",
    element: <ExcelSplitter />,
  },
  {
    path: "/wordToPdf",
    element: <WordToPdf />,
  },
  {
    path: "/generate-qr",
    element: <QRCodeGenerator />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/*  Defer the application views structure entirely to the router */}
    <RouterProvider router={router} />
  </React.StrictMode>,
);
