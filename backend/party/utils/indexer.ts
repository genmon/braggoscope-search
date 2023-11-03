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
