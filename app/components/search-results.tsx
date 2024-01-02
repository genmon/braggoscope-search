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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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
      setLoading(false);
    };

    fetchResults().catch(console.error);
  }, [props.query]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!episodes.length) {
    return null;
  }

  return (
    <div className="flex flex-col justify-start items-start gap-1">
      <div className="font-semibold">Episodes</div>
      <ul className="flex flex-col justify-start items-start gap-2">
        {episodes.map((episode) => {
          return (
            <li key={episode.id}>
              <a
                className="text-blue-500 hover:text-blue-700"
                href={`https://www.braggoscope.com${episode.permalink}`}
              >
                {episode.title}
              </a>{" "}
              <span className="text-gray-400 text-xs">
                {episode.published}. Score: {episode.score}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
