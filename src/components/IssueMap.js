import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Center the map on Halifax, Nova Scotia
const HALIFAX_CENTER = [44.6488, -63.5752];
const DEFAULT_ZOOM = 13;

// Small helper that tells Leaflet to recalculate its size after mount.
// This fixes blank tiles when the container size changes (e.g. responsive).
function MapResizeHandler() {
  var map = useMap();
  useEffect(function () {
    // Short delay so the container has its final size
    var timer = setTimeout(function () {
      map.invalidateSize();
    }, 200);
    return function () { clearTimeout(timer); };
  }, [map]);
  return null;
}

// Human-readable status labels for popups
const STATUS_LABELS = {
  reported: "Reported",
  in_progress: "In progress",
  resolved: "Resolved",
};

// ── Marker icon helpers ──

// Build a small colored circle icon for the map marker.
// Selected markers are slightly bigger with a blue border.
function createIcon(color, isSelected) {
  var size = 14;
  var border = "2px solid #fff";

  if (isSelected) {
    size = 20;
    border = "3px solid #0057b8";
  }

  return L.divIcon({
    className: "",
    html:
      '<div style="' +
      "width:" + size + "px;" +
      "height:" + size + "px;" +
      "background:" + color + ";" +
      "border:" + border + ";" +
      "border-radius:50%;" +
      "box-shadow:0 1px 4px rgba(0,0,0,0.3);" +
      '"></div>',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Pick a color based on issue category and severity.
// Road issues: red (high), orange (medium), yellow (low).
// Streetlight: blue.  Building: green.
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

// ── IssueMap component ──
//
// Props:
//   issues          – array of issue objects (id, title, category, severity, lat, lng, etc.)
//   selectedIssueId – id of the currently-selected issue (optional)
//   onSelectIssue   – callback when user clicks a marker (optional)
//   height          – CSS height string, default "480px"
//   interactive     – enable scroll-wheel zoom, default true
//   children        – extra react-leaflet children (e.g. MapClickHandler, draft markers)
export default function IssueMap({
  issues,
  selectedIssueId,
  onSelectIssue,
  height,
  interactive,
  children,
}) {
  // Apply defaults
  // height prop can be a string ("70vh") or a number (480 → "480px")
  var mapHeight = height || "480px";
  if (typeof mapHeight === "number") {
    mapHeight = mapHeight + "px";
  }
  var scrollZoom = interactive !== false; // default true

  return (
    <div className="mp-map" style={{ height: mapHeight }}>
      <MapContainer
        center={HALIFAX_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={scrollZoom}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Recalculate map size after mount */}
        <MapResizeHandler />

        {/* Render a marker for each issue */}
        {issues.map(function (issue) {
          var isSelected = issue.id === selectedIssueId;
          var color = getMarkerColor(issue);

          return (
            <Marker
              key={issue.id}
              position={[issue.lat, issue.lng]}
              icon={createIcon(color, isSelected)}
              eventHandlers={{
                click: function () {
                  if (onSelectIssue) {
                    onSelectIssue(issue.id);
                  }
                },
              }}
            >
              <Popup>
                <strong>{issue.title}</strong>
                <br />
                <small>{issue.locationText}</small>
                <br />
                <small>{STATUS_LABELS[issue.status] || issue.status}</small>
              </Popup>
            </Marker>
          );
        })}

        {/* Any extra children (e.g. click handler, draft pin) */}
        {children}
      </MapContainer>

      {/* Legend overlay */}
      <div className="mapLegend">
        <div className="legendTitle">Legend</div>
        <div className="legendRow">
          <span className="legendSwatch marker-circle marker-red" />
          High severity
        </div>
        <div className="legendRow">
          <span className="legendSwatch marker-circle marker-orange" />
          Medium
        </div>
        <div className="legendRow">
          <span className="legendSwatch marker-circle marker-yellow" />
          Low
        </div>
        <div className="legendRow">
          <span className="legendSwatch marker-square marker-blue" />
          Streetlight
        </div>
        <div className="legendRow">
          <span className="legendSwatch marker-triangle marker-green" />
          Building
        </div>
      </div>
    </div>
  );
}
