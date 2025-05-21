import { NextResponse } from "next/server";

// --- Main GET handler ---
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Artist name is required" },
      { status: 400 }
    );
  }

  try {
    // Get artist info from Last.fm
    const lastfm = await getLastFMArtistInfo(name);

    // Get cover image from MusicBrainz + Cover Art Archive
    const musicbrainz = await searchArtist(name);
    let coverUrl = null;

    if (musicbrainz) {
      const releases = await getReleases(musicbrainz.id);
      for (const release of releases) {
        coverUrl = await getCoverArt(release.id);
        if (coverUrl) break;
      }
    }

    return NextResponse.json({
      name: lastfm.name || name,
      bio: lastfm.bio,
      image: coverUrl,
      listeners: lastfm.listeners,
      playcount: lastfm.playcount,
      tags: lastfm.tags,
    });
  } catch (error) {
    console.error("Failed to fetch artist info:", error);
    return NextResponse.json(
      { error: "Failed to fetch artist info" },
      { status: 500 }
    );
  }
}
async function getLastFMArtistInfo(name) {
  const API_KEY = process.env.LASTFM_API_KEY;
  const url = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(
    name
  )}&api_key=${API_KEY}&format=json`;

  const response = await fetch(url);
  const data = await response.json();
  if (!data.artist) throw new Error("Artist not found on Last.fm");

  return {
    name: data.artist.name,
    bio: data.artist.bio?.summary?.replace(/<a.*?>/g, "").replace(/<\/a>/g, ""),
    listeners: parseInt(data.artist.stats?.listeners || 0),
    playcount: parseInt(data.artist.stats?.playcount || 0),
    tags: data.artist.tags?.tag?.map((t) => t.name) || [],
  };
}
async function searchArtist(artistName) {
  const url = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(
    artistName
  )}&fmt=json`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "YourAppName/1.0.0 (your@email.com)",
    },
  });
  const data = await res.json();
  return data.artists?.[0] || null;
}

async function getReleases(artistId) {
  const url = `https://musicbrainz.org/ws/2/release?artist=${artistId}&fmt=json&limit=5`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "YourAppName/1.0.0 (your@email.com)",
    },
  });
  const data = await res.json();
  return data.releases || [];
}

async function getCoverArt(releaseId) {
  const url = `https://coverartarchive.org/release/${releaseId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.images?.find((img) => img.front)?.image || null;
  } catch {
    return null;
  }
}
