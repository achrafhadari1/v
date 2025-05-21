// pages/api/stream.js
import { downloadFile, getFileMetadata } from "@/lib/drive";

export default async function handler(req, res) {
  const { fileId } = req.query;

  if (!fileId)
    return res.status(400).json({ error: "Missing fileId query parameter" });

  try {
    const metadata = await getFileMetadata(fileId);
    const stream = await downloadFile(fileId);

    res.setHeader("Content-Type", metadata.mimeType || "audio/mpeg");
    res.setHeader("Content-Disposition", `inline; filename="${metadata.name}"`);
    res.setHeader("Cache-Control", "public, max-age=31536000");

    stream.pipe(res);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to stream file", details: error.message });
  }
}
