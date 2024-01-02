# braggoscope-search

Create the vector index:

```
npx partykit vectorize create braggoscope-search --dimensions 768 --metric cosine
```

Build the index:

Visit `https://braggoscope-search.genmon.partykit.dev/admin?key=BRAGGOSCOPE_SEARCH_ADMIN_KEY`

and hit the "Index" button.

Test like:

```
curl \
--verbose \
--json '{"query": "greek myths"}' \
https://braggoscope-search.genmon.partykit.dev/parties/search/braggoscope
```

And to test CORS headers:

```
curl \
--verbose \
-X OPTIONS \
https://braggoscope-search.genmon.partykit.dev/parties/search/braggoscope
```
