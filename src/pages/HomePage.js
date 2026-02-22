const SAMPLE_ISSUES = [
  { id: 1, type: "pothole",     severity: "high",   x: 22, y: 25 },
  { id: 2, type: "pothole",     severity: "medium", x: 52, y: 55 },
  { id: 3, type: "pothole",     severity: "low",    x: 74, y: 38 },
  { id: 4, type: "pothole",     severity: "high",   x: 35, y: 68 },
  { id: 5, type: "streetlight",                      x: 60, y: 20 },
  { id: 6, type: "streetlight",                      x: 42, y: 75 },
  { id: 7, type: "building",                         x: 80, y: 48 },
  { id: 8, type: "building",                         x: 18, y: 58 },
];

function markerClass(issue) {
  if (issue.type === "pothole") {
    const color =
      issue.severity === "high" ? "red" : issue.severity === "medium" ? "orange" : "yellow";
    return `marker marker-circle marker-${color}`;
  }
  if (issue.type === "streetlight") return "marker marker-square marker-blue";
  if (issue.type === "building")    return "marker marker-triangle marker-green";
  return "marker";
}

export default function HomePage() {
  return (
    <>
      {/* ── Hero banner ── */}
      <div
        className="hero"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/Nav_Picture.jpg)` }}
      >
        <div className="heroOverlay" />
        <div className="heroContent">
          <h1 className="heroTitle">Halifax RoadWatch</h1>
          <p className="heroSubtitle">
            Report road issues. Help your community. Stay safe on Halifax streets.
          </p>
        </div>
      </div>

      {/* ── Map preview section ── */}
      <section className="container homeSection">
        <a
          href="/map"
          target="_blank"
          rel="noopener noreferrer"
          className="mapPreview"
          aria-label="Open the full interactive map"
        >
          <div className="mapGrid">
            <span className="mapRoadH" style={{ top: "30%" }} />
            <span className="mapRoadH" style={{ top: "60%" }} />
            <span className="mapRoadV" style={{ left: "25%" }} />
            <span className="mapRoadV" style={{ left: "55%" }} />
            <span className="mapRoadV" style={{ left: "80%" }} />
          </div>

          {SAMPLE_ISSUES.map((issue) => (
            <span
              key={issue.id}
              className={markerClass(issue)}
              style={{ top: `${issue.y}%`, left: `${issue.x}%` }}
            />
          ))}

          <div className="mapLegend">
            <div className="legendTitle">Legend</div>
            <div className="legendRow"><span className="legendSwatch marker-circle marker-red" />High severity</div>
            <div className="legendRow"><span className="legendSwatch marker-circle marker-orange" />Medium severity</div>
            <div className="legendRow"><span className="legendSwatch marker-circle marker-yellow" />Low severity</div>
            <div className="legendRow"><span className="legendSwatch marker-square marker-blue" />Streetlight issue</div>
            <div className="legendRow"><span className="legendSwatch marker-triangle marker-green" />Public building</div>
          </div>

          <span className="mapLabel">Halifax Road Reports</span>
        </a>
        <p className="mapCaption">Click to open the full interactive map</p>
      </section>
    </>
  );
}