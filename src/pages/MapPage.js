import { useState, useMemo } from "react";

/* ── Fake issue data ── */
const ISSUES = [
  { id: 1,  type: "pothole",     severity: "high",   status: "reported",    title: "Deep pothole on Barrington St",    locationText: "Barrington St & Sackville St",  x: 22, y: 25 },
  { id: 2,  type: "pothole",     severity: "medium", status: "in_progress", title: "Cracked pavement near Spring Garden", locationText: "Spring Garden Rd",            x: 52, y: 55 },
  { id: 3,  type: "pothole",     severity: "low",    status: "resolved",    title: "Minor surface crack",              locationText: "Quinpool Rd",                    x: 74, y: 38 },
  { id: 4,  type: "pothole",     severity: "high",   status: "reported",    title: "Sinkhole forming on Robie St",     locationText: "Robie St near Commons",          x: 35, y: 68 },
  { id: 5,  type: "streetlight", severity: null,      status: "reported",    title: "Flickering streetlight",           locationText: "Gottingen St & Cogswell St",     x: 60, y: 20 },
  { id: 6,  type: "streetlight", severity: null,      status: "in_progress", title: "Broken lamp post",                locationText: "North Park St",                  x: 42, y: 75 },
  { id: 7,  type: "building",    severity: null,      status: "reported",    title: "Crumbling steps at community centre", locationText: "Halifax North Memorial Library", x: 80, y: 48 },
  { id: 8,  type: "building",    severity: null,      status: "resolved",    title: "Damaged railing at rec centre",   locationText: "Needham Centre",                 x: 18, y: 58 },
  { id: 9,  type: "pothole",     severity: "medium", status: "reported",    title: "Rough patch on South St",          locationText: "South St near Inglis",           x: 48, y: 42 },
  { id: 10, type: "streetlight", severity: null,      status: "resolved",    title: "Light out near waterfront",        locationText: "Lower Water St",                 x: 30, y: 32 },
];

const STATUS_LABELS = { reported: "Reported", in_progress: "In progress", resolved: "Resolved" };
const TYPE_LABELS   = { pothole: "Road damage", streetlight: "Streetlight", building: "Building" };

function markerClass(issue) {
  if (issue.type === "pothole") {
    const c = issue.severity === "high" ? "red" : issue.severity === "medium" ? "orange" : "yellow";
    return `marker marker-circle marker-${c}`;
  }
  if (issue.type === "streetlight") return "marker marker-square marker-blue";
  if (issue.type === "building")    return "marker marker-triangle marker-green";
  return "marker";
}

export default function MapPage() {
  const [search, setSearch]       = useState("");
  const [types, setTypes]         = useState({ pothole: true, streetlight: true, building: true });
  const [status, setStatus]       = useState("all");
  const [severity, setSeverity]   = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ISSUES.filter((i) => {
      if (!types[i.type]) return false;
      if (status !== "all" && i.status !== status) return false;
      if (severity !== "all" && i.type === "pothole" && i.severity !== severity) return false;
      if (q && !i.title.toLowerCase().includes(q) && !i.locationText.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, types, status, severity]);

  const selected = ISSUES.find((i) => i.id === selectedId) || null;

  function toggleType(t) {
    setTypes((prev) => ({ ...prev, [t]: !prev[t] }));
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
          {Object.keys(TYPE_LABELS).map((t) => (
            <label key={t} className="mp-checkLabel">
              <input type="checkbox" checked={types[t]} onChange={() => toggleType(t)} />
              {TYPE_LABELS[t]}
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

      {/* ── Two-column body ── */}
      <div className="mp-body">
        {/* Left: issue list */}
        <div className="mp-list">
          {filtered.length === 0 && <p className="mp-empty">No issues match your filters.</p>}
          {filtered.map((issue) => (
            <button
              key={issue.id}
              className={`mp-listItem${selectedId === issue.id ? " mp-listItemActive" : ""}`}
              onClick={() => setSelectedId(issue.id)}
            >
              <span className={`mp-listDot ${markerClass(issue)}`} />
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

        {/* Right: map + details */}
        <div className="mp-right">
          <div className="mp-map">
            {/* Road grid */}
            <div className="mapGrid">
              <span className="mapRoadH" style={{ top: "30%" }} />
              <span className="mapRoadH" style={{ top: "60%" }} />
              <span className="mapRoadV" style={{ left: "25%" }} />
              <span className="mapRoadV" style={{ left: "55%" }} />
              <span className="mapRoadV" style={{ left: "80%" }} />
            </div>

            {/* Markers */}
            {filtered.map((issue) => (
              <span
                key={issue.id}
                className={`${markerClass(issue)}${selectedId === issue.id ? " marker-selected" : ""}`}
                style={{ top: `${issue.y}%`, left: `${issue.x}%`, cursor: "pointer", zIndex: selectedId === issue.id ? 5 : 1 }}
                onClick={() => setSelectedId(issue.id)}
              />
            ))}

            {/* Legend */}
            <div className="mapLegend">
              <div className="legendTitle">Legend</div>
              <div className="legendRow"><span className="legendSwatch marker-circle marker-red" />High</div>
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
                <span>{TYPE_LABELS[selected.type]}</span>
                {selected.severity && <span> · Severity: {selected.severity}</span>}
                <span> · {STATUS_LABELS[selected.status]}</span>
              </p>
              <p className="mp-detailLoc">{selected.locationText}</p>
            </div>
          ) : (
            <p className="mp-detailHint">Select an issue from the list or the map to view details.</p>
          )}
        </div>
      </div>
    </section>
  );
}