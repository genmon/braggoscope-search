import PartySocket from "partysocket";

import { suspend } from "suspend-react";

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
  const episodes = suspend(async () => {
    const res = await PartySocket.fetch(
      {
        host: props.partykitHost,
        party: props.party,
        room: props.room,
      },
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: props.query }),
      }
    );

    const { episodes } = await res.json();
    return episodes as Episode[];
  }, [props.query]);

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
