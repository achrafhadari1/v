import { listMusicFiles } from "@/lib/drive";

export default async function handler(req, res) {
  try {
    const files = await listMusicFiles();
    res.status(200).json({ files });
  } catch (e) {
    res.status(500).json({ error: "Failed to list files", details: e.message });
  }
}
