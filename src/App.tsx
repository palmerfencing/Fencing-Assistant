import { createHashRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { GateCalculatorPage } from "@/pages/GateCalculator/GateCalculatorPage";
import { HomePage } from "@/pages/Home/HomePage";

const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "gate-calculator", element: <GateCalculatorPage /> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
