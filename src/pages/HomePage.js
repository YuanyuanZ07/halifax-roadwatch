import { useNavigate } from "react-router-dom";
import mockIssues from "../data/mockIssues";
import IssueMap from "../components/IssueMap";

// Show only the first 8 issues on the home preview
var previewIssues = mockIssues.slice(0, 8);

export default function HomePage() {
  var navigate = useNavigate();

  // When a marker is clicked on the home preview, go to the full map page
  function handleMarkerClick() {
    navigate("/map");
  }

  return (
    <>
      {/* ── Hero banner ── */}
      <div
        className="hero"
        style={{ backgroundImage: "url(" + process.env.PUBLIC_URL + "/Nav_Picture.jpg)" }}
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
        <div
          className="mapPreview"
          onClick={function () { navigate("/map"); }}
          role="button"
          tabIndex={0}
          aria-label="Open the full interactive map"
          onKeyDown={function (e) {
            if (e.key === "Enter") navigate("/map");
          }}
        >
          <IssueMap
            issues={previewIssues}
            height="380px"
            interactive={false}
            onSelectIssue={handleMarkerClick}
          />
        </div>
        <p className="mapCaption">Click to open the full interactive map</p>
      </section>
    </>
  );
}