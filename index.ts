import express from "express";
import Genius from "genius-lyrics";
const Client = new Genius.Client(process.env.GENIUS_TOKEN);

const app = express();

app.get("/", async (req, res) => {
  // Redirect to soundicly.com
  res.redirect("https://soundicly.com");
});

type GeniusSong = {
  title: string;
  fullTitle: string;
  featuredTitle: string;
  id: number;
  thumbnail: string;
  image: string;
  url: string;
  endpoint: string;
  artist: {
    partial: boolean;
    name: string;
    id: number;
    url: string;
    thumbnail: string;
    image: string;
    iq: number;
    verified: {
      normal: boolean;
      meme: boolean;
    };
    socialmedia: {
      facebook?: string;
      twitter?: string;
    };
  };
  album?: {
    name: string;
    title: string;
    id: number;
    image: string;
    url: string;
    endpoint: string;
    partial: boolean;
  };
  releasedAt?: Date;
  instrumental: boolean;
};

function mapSong(song: Genius.Song): GeniusSong {
  return {
    title: song.title,
    fullTitle: song.fullTitle,
    featuredTitle: song.featuredTitle,
    id: song.id,
    thumbnail: song.thumbnail,
    image: song.image,
    url: song.url,
    endpoint: song.endpoint,
    artist: {
      partial: song.artist.partial,
      name: song.artist.name,
      id: song.artist.id,
      url: song.artist.url,
      thumbnail: song.artist.thumbnail,
      image: song.artist.image,
      iq: song.artist.iq,
      verified: {
        normal: song.artist.verified.normal,
        meme: song.artist.verified.meme,
      },
      socialmedia: {
        facebook: song.artist.socialmedia?.facebook,
        twitter: song.artist.socialmedia?.twitter,
      },
    },
    album: song.album
      ? {
          name: song.album.name,
          title: song.album.title,
          id: song.album.id,
          image: song.album.image,
          url: song.album.url,
          endpoint: song.album.endpoint,
          partial: song.album.partial,
        }
      : undefined,
    releasedAt: song.releasedAt,
    instrumental: song.instrumental,
  };
}

app.get("/search", async (req, res) => {
  // Expects a query parameter called "q"
  const { q } = req.query;

  if (!q) {
    return res.send([]);
  }

  const searches = await Client.songs.search(q as string);

  const geniusSongs: GeniusSong[] = searches.map((song) => mapSong(song));

  res.json({
    results: geniusSongs,
    count: geniusSongs.length,
  });
});

app.get("/song/:songId", async (req, res) => {
  const songId = Number.parseInt(req.params.songId);
  const song = await Client.songs.get(songId);

  res.json(mapSong(song));
});

app.get("/lyrics/:songId", async (req, res) => {
  const songId = Number.parseInt(req.params.songId);
  const song = await Client.songs.get(songId);
  const lyrics = await song.lyrics();

  res.json({
    lyrics,
    lines: lyrics.split("\n"),
  });
});

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
