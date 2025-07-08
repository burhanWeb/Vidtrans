import path from "path";
import { rename } from "fs/promises";

const cleanFileName = async (filePath) => {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  const cleanedBase = base
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, "") // Remove non-alphanumerics
    .replace(/_+/g, "_") // Collapse multiple underscores
    .replace(/(\d{3,4}p)+/gi, "") // Remove resolution markers
    .replace(/_?h26[45]_?/gi, "") // Remove h264/h265 with surrounding underscores
    .replace(/^_+|_+$/g, "") // Trim leading/trailing underscores
    .toLowerCase();

  const cleanedPath = path.join(dir, `${cleanedBase}${ext}`);

  if (cleanedPath !== filePath) {
    await rename(filePath, cleanedPath);
    console.log(` File renamed to: ${cleanedPath}`);
  }

  return cleanedPath;
};

export default cleanFileName;
