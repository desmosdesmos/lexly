import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { DashboardLayout } from "./pages/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { DocumentGenerator } from "./pages/DocumentGenerator";
import { ContractCheck } from "./pages/ContractCheck";
import { CaseLaw } from "./pages/CaseLaw";
import { LawMonitoring } from "./pages/LawMonitoring";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
      { path: "documents", Component: DocumentGenerator },
      { path: "contracts", Component: ContractCheck },
      { path: "case-law", Component: CaseLaw },
      { path: "monitoring", Component: LawMonitoring },
      { path: "profile", Component: Profile },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
