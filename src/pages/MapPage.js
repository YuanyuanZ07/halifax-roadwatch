import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import mockIssues from "../data/mockIssues";
import IssueMap from "../components/IssueMap";

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

// Purple pulsing icon used for the "draft pin" (click-to-place marker)
const draftIcon = L.divIcon({
  className: "",
  html: '<div style="'
    + "width:22px;height:22px;"
    + "background:#8e44ad;"
    + "border:3px solid #fff;"
    + "border-radius:50%;"
    + "box-shadow:0 2px 6px rgba(0,0,0,0.4);"
    + "animation:pulse 1.5s infinite;"
    + '"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Filter issues based on the current search text, category checkboxes,
// status dropdown, and severity dropdown.
function filterIssues(issues, search, categories, status, severity) {
  var searchLower = search.toLowerCase();

  return issues.filter(function (issue) {
    // Category checkbox must be checked
    if (!categories[issue.category]) return false;

    // Status dropdown (skip if "all")
    if (status !== "all" && issue.status !== status) return false;

    // Severity dropdown (skip if "all")
    if (severity !== "all" && issue.severity !== severity) return false;

    // Search text — check title and location
    if (searchLower) {
      var titleMatch = issue.title.toLowerCase().includes(searchLower);
      var locationMatch = issue.locationText.toLowerCase().includes(searchLower);
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
  var navigate = useNavigate();
  var listRef = useRef(null);

  // --- Filter state ---
  var [search, setSearch] = useState("");
  var [categories, setCategories] = useState({
    road: true,
    streetlight: true,
    building: true,
  });
  var [status, setStatus] = useState("all");
  var [severity, setSeverity] = useState("all");

  // --- Selection & draft pin ---
  var [selectedId, setSelectedId] = useState(null);
  var [draftPin, setDraftPin] = useState(null); // { lat, lng } or null

  // Build filtered list whenever filters change
  var filtered = useMemo(
    function () {
      return filterIssues(mockIssues, search, categories, status, severity);
    },
    [search, categories, status, severity]
  );

  // Find the full issue object for the selected marker
  var selected = mockIssues.find(function (issue) {
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
      var el = listRef.current.querySelector('[data-issue-id="' + id + '"]');
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
      var colorName = "yellow"; // default for low severity
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
          onChange={function (e) { setSearch(e.target.value); }}
        />

        <div className="mp-checks">
          {Object.keys(CATEGORY_LABELS).map(function (cat) {
            return (
              <label key={cat} className="mp-checkLabel">
                <input
                  type="checkbox"
                  checked={categories[cat]}
                  onChange={function () { toggleCategory(cat); }}
                />
                {CATEGORY_LABELS[cat]}
              </label>
            );
          })}
        </div>

        <select className="mp-select" value={status} onChange={function (e) { setStatus(e.target.value); }}>
          <option value="all">All statuses</option>
          <option value="reported">Reported</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select className="mp-select" value={severity} onChange={function (e) { setSeverity(e.target.value); }}>
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
          <button className="mp-draftClear" onClick={function () { setDraftPin(null); }}>
            ✕
          </button>
        </div>
      )}

      {/* ── Two-column body ── */}
      <div className="mp-body">
        {/* Left: issue list */}
        <div className="mp-list" ref={listRef}>
          {filtered.length === 0 && <p className="mp-empty">No issues match your filters.</p>}
          {filtered.map(function (issue) {
            return (
              <button
                key={issue.id}
                data-issue-id={issue.id}
                className={"mp-listItem" + (selectedId === issue.id ? " mp-listItemActive" : "")}
                onClick={function () { handleSelect(issue.id); }}
              >
                <span className={getDotClass(issue)} />
                <div className="mp-listText">
                  <strong>{issue.title}</strong>
                  <small>{issue.locationText}</small>
                </div>
                <span className={"mp-status mp-status--" + issue.status}>
                  {STATUS_LABELS[issue.status]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Leaflet map + details */}
        <div className="mp-right">
          <IssueMap
            issues={filtered}
            selectedIssueId={selectedId}
            onSelectIssue={handleSelect}
            height="70vh"
            interactive={true}
          >
            {/* Click handler for draft pin */}
            <MapClickHandler onMapClick={handleMapClick} />

            {/* Draft pin (click-to-drop) */}
            {draftPin && (
              <Marker position={[draftPin.lat, draftPin.lng]} icon={draftIcon}>
                <Popup>
                  New report location<br />
                  {draftPin.lat.toFixed(4)}, {draftPin.lng.toFixed(4)}
                </Popup>
              </Marker>
            )}
          </IssueMap>

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