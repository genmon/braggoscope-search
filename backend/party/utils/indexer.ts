async function buildIndex(params: { env: Record<string, any> }) {
  const episodes = await getEpisodes();

  for (const episode of episodes) {
    //const { id, title, published, permalink, description } = episode;
    await upsertEmbedding({ ...episode, env: params.env });
  }
}

export async function getEpisodes() {
  return await fetch("https://www.braggoscope.com/episodes.json").then((res) =>
    res.json()
  );
}

export async function batchUpsert({
  env,
  episodes,
  searchIndex,
}: {
  env: Record<string, any>;
  episodes: {
    id: string;
    title: string;
    published: string;
    permalink: string;
    description: string;
  }[];
  searchIndex: any;
}) {
  if (episodes.length > 100) {
    throw new Error("Too many episodes");
  }

  // Get embeddings
  const { embeddings } = await fetch(
    new URL(`${env.CLOUDFLARE_VECTORIZE_URL}/embeddings`),
    {
      method: "POST",
      body: JSON.stringify({
        text: episodes.map((episode) => episode.description),
      }),
    }
  ).then((res) => res.json());

  // Create vector objects
  const vectors = episodes.map((episode, i) => ({
    id: episode.id,
    values: embeddings[i],
    metadata: {
      title: episode.title,
      published: episode.published,
      permalink: episode.permalink,
    },
  }));

  // Upsert
  /*
  const result = await fetch(
    new URL(`${env.CLOUDFLARE_VECTORIZE_URL}/upsert`),
    {
      method: "POST",
      body: JSON.stringify({ vectors }),
    }
  );
  */
  console.log("upserting", vectors);
  const result = searchIndex.upsert(vectors);

  console.log(JSON.stringify(result, null, 2));
}

export async function upsertEmbedding(params: {
  env: Record<string, any>;
  id: string;
  title: string;
  published: string;
  permalink: string;
  description: string;
}) {
  await fetch(new URL(params.env.CLOUDFLARE_VECTORIZE_URL), {
    method: "PUT",
    body: JSON.stringify({
      id: params.id,
      title: params.title,
      published: params.published,
      permalink: params.permalink,
      description: params.description,
    }),
  });
}

export async function searchEmbeddings(params: {
  env: Record<string, any>;
  query: string;
  searchIndex: any;
}) {
  const res = await fetch(new URL(params.env.CLOUDFLARE_VECTORIZE_URL), {
    method: "POST",
    body: JSON.stringify({
      query: params.query,
    }),
  });
  const { matches } = await res.json();
  console.log("matches", matches);
  return matches ?? [];
}

export async function search(params: {
  env: Record<string, any>;
  query: string;
  searchIndex: any;
}) {
  const { env, query, searchIndex } = params;

  // Get the vector for the query
  const { embeddings } = await fetch(
    new URL(`${env.CLOUDFLARE_VECTORIZE_URL}/embeddings`),
    {
      method: "POST",
      body: JSON.stringify({
        text: [query],
      }),
    }
  ).then((res) => res.json());

  const queryVector = embeddings[0];

  // Search the index for the query vector
  const nearest = await searchIndex.query(queryVector, {
    topK: 15,
    returnValues: false,
    returnMetadata: true,
  });

  const found: {
    id: string;
    title: string;
    published: string;
    permalink: string;
    score: number;
  }[] = [];

  for (const match of nearest.matches) {
    found.push({
      id: match.vector.id,
      ...match.vector.metadata,
      score: match.score,
    });
  }

  // Return maximum 15 results
  return found.slice(0, 15);
}
