# braggoscope-search

A search engine for braggoscope.com, which is a static site.

![](/assets/ai-search-in-braggoscope.gif)

### What is this and how does it work?

- This is a PartyKit server that implements a vector search engine
- Indexing: it reads a JSON file of documents provided by braggoscope.com
- Querying: it accepts a query over POST and returns a list of documents

The vector database is Vectorize from Cloudflare. The embedding model is part of Cloudflare Workers AI. Both the vector db and the embedding model are accessed via PartyKit.

This server also includes:

- a basic admin UI to kick off indexing
- a basic test UI to query the search engine

### What is not included?

- The static site braggoscope.com, and the JSON file of documents to index
- The search UI itself, which is part of the website at braggoscope.com

## Try it out

- [Try the demo hosted on PartyKit](https://braggoscope-search.genmon.partykit.dev)
- [Use the search on braggoscope.com](https://www.braggoscope.com) -- tap **Search** in the top nav

## Usage

These instructions assume you have cloned the repo, installed packages, and signed into PartyKit (required for using certain features):

```bash
npm install
npx partykit login
```

**1. Create the vector database**

You only need to do this once.

Vectorize is a Cloudflare-hosted vector database. We'll use one managed by PartyKit because then it's easier to use from the PartyKit server.

Create the vector index:

```bash
npx partykit vectorize create braggoscope-index --preset @cf/baai/bge-base-en-v1.5
```

This is made available in the PartyKit server with these lines in `partykit.json`:

```jsonc
{
  // ...
  "vectorize": {
    "searchIndex": "braggoscope-index"
  },
  "ai": true
}
```

Note the `"ai": true` which also makes Cloudflare's Workers AI available in the PartyKit server.

**2. Build the index**

The vector database is empty. We need to add documents to it.

braggoscope.com is a static site for exploring episodes of BBC Radio 4's _In Our Time._ As part of the build process, it outputs a JSON file of documents to index.

Have a look at episodes.json here: [www.braggoscope.com/episodes.json](https://www.braggoscope.com/episodes.json).

This document looks like:

```jsonc
[
  {
    "id": "p0038x9h",
    "title": "The Speed of Light",
    "published": "2006-11-30",
    "permalink": "/2006/11/30/the-speed-of-light.html",
    "description": "Melvyn Bragg and guests discuss the speed of light. Scientists and thinkers ..."
  }
  // ...
]
```

We want to create a vector embedding of the description, and store it against the other properties as metadata.

We have to kick off indexing manually, so we have some minimal security around it. We'll use an admin key to protect the endpoint. Store this in `.env`:

```bash
echo "BRAGGOSCOPE_SEARCH_ADMIN_KEY=foo-admin-key\n" > .env
```

Then run the server locally and start indexing:

```bash
npm run dev
```

Then visit [127.0.0.1:1999/admin?key=foo-admin-key](http://127.0.0.1:1999/admin?key=foo-admin-key) and click _"Create Index"_.

**3. Test the search with the test UI**

After indexing, visit [127.0.0.1:1999](http://127.0.0.1:1999) to test the search.

Try the query "greek myths" and you should see a list of episodes related to the Greek myths.

**4. Test the search API**

The search feature on braggoscope.com makes a POST request to the search API. You can test this with curl:

```bash
curl \
--json '{"query": "greek myths"}' \
http://127.0.0.1:1999/parties/search/api
```

You will see a JSON object of results being returned.

**5. Deploy the server and test again.**

Deploy the server to a public URL:

```bash
npm run deploy
```

Note: do not use the usual `npx partykit deploy`! The `deploy` script we're using here also (1) ensures that the site is built first; and (2) sets the environment variables from `.env`.

Wait for the deploy to complete (you may have to wait a couple extra minutes for the domain to be provisioned) then build the index again:

Visit [https://braggoscope-search.YOUR-PARTYKIT-USERNAME.partykit.dev/admin?key=foo-admin-key](https://braggoscope-search.YOUR-PARTYKIT-USERNAME.partykit.dev/admin?key=foo-admin-key)

(Replace `YOUR-PARTYKIT-USERNAME` with your PartyKit username, and `foo-admin-key` with the admin key you set in `.env`.)

After indexing, use the test UI and the search API to test the search again.

**6. Integrate**

View source at [www.braggoscope.com](https://www.braggoscope.com) to see how the search is integrated into the site. It's a simple form that makes a POST request to the search API, and displays the results.

There is also a process to trigger re-indexing whenever that site is updated.
