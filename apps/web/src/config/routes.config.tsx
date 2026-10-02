import { Navigate, type RouteObject } from "react-router-dom";

import App from "../App";

export type RouteItemType = RouteObject & {
  children?: RouteItemType[];
};

export type RoutesType = RouteItemType[];

export type RouteConfigType = {
  routes: RoutesType;
};

export type RouteConfigsType = RouteConfigType[] | [];

const routes: RoutesType = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;
