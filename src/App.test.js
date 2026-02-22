import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Halifax RoadWatch home title", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /halifax roadwatch/i })
  ).toBeInTheDocument();
});
