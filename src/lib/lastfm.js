import fetch from "node-fetch";

export async function getLastFMAlbumInfo(artist, album) {
  const API_KEY = process.env.LASTFM_API_KEY;
  const url = `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(
    artist
  )}&album=${encodeURIComponent(album)}&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.album) return null;

    // Extract year from published date string safely
    let year = null;
    const published = data.album?.wiki?.published;
    if (published && typeof published === "string") {
      const match = published.trim().match(/\b(\d{4})\b/);
      if (match) year = match[1];
    }

    return {
      year,
      genres: data.album?.tags?.tag?.map((t) => t.name) || [],
      albumArtUrl:
        data.album?.image?.length > 0
          ? data.album.image[data.album.image.length - 1]["#text"]
          : null,
    };
  } catch (err) {
    console.error("LastFM fetch failed:", err);
    return null;
  }
}
