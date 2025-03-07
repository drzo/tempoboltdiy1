import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

// This component handles routing for Tempo storyboards
export default function TempoRoutes() {
  return (
    <Suspense fallback={<div>Loading storyboard...</div>}>
      <Routes>
        <Route path="*" element={<div>Select a storyboard to view</div>} />
      </Routes>
    </Suspense>
  );
}
