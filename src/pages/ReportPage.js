import { useState } from "react";

const TYPE_OPTIONS = [
  { value: "", label: "— Select —" },
  { value: "pothole", label: "Pothole / Road damage" },
  { value: "streetlight", label: "Streetlight problem" },
  { value: "building", label: "Public building maintenance" },
];

const SEV_OPTIONS = [
  { value: "", label: "— Select —" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function initialForm() {
  return { type: "", severity: "", location: "", description: "", photo: null };
}

/* ────────────────────────────────────────────
   Quick Pothole Report (self-contained card)
   ──────────────────────────────────────────── */
function QuickPotholeCard() {
  const [step, setStep]         = useState("idle");   // idle | loading | form | denied | done
  const [lat, setLat]           = useState(null);
  const [lng, setLng]           = useState(null);
  const [severity, setSeverity] = useState("");
  const [note, setNote]         = useState("");
  const [fallback, setFallback] = useState("");        // manual street input

  function requestPos() {
    if (!navigator.geolocation) { setStep("denied"); return; }
    setStep("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setStep("form"); },
      ()    => { setStep("denied"); }
    );
  }

  function handleSubmit() {
    setStep("done");
  }

  function reset() {
    setStep("idle"); setLat(null); setLng(null);
    setSeverity(""); setNote(""); setFallback("");
  }

  const canSubmit = severity && (lat != null || fallback.trim());

  return (
    <div className="qp-card">
      <h2 className="qp-heading">Quick Pothole Report <span className="rp-tabHint">~10 s</span></h2>
      <p className="qp-safety">Do not submit while driving. Pull over safely.</p>

      {step === "idle" && (
        <button className="rp-btn rp-btnSubmit qp-startBtn" onClick={requestPos}>
          Use my location &amp; report a pothole
        </button>
      )}

      {step === "loading" && <p className="qp-msg">Requesting location…</p>}

      {step === "denied" && (
        <>
          <p className="rp-locMsg rp-locErr">
            Location access was denied or is unavailable. Enter the nearest street or intersection instead.
          </p>
          <label className="rp-label">
            Nearest street / intersection <span className="rp-req">*</span>
            <input
              className="rp-input"
              type="text"
              placeholder="e.g. Barrington St & Sackville St"
              value={fallback}
              onChange={(e) => setFallback(e.target.value)}
            />
          </label>
          {/* Show rest of quick form */}
          <label className="rp-label">
            Severity <span className="rp-req">*</span>
            <select className="rp-input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              {SEV_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="rp-label">
            Note <span className="rp-opt">(optional, max 80 chars)</span>
            <input className="rp-input" type="text" maxLength={80} placeholder="Brief note…" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <button className="rp-btn rp-btnSubmit" disabled={!canSubmit} onClick={handleSubmit}>Submit quick report</button>
        </>
      )}

      {step === "form" && (
        <>
          <p className="qp-coords">Location captured: <strong>{lat.toFixed(5)}, {lng.toFixed(5)}</strong></p>
          <label className="rp-label">
            Severity <span className="rp-req">*</span>
            <select className="rp-input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              {SEV_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="rp-label">
            Note <span className="rp-opt">(optional, max 80 chars)</span>
            <input className="rp-input" type="text" maxLength={80} placeholder="Brief note…" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <button className="rp-btn rp-btnSubmit" disabled={!severity} onClick={handleSubmit}>Submit quick report</button>
        </>
      )}

      {step === "done" && (
        <div className="rp-success">
          <h2>Quick pothole report saved (mock)</h2>
          <p>
            <strong>Severity:</strong> {severity}
            <br />
            <strong>Location:</strong> {lat != null ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : fallback}
            {note && <><br /><strong>Note:</strong> {note}</>}
          </p>
          <button className="rp-btn" onClick={reset}>Report another pothole</button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Mobile Companion promo card + modal
   ──────────────────────────────────────────── */
function MobileCompanionPromo() {
  const [open, setOpen] = useState(false);
  const [showPwa, setShowPwa] = useState(false);

  return (
    <>
      {/* Sticky side card */}
      <aside className="mc-card">
        <h3 className="mc-title">Quick Report on Mobile</h3>
        <p className="mc-desc">One-tap quick reporting via the mobile companion.</p>
        <p className="mc-safety">For safety, pull over before reporting.</p>
        <button className="rp-btn rp-btnSubmit mc-btn" onClick={() => setOpen(true)}>
          Get the Mobile Companion
        </button>
      </aside>

      {/* Modal backdrop + dialog */}
      {open && (
        <div className="mc-overlay" onClick={() => { setOpen(false); setShowPwa(false); }}>
          <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="mc-modalTitle">Mobile Companion</h2>

            <div className="mc-option">
              <strong>Android</strong>
              <p>Overlay quick-report button — <em>coming soon.</em></p>
            </div>

            <div className="mc-option">
              <strong>iOS</strong>
              <p>Widget / Shortcut integration — <em>coming soon.</em></p>
            </div>

            <div className="mc-option">
              <strong>Web (available now)</strong>
              <p>Add Halifax RoadWatch to your Home Screen for faster access.</p>
            </div>

            {showPwa && (
              <div className="mc-pwaHelp">
                <h4>How to Add to Home Screen</h4>
                <ul>
                  <li><strong>Chrome (Android):</strong> Tap the three-dot menu &rarr; "Add to Home screen".</li>
                  <li><strong>Safari (iOS):</strong> Tap the Share button &rarr; "Add to Home Screen".</li>
                  <li><strong>Chrome / Edge (Desktop):</strong> Click the install icon in the address bar.</li>
                </ul>
              </div>
            )}

            <div className="mc-actions">
              <button className="rp-btn rp-btnSubmit" onClick={() => setShowPwa(!showPwa)}>
                {showPwa ? "Hide instructions" : "Add to Home Screen (how)"}
              </button>
              <button className="rp-btn" onClick={() => { setOpen(false); setShowPwa(false); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────
   Main Report Page
   ──────────────────────────────────────────── */
export default function ReportPage() {
  const [form, setForm] = useState(initialForm());
  const [locStatus, setLocStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetAll() {
    setForm(initialForm());
    setLocStatus("");
    setSubmitted(false);
  }

  /* ── Geolocation helper ── */
  function requestLocation() {
    if (!navigator.geolocation) { setLocStatus("denied"); return; }
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        set("location", coords);
        setLocStatus("done");
      },
      () => { setLocStatus("denied"); }
    );
  }

  function handleFullSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  const needsSeverity = form.type === "pothole";

  if (submitted) {
    return (
      <section className="rp-page">
        <div className="rp-success">
          <h2>Report submitted (mock)</h2>
          <p>Thank you. Your issue has been recorded. A reference number would be assigned here in the real system.</p>
          <button className="rp-btn" onClick={resetAll}>Submit another report</button>
        </div>
      </section>
    );
  }

  return (
    <section className="rp-page">
      <div className="rp-main">
        <h1 className="pageTitle">Report an issue</h1>

        {/* ── Quick Pothole card ── */}
        <QuickPotholeCard />

      {/* ── Full Report ── */}
      <h2 className="rp-sectionTitle">Full Report</h2>

      <div className="rp-notice">
        Do not submit reports while driving. Please pull over safely.
      </div>

      <form className="rp-form" onSubmit={handleFullSubmit}>
        <label className="rp-label">
          Issue type <span className="rp-req">*</span>
          <select className="rp-input" required value={form.type} onChange={(e) => set("type", e.target.value)}>
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        {needsSeverity && (
          <label className="rp-label">
            Severity <span className="rp-req">*</span>
            <select className="rp-input" required value={form.severity} onChange={(e) => set("severity", e.target.value)}>
              {SEV_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        )}

        <label className="rp-label">
          Location <span className="rp-req">*</span>
          <input className="rp-input" type="text" required placeholder="Street name or intersection" value={form.location} onChange={(e) => set("location", e.target.value)} />
        </label>
        <button type="button" className="rp-locBtn" onClick={requestLocation}>
          {locStatus === "loading" ? "Locating…" : "Use my current location"}
        </button>
        {locStatus === "done" && <p className="rp-locMsg rp-locOk">Location captured.</p>}
        {locStatus === "denied" && (
          <p className="rp-locMsg rp-locErr">Unable to access your location. Please type the address instead.</p>
        )}

        <label className="rp-label">
          Description <span className="rp-opt">(optional)</span>
          <textarea className="rp-input rp-textarea" rows={4} placeholder="Describe the issue…" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </label>

        <label className="rp-label">
          Photo <span className="rp-opt">(optional)</span>
          <input className="rp-fileInput" type="file" accept="image/*" onChange={(e) => set("photo", e.target.files[0] || null)} />
        </label>

        <button type="submit" className="rp-btn rp-btnSubmit">Submit report</button>
      </form>
      </div>

      {/* ── Mobile Companion promo (right sidebar) ── */}
      <MobileCompanionPromo />
    </section>
  );
}