import Login from "@/pages/auth/Login";
import NotFound from "@/pages/NotFound";
import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";

const Agency = lazy(() => import("@/pages/agency/Agency"));
const SlipCapture = lazy(() => import("@/pages/slip-capture/SlipCapture"));
const Mesa = lazy(() => import("@/pages/mesa/Mesa"));
const TP_TP = lazy(() => import("@/pages/trace-report/tp-tp/TP_TP"));
const TP_CP = lazy(() => import("@/pages/trace-report/tp-cp/TP_CP"));
const CP_CP = lazy(() => import("@/pages/trace-report/cp-cp/CP_CP"));
const CP_TP = lazy(() => import("@/pages/trace-report/cp-tp/CP_TP"));
const PP_PP = lazy(() => import("@/pages/trace-report/pp-pp/PP_PP"));
const Interpole = lazy(() => import("@/pages/Interpole/Interpole"));

export const appRoutes: RouteObject[] = [
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/dashboard", element: <Agency /> },
  { path: "/slipcapture", element: <SlipCapture /> },
  { path: "/mesa", element: <Mesa /> },
  { path: "/interpol", element: <Interpole /> },
  { path: "/trace-report/tp-tp", element: <TP_TP /> },
  { path: "/trace-report/tp-cp", element: <TP_CP /> },
  { path: "/trace-report/cp-cp", element: <CP_CP /> },
  { path: "/trace-report/cp-tp", element: <CP_TP /> },
  { path: "/trace-report/pp-pp", element: <PP_PP /> },
];

export const authRoutes: RouteObject[] = [
  { path: "/login", element: <Login /> },
];

export const fallbackRoute: RouteObject = {
  path: "*",
  element: <NotFound />,
};

export const allRoutes = [...appRoutes, ...authRoutes, fallbackRoute];
