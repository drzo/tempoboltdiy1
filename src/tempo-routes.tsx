import { RouteObject } from "react-router-dom";

// This file is used by Tempo to add routes for storyboards
// These routes are only included if the VITE_TEMPO environment variable is set to true
const routes: RouteObject[] = [
  {
    path: "/tempobook/*",
    lazy: async () => {
      // Dynamically import the storyboard routes
      const module = await import("./tempobook/routes");
      return { Component: module.default };
    },
  },
];

export default routes;
