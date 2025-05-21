import { NextResponse } from "next/server";

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
    const API_KEY = process.env.LASTFM_API_KEY;
    const url = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(
      name
    )}&api_key=${API_KEY}&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: data.artist.name,
      bio: data.artist.bio?.summary
        ?.replace(/<a.*?>/g, "")
        .replace(/<\/a>/g, ""),
      image: data.artist.image?.[data.artist.image.length - 1]["#text"],
      listeners: parseInt(data.artist.stats?.listeners || 0),
      playcount: parseInt(data.artist.stats?.playcount || 0),
      tags: data.artist.tags?.tag?.map((t) => t.name) || [],
    });
  } catch (error) {
    console.error("Failed to fetch artist info:", error);
    return NextResponse.json(
      { error: "Failed to fetch artist info" },
      { status: 500 }
    );
  }
}
