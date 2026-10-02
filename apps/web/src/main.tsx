import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import routes from "./config/routes.config.tsx";

import "./index.css";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
