import fetch from "node-fetch";

export async function getLastFMAlbumInfo(artist, album) {
  const API_KEY = process.env.LASTFM_API_KEY;
  const url = `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(
    artist
  )}&album=${encodeURIComponent(album)}&format=json`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.album) return null;

  // Extract year from published date string
  let year = null;
  if (data.album?.wiki.published) {
    const dateStr = data.album.wiki.published.trim(); // e.g. '03 Mar 2024, 14:01'
    // Extract last 4 digits that represent year using regex
    const match = dateStr.match(/\b(\d{4})\b/);
    if (match) year = match[1];
  }

  return {
    year,
    genres: data.album?.tags?.tag?.map((t) => t.name) || [],
    albumArtUrl: data.album?.image?.length
      ? data.album.image[data.album.image.length - 1]["#text"]
      : null,
  };
}
