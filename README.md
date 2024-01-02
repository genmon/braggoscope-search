# braggoscope-search

A search box for braggoscope.com, which is a static site.

## Status

- The PartyKit backend runs:
  - a test UI
  - an admin UI (to kick off the indexer)
  - a vector database
  - an embedding model
  - the ability to query the index over POST
- The backend can build the index and query it
- The frontend is built as a web component using Stencil
- The component is shipped and usable on braggoscope.com.

![](/assets/ai-search-in-braggoscope.gif)

## Try it out

- [Try the standalone search hosted on PartyKit](https://braggoscope-search.genmon.partykit.dev)
- [Use the search on braggoscope.com](https://www.braggoscope.com) -- tap **Search** in the top nav
