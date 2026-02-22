import "./App.css";

import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";

import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";
import UpdatesPage from "./pages/UpdatesPage";

function NavItem({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive ? "navLink navLinkActive" : "navLink"
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <div className="appShell">
        <header className="siteHeader">
          <div className="container headerInner">
            <div className="siteName">Halifax RoadWatch</div>

            <nav className="nav" aria-label="Primary">
              <NavItem to="/" end>
                Home
              </NavItem>
              <NavItem to="/report">Report</NavItem>
              <NavItem to="/map">Map</NavItem>
              <NavItem to="/updates">Updates</NavItem>
              <NavItem to="/admin">Admin</NavItem>
            </nav>
          </div>
        </header>

        <main className="container main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}