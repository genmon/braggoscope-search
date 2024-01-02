# braggoscope-search

A search engine for braggoscope.com, which is a static site.

![](/assets/ai-search-in-braggoscope.gif)

### What is this and how does it work?

- This is a PartyKit server that implements a vector search engine
- Indexing: it reads a JSON file of documents provided by braggoscope.com
- Querying: it accepts a query over POST and returns a list of documents

The vector database is Vectorize from Cloudflare. The embedding model is suppled by Cloudflare Workers AI. Both the vector db and the embedding model are accessed via PartyKit.

This server also includes:

- a basic admin UI to kick off indexing
- a basic test UI to query the search engine

### What is not included?

- The static site braggoscope.com, and the JSON file of documents to index
- The search UI itself, which is part of the website at braggoscope.com

## Try it out

- [Try the demo hosted on PartyKit](https://braggoscope-search.genmon.partykit.dev)
- [Use the search on braggoscope.com](https://www.braggoscope.com) -- tap **Search** in the top nav

## [Developers] Usage

Create the vector index before building the index for the first time:

```
npx partykit vectorize create braggoscope-search --dimensions 768 --metric cosine
```

Before querying, you must build the index:

Visit `https://braggoscope-search.genmon.partykit.dev/admin?key=BRAGGOSCOPE_SEARCH_ADMIN_KEY`

and hit the "Index" button.

Test like:

```
curl \
--json '{"query": "greek myths"}' \
https://braggoscope-search.genmon.partykit.dev/parties/search/api
```

That's the URL to use behind the search box on braggoscope.com.
