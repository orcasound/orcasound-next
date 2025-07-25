// utils/colorMaps.ts
import colormap from "colormap";

export const colormapOptions = ["viridis", "magma", "plasma", "inferno"];

export function generateColorScale(name: string, steps = 256): string[] {
  return colormap({
    colormap: name,
    nshades: steps,
    format: "rgbaString",
    alpha: 1,
  });
}
