import { createHashRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { FenceRunDesignerPage } from "@/pages/FenceRunDesigner/FenceRunDesignerPage";
import { GateCalculatorPage } from "@/pages/GateCalculator/GateCalculatorPage";
import { HomePage } from "@/pages/Home/HomePage";

const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "gate-calculator", element: <GateCalculatorPage /> },
      { path: "fence-run-designer", element: <FenceRunDesignerPage /> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
