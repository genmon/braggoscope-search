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
}: {
  env: Record<string, any>;
  episodes: {
    id: string;
    title: string;
    published: string;
    permalink: string;
    description: string;
  }[];
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
  const result = await fetch(
    new URL(`${env.CLOUDFLARE_VECTORIZE_URL}/upsert`),
    {
      method: "POST",
      body: JSON.stringify({ vectors }),
    }
  );

  console.log(JSON.stringify(await result.json(), null, 2));
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
}) {
  const res = await fetch(new URL(params.env.CLOUDFLARE_VECTORIZE_URL), {
    method: "POST",
    body: JSON.stringify({
      query: params.query,
    }),
  });
  const { matches } = await res.json();
  return matches ?? [];
}
