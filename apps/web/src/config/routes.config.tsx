import { Navigate, type RouteObject } from "react-router-dom";

import SignInPage from "@/app/(auth)/login/SignInPage";
import App from "@/app/App";
import AuthLayout from "@/core/layouts/AuthLayout/AuthLayout";

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
    children: [
      {
        path: "auth/*",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <SignInPage />,
          },
          {
            path: "*",
            element: <Navigate to="/auth/login" replace />,
          },
        ],
      },
      {
        path: "",
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />,
  },
];

export default routes;
