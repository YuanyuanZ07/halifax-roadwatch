import HomePage from "./pages/HomePage";
import ReportPage from "./pages/ReportPage";
import MapPage from "./pages/MapPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <div>
      <h1>Halifax RoadWatch</h1>
      <HomePage />
      <ReportPage />
      <MapPage />
      <AdminPage />
    </div>
  );
}