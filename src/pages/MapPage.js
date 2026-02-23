import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import mockIssues from "../data/mockIssues";

// Center the map on Halifax, Nova Scotia
const HALIFAX_CENTER = [44.6488, -63.5752];
const DEFAULT_ZOOM = 13;

// Human-readable labels for status and category values
const STATUS_LABELS = {
  reported: "Reported",
  in_progress: "In progress",
  resolved: "Resolved",
};

const CATEGORY_LABELS = {
  road: "Road damage",
  streetlight: "Streetlight",
  building: "Building",
};

// Build a small colored circle icon for the map marker.
// Selected markers are slightly bigger with a blue border.
function createIcon(color, isSelected) {
  let size = 14;
  let border = "2px solid #fff";

  if (isSelected) {
    size = 20;
    border = "3px solid #0057b8";
  }

  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: ${border};
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Pick a color based on issue category and severity.
// Road issues: red (high), orange (medium), yellow (low).
// Streetlight: blue. Building: green.
function getMarkerColor(issue) {
  if (issue.category === "road") {
    if (issue.severity === "high") return "#d63031";
    if (issue.severity === "medium") return "#e67e22";
    return "#f1c40f";
  }
  if (issue.category === "streetlight") return "#2e86de";
  if (issue.category === "building") return "#27ae60";
  return "#888";
}

// Purple pulsing icon used for the "draft pin" (click-to-place marker)
const draftIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 22px;
    height: 22px;
    background: #8e44ad;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    animation: pulse 1.5s infinite;
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Filter issues based on the current search text, category checkboxes,
// status dropdown, and severity dropdown.
function filterIssues(issues, search, categories, status, severity) {
  const searchLower = search.toLowerCase();

  return issues.filter(function (issue) {
    // Category checkbox must be checked
    if (!categories[issue.category]) return false;

    // Status dropdown (skip if "all")
    if (status !== "all" && issue.status !== status) return false;

    // Severity dropdown (skip if "all")
    if (severity !== "all" && issue.severity !== severity) return false;

    // Search text — check title and location
    if (searchLower) {
      const titleMatch = issue.title.toLowerCase().includes(searchLower);
      const locationMatch = issue.locationText.toLowerCase().includes(searchLower);
      if (!titleMatch && !locationMatch) return false;
    }

    return true;
  });
}

// This small component listens for clicks on the Leaflet map.
// react-leaflet requires useMapEvents to be inside <MapContainer>.
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: function (e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const listRef = useRef(null);

  // --- Filter state ---
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState({
    road: true,
    streetlight: true,
    building: true,
  });
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");

  // --- Selection & draft pin ---
  const [selectedId, setSelectedId] = useState(null);
  const [draftPin, setDraftPin] = useState(null); // { lat, lng } or null

  // Build filtered list whenever filters change
  const filtered = useMemo(
    function () {
      return filterIssues(mockIssues, search, categories, status, severity);
    },
    [search, categories, status, severity]
  );

  // Find the full issue object for the selected marker
  const selected = mockIssues.find(function (issue) {
    return issue.id === selectedId;
  }) || null;

  // Toggle one category checkbox on/off
  function toggleCategory(cat) {
    setCategories(function (prev) {
      return { ...prev, [cat]: !prev[cat] };
    });
  }

  // When a marker or list item is clicked, select it and scroll the list
  function handleSelect(id) {
    setSelectedId(id);
    setDraftPin(null); // clear draft pin when selecting an existing issue

    // Scroll the matching list item into view
    if (listRef.current) {
      const el = listRef.current.querySelector('[data-issue-id="' + id + '"]');
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  // When the map background is clicked, place a draft pin at that spot
  function handleMapClick(latlng) {
    setDraftPin({ lat: latlng.lat, lng: latlng.lng });
    setSelectedId(null); // deselect any issue
  }

  // Navigate to the report page with the draft pin coordinates
  function handleUseLocation() {
    if (!draftPin) return;
    navigate(
      "/report?lat=" + draftPin.lat.toFixed(5) + "&lng=" + draftPin.lng.toFixed(5)
    );
  }

  // Return the CSS class string for the small colored dot in the issue list
  function getDotClass(issue) {
    if (issue.category === "road") {
      let colorName = "yellow"; // default for low severity
      if (issue.severity === "high") colorName = "red";
      if (issue.severity === "medium") colorName = "orange";
      return "mp-listDot marker marker-circle marker-" + colorName;
    }
    if (issue.category === "streetlight") {
      return "mp-listDot marker marker-square marker-blue";
    }
    if (issue.category === "building") {
      return "mp-listDot marker marker-triangle marker-green";
    }
    return "mp-listDot";
  }

  return (
    <section className="mapPage">
      <h1 className="pageTitle">Map</h1>

      {/* ── Filter toolbar ── */}
      <div className="mp-toolbar">
        <input
          className="mp-search"
          type="text"
          placeholder="Search issues…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="mp-checks">
          {Object.keys(CATEGORY_LABELS).map((cat) => (
            <label key={cat} className="mp-checkLabel">
              <input type="checkbox" checked={categories[cat]} onChange={() => toggleCategory(cat)} />
              {CATEGORY_LABELS[cat]}
            </label>
          ))}
        </div>

        <select className="mp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="reported">Reported</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select className="mp-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="all">All severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Draft pin info bar */}
      {draftPin && (
        <div className="mp-draftBar">
          <span>
            📍 Selected location: {draftPin.lat.toFixed(4)}, {draftPin.lng.toFixed(4)}
          </span>
          <button className="mp-draftBtn" onClick={handleUseLocation}>
            Use this location
          </button>
          <button className="mp-draftClear" onClick={() => setDraftPin(null)}>
            ✕
          </button>
        </div>
      )}

      {/* ── Two-column body ── */}
      <div className="mp-body">
        {/* Left: issue list */}
        <div className="mp-list" ref={listRef}>
          {filtered.length === 0 && <p className="mp-empty">No issues match your filters.</p>}
          {filtered.map((issue) => (
            <button
              key={issue.id}
              data-issue-id={issue.id}
              className={`mp-listItem${selectedId === issue.id ? " mp-listItemActive" : ""}`}
              onClick={() => handleSelect(issue.id)}
            >
              <span className={getDotClass(issue)} />
              <div className="mp-listText">
                <strong>{issue.title}</strong>
                <small>{issue.locationText}</small>
              </div>
              <span className={`mp-status mp-status--${issue.status}`}>
                {STATUS_LABELS[issue.status]}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Leaflet map + details */}
        <div className="mp-right">
          <div className="mp-map">
            <MapContainer
              center={HALIFAX_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ width: "100%", height: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Click handler for draft pin */}
              <MapClickHandler onMapClick={handleMapClick} />

              {/* Issue markers */}
              {filtered.map((issue) => (
                <Marker
                  key={issue.id}
                  position={[issue.lat, issue.lng]}
                  icon={createIcon(getMarkerColor(issue), selectedId === issue.id)}
                  eventHandlers={{ click: () => handleSelect(issue.id) }}
                >
                  <Popup>
                    <strong>{issue.title}</strong>
                    <br />
                    <small>{issue.locationText}</small>
                  </Popup>
                </Marker>
              ))}

              {/* Draft pin (click-to-drop) */}
              {draftPin && (
                <Marker position={[draftPin.lat, draftPin.lng]} icon={draftIcon}>
                  <Popup>
                    New report location
                    <br />
                    {draftPin.lat.toFixed(4)}, {draftPin.lng.toFixed(4)}
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {/* Legend overlay */}
            <div className="mapLegend">
              <div className="legendTitle">Legend</div>
              <div className="legendRow"><span className="legendSwatch marker-circle marker-red" />High severity</div>
              <div className="legendRow"><span className="legendSwatch marker-circle marker-orange" />Medium</div>
              <div className="legendRow"><span className="legendSwatch marker-circle marker-yellow" />Low</div>
              <div className="legendRow"><span className="legendSwatch marker-square marker-blue" />Streetlight</div>
              <div className="legendRow"><span className="legendSwatch marker-triangle marker-green" />Building</div>
            </div>
          </div>

          {/* Detail card */}
          {selected ? (
            <div className="mp-detail">
              <h3 className="mp-detailTitle">{selected.title}</h3>
              <p className="mp-detailMeta">
                <span>{CATEGORY_LABELS[selected.category]}</span>
                {selected.severity && <span> · Severity: {selected.severity}</span>}
                <span> · {STATUS_LABELS[selected.status]}</span>
              </p>
              <p className="mp-detailLoc">📍 {selected.locationText}</p>
              <p className="mp-detailCoords">
                Coordinates: {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
              </p>
            </div>
          ) : (
            <p className="mp-detailHint">
              Click an issue to see details, or click anywhere on the map to select a location for a new report.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}