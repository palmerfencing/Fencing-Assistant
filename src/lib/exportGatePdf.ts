import jsPDF from "jspdf";
import type Konva from "konva";
import type { GateInputs, GateResults } from "@/types/gate";

export function exportGatePdf(inputs: GateInputs, results: GateResults, stage: Konva.Stage | null) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const dark = "#142f23";

  pdf.setFillColor(dark);
  pdf.rect(0, 0, 210, 34, "F");
  pdf.setTextColor("#ffffff");
  pdf.setFontSize(20);
  pdf.text("Fencing Site Assistant", 16, 15);
  pdf.setFontSize(10);
  pdf.text(inputs.projectName || "Gate project", 16, 24);
  pdf.text(new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date()), 194, 24, { align: "right" });

  if (stage) {
    const image = stage.toDataURL({ pixelRatio: 2 });
    pdf.addImage(image, "PNG", 16, 42, 178, 124);
  }

  pdf.setTextColor(dark);
  pdf.setFontSize(15);
  pdf.text("Cut list", 16, 179);
  pdf.setFontSize(10);
  const rows = [
    `2 x Stiles @ ${results.stileLength.toFixed(0)} mm`,
    `3 x Rails @ ${results.railLength.toFixed(0)} mm`,
    `1 x Top-middle brace @ ${results.braces[0].length.toFixed(0)} mm`,
    `1 x Middle-bottom brace @ ${results.braces[1].length.toFixed(0)} mm`,
    `Brace angles: ${results.braces[0].angle.toFixed(1)} / ${results.braces[1].angle.toFixed(1)} degrees`,
    `Frame timber: ${(results.frameTimberLength / 1000).toFixed(2)} m`,
    `4.8 m stock lengths required: ${results.stockCount}`,
    `Optimised stock waste: ${(results.stockWaste / 1000).toFixed(2)} m`,
    `Boards: ${results.boardCount}`,
    `Board overlap: ${results.actualOverlap.toFixed(1)} mm`,
    `Total timber: ${(results.totalTimberLength / 1000).toFixed(2)} m`
  ];
  rows.forEach((row, index) => pdf.text(row, 20, 191 + index * 6));
  pdf.setDrawColor("#d6d3d1");
  pdf.line(16, 258, 194, 258);
  pdf.setTextColor("#78716c");
  pdf.setFontSize(8);
  pdf.text("Check all measurements and site tolerances before cutting.", 16, 266);
  pdf.save(`${inputs.projectName || "gate-project"}.pdf`);
}
