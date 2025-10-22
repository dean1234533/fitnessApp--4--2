import React from "react";
import { createRoot } from "react-dom/client";
import AppWrapper from "../components/AppWrapper";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<AppWrapper />);
