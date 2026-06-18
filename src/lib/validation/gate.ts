import { z } from "zod";

const positiveNumber = (label: string) =>
  z.coerce.number({ error: `${label} is required` }).positive(`${label} must be greater than 0`);

export const gateSchema = z
  .object({
    projectName: z.string().trim().max(80, "Project name is too long"),
    gateWidth: positiveNumber("Gate width"),
    gateHeight: positiveNumber("Gate height"),
    stileWidth: positiveNumber("Stile width"),
    railWidth: positiveNumber("Rail width"),
    topRailPosition: z.coerce.number().min(0, "Top rail position cannot be negative"),
    middleRailPosition: z.coerce.number().min(0, "Middle rail position cannot be negative"),
    bottomRailPosition: z.coerce.number().min(0, "Bottom rail position cannot be negative"),
    boardWidth: positiveNumber("Board width"),
    boardOverlap: z.coerce.number().min(0, "Overlap cannot be negative"),
    braceDirection: z.enum(["bottom-left", "bottom-right"])
  })
  .refine((data) => data.gateWidth > data.stileWidth * 2, {
    message: "Gate width must be more than twice the stile width",
    path: ["gateWidth"]
  })
  .refine((data) => data.topRailPosition + data.railWidth < data.middleRailPosition, {
    message: "Middle rail must sit below the top rail",
    path: ["middleRailPosition"]
  })
  .refine((data) => data.middleRailPosition + data.railWidth < data.bottomRailPosition, {
    message: "Bottom rail must sit below the middle rail",
    path: ["bottomRailPosition"]
  })
  .refine((data) => data.bottomRailPosition + data.railWidth <= data.gateHeight, {
    message: "Bottom rail must fit within the gate height",
    path: ["bottomRailPosition"]
  })
  .refine((data) => data.boardOverlap < data.boardWidth, {
    message: "Overlap must be less than the board width",
    path: ["boardOverlap"]
  });

export type GateFormValues = z.infer<typeof gateSchema>;
export type GateFormInput = z.input<typeof gateSchema>;
