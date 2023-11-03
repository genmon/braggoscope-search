import { useEffect, useState } from "react";

type Episode = {
  id: string;
  title: string;
  published: string;
  permalink: string;
  score: number;
};

export default function SearchResults(props: {
  partykitHost: string;
  party: string;
  room: string;
  query: string;
}) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const res = await fetch(
        `//${props.partykitHost}/parties/${props.party}/${props.room}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: props.query }),
        }
      );

      const { episodes } = await res.json();
      setEpisodes(episodes);
    };

    fetchResults().catch(console.error);
  }, [props.query]);

  if (!episodes.length) {
    return null;
  }

  return (
    <div className="flex flex-col justify-start items-start gap-1">
      <div className="font-semibold">Episodes</div>
      <ul className="flex flex-col justify-start items-start gap-1">
        {episodes.map((episode) => (
          <li key={episode.id}>
            <a
              className="text-blue-500 hover:text-blue-700"
              href={`https://www.braggoscope.com${episode.permalink}`}
            >
              {episode.title}
            </a>{" "}
            (score: {episode.score})
          </li>
        ))}
      </ul>
    </div>
  );
}