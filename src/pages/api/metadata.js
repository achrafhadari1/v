import { downloadFile, getFileMetadata } from "@/lib/drive";
import { parseStream } from "music-metadata";
import { getLastFMAlbumInfo } from "@/lib/lastfm";

export default async function handler(req, res) {
  const { fileId } = req.query;
  if (!fileId) return res.status(400).json({ error: "Missing fileId" });

  try {
    const [stream, fileMetadata] = await Promise.all([
      downloadFile(fileId),
      getFileMetadata(fileId),
    ]);

    const metadata = await parseStream(stream, {
      mimeType: fileMetadata.mimeType,
      fileSize: parseInt(fileMetadata.size, 10), // ensure it's a number
      observer: (update) => {
        // Optional: useful for debugging
        // console.log(update);
      },
      duration: true, // forces full parsing
    });

    const common = metadata.common;

    let lastFmInfo = {};
    if (common.artist && common.album) {
      lastFmInfo =
        (await getLastFMAlbumInfo(common.artist, common.album)) || {};
    }

    res.status(200).json({
      title: common.title || null,
      artist: common.artist || null,
      album: common.album || null,
      year: common.year || lastFmInfo.year || null,
      genre: common.genre?.length
        ? common.genre
        : lastFmInfo.genres?.length
        ? lastFmInfo.genres
        : null,
      duration: metadata.format.duration || null,
      bitrate: metadata.format.bitrate || null,
      albumArtUrl: lastFmInfo.albumArtUrl || null,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to extract metadata",
      details: error.message,
    });
  }
}
