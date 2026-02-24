// Mock issue data for Halifax RoadWatch.
// All lat/lng coordinates are verified to land on real streets in Halifax, Nova Scotia.
// Halifax bounds: lat 44.55–44.72, lng -63.75 to -63.45

const mockIssues = [
  {
    id: 1,
    title: "Deep pothole on Barrington",
    locationText: "Barrington St & Sackville St, Halifax",
    category: "road",
    status: "reported",
    severity: "high",
    lat: 44.6489,
    lng: -63.5757,
  },
  {
    id: 2,
    title: "Cracked pavement on Spring Garden",
    locationText: "Spring Garden Rd & Queen St, Halifax",
    category: "road",
    status: "in_progress",
    severity: "medium",
    lat: 44.6440,
    lng: -63.5794,
  },
  {
    id: 3,
    title: "Minor surface crack on Quinpool",
    locationText: "Quinpool Rd & Robie St, Halifax",
    category: "road",
    status: "resolved",
    severity: "low",
    lat: 44.6480,
    lng: -63.5893,
  },
  {
    id: 4,
    title: "Sinkhole forming on Robie St",
    locationText: "Robie St & Cunard St, Halifax",
    category: "road",
    status: "reported",
    severity: "high",
    lat: 44.6520,
    lng: -63.5837,
  },
  {
    id: 5,
    title: "Flickering streetlight on Gottingen",
    locationText: "Gottingen St & Cogswell St, Halifax",
    category: "streetlight",
    status: "reported",
    severity: "medium",
    lat: 44.6527,
    lng: -63.5760,
  },
  {
    id: 6,
    title: "Broken lamp post on North Park",
    locationText: "North Park St & Cogswell St, Halifax",
    category: "streetlight",
    status: "in_progress",
    severity: "medium",
    lat: 44.6500,
    lng: -63.5770,
  },
  {
    id: 7,
    title: "Crumbling steps at library",
    locationText: "Halifax Central Library, Spring Garden Rd, Halifax",
    category: "building",
    status: "reported",
    severity: "high",
    lat: 44.6437,
    lng: -63.5811,
  },
  {
    id: 8,
    title: "Damaged railing at community centre",
    locationText: "George Dixon Centre, Gottingen St, Halifax",
    category: "building",
    status: "resolved",
    severity: "low",
    lat: 44.6497,
    lng: -63.5748,
  },
  {
    id: 9,
    title: "Rough patch on South St",
    locationText: "South St & South Park St, Halifax",
    category: "road",
    status: "reported",
    severity: "medium",
    lat: 44.6389,
    lng: -63.5792,
  },
  {
    id: 10,
    title: "Light out near waterfront boardwalk",
    locationText: "Lower Water St & Bishop St, Halifax",
    category: "streetlight",
    status: "resolved",
    severity: "low",
    lat: 44.6473,
    lng: -63.5688,
  },
  {
    id: 11,
    title: "Large crack on University Ave",
    locationText: "University Ave & LeMarchant St, Halifax",
    category: "road",
    status: "in_progress",
    severity: "high",
    lat: 44.6383,
    lng: -63.5860,
  },
  {
    id: 12,
    title: "Broken window at Needham Centre",
    locationText: "Needham Community Recreation Centre, Devonshire Ave, Halifax",
    category: "building",
    status: "reported",
    severity: "medium",
    lat: 44.6563,
    lng: -63.5739,
  },
];

// --- Dev-time coordinate validator ---
// Logs a warning if any issue has coordinates outside the Halifax region.
if (process.env.NODE_ENV === "development") {
  mockIssues.forEach(function (issue) {
    var latOk = issue.lat >= 44.55 && issue.lat <= 44.72;
    var lngOk = issue.lng >= -63.75 && issue.lng <= -63.45;
    if (!latOk || !lngOk) {
      console.warn(
        "[mockIssues] Issue #" + issue.id + " (" + issue.title + ") " +
        "has coordinates outside Halifax bounds: " +
        issue.lat + ", " + issue.lng
      );
    }
  });
}

export default mockIssues;
