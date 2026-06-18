import { jsPDF } from "jspdf";
import type { FenceRunInputs, FenceRunResults } from "@/types/fenceRun";

async function previewDataUrl() {
  const svg = document.getElementById("fence-run-preview");
  if (!(svg instanceof SVGElement)) {
    throw new Error("Fence preview is not available.");
  }

  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", "1200");
  clone.setAttribute("height", "520");
  const source = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();
    image.src = url;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not render the fence preview."));
    });
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 1040;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available.");
    context.fillStyle = "#f8f4ec";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function safeFileName(name: string) {
  return name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "fence-run";
}

export async function exportFenceRunPng(inputs: FenceRunInputs) {
  const dataUrl = await previewDataUrl();
  const link = document.createElement("a");
  link.download = `${safeFileName(inputs.projectName)}-layout.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportFenceRunPdf(inputs: FenceRunInputs, results: FenceRunResults) {
  const preview = await previewDataUrl();
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFillColor(20, 47, 35);
  pdf.rect(0, 0, pageWidth, 27, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(inputs.projectName || "Fence Run Design", 14, 12);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`Fence Run Designer | ${new Date().toLocaleDateString("en-GB")}`, 14, 20);

  pdf.addImage(preview, "PNG", 14, 34, 190, 82);
  pdf.setTextColor(20, 39, 29);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Layout summary", 216, 40);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const summary = [
    `Total run: ${Math.round(inputs.totalRunLength)} mm`,
    `Fence height: ${Math.round(inputs.fenceHeight)} mm`,
    `Bays: ${results.totalBays}`,
    `Posts: ${results.totalPosts}`,
    inputs.fenceStyle === "featheredge"
      ? `4.8 m rail/GB joints: ${results.stockJointPositions.length}`
      : `Average bay: ${Math.round(results.averageBayWidth)} mm`,
    `Style: ${inputs.fenceStyle}`,
    `Ground: ${inputs.groundMode}`,
    inputs.gateOpening.enabled ? `Gate opening: ${Math.round(inputs.gateOpening.width)} mm` : "Gate opening: none"
  ];
  summary.forEach((line, index) => pdf.text(line, 216, 49 + index * 6));

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Bay schedule", 14, 127);
  pdf.setFontSize(8);
  pdf.setTextColor(90, 90, 90);
  pdf.text("Bay", 14, 134);
  pdf.text("Clear width", 32, 134);
  pdf.text("Source", 62, 134);
  pdf.text("Level / fall", 88, 134);
  pdf.setTextColor(20, 39, 29);
  pdf.setFont("helvetica", "normal");
  results.bays.slice(0, 9).forEach((bay, index) => {
    const lineY = 141 + index * 5.5;
    pdf.text(String(bay.index + 1), 14, lineY);
    pdf.text(`${Math.round(bay.width)} mm`, 32, lineY);
    pdf.text(bay.source, 62, lineY);
    pdf.text(`${Math.round(bay.levelAtStart)} mm`, 88, lineY);
  });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Post centres from start", 125, 127);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  const centreLines = results.posts.map((post) => `P${post.index + 1}  ${Math.round(post.centre)} mm`);
  centreLines.slice(0, 27).forEach((line, index) => {
    const column = Math.floor(index / 9);
    const row = index % 9;
    pdf.text(line, 125 + column * 35, 141 + row * 5.5);
  });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Checks and notes", 230, 127);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  const notes = [
    ...(results.warnings.length ? results.warnings : ["No bay-width warnings."]),
    ...(inputs.notes ? [inputs.notes] : [])
  ];
  const wrapped = pdf.splitTextToSize(notes.join("\n"), 52);
  pdf.text(wrapped.slice(0, 11), 230, 137);
  pdf.setTextColor(115, 115, 115);
  pdf.text("Planning drawing only. Verify dimensions and site conditions before installation.", 14, 202);
  pdf.save(`${safeFileName(inputs.projectName)}-fence-run.pdf`);
}
