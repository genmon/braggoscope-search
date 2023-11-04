import { Component, Host, Fragment, State, Prop, h } from '@stencil/core';

type Episode = {
  id: string;
  title: string;
  published: string;
  permalink: string;
  score: number;
};

@Component({
  tag: 'braggoscope-search',
  styleUrl: 'braggoscope-search.css',
  shadow: true,
})
export class BraggoscopeSearch {
  @Prop() partykitHost: string = '127.0.0.1:1999';
  protocol: string = this.partykitHost.startsWith('localhost') || this.partykitHost.startsWith('127.0.0.1') ? 'http' : 'https';
  party: string = 'search';
  room: string = 'braggoscope';
  @State() show: boolean = false;
  @State() query: string = '';
  @State() results: Episode[] = [];
  @State() loading: boolean = false;

  private handleSubmit(event) {
    event.preventDefault();
    if (!this.query) return;
    // blur the form
    event.currentTarget.querySelector('input')?.blur();
    this.loading = true;
    this.fetchResults();
  }

  private handleQueryChange(event) {
    this.query = event.target.value;
  }

  private async fetchResults() {
    const res = await fetch(`${this.protocol}://${this.partykitHost}/parties/${this.party}/${this.room}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: this.query }),
    });

    const { episodes } = await res.json();
    this.results = episodes.splice(0, 10);
    this.loading = false;
  }

  render() {
    const formatDate = (dateString: string) => {
      // dateString is like "2021-05-27" and we want "27 May, 2021"
      // Ensure there is a comma before the year
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions;
      const formatted = date.toLocaleDateString('en-GB', options);
      // replace the final space ONLY with a comma
      return formatted.replace(/ ([^ ]*)$/, ', $1');
    };

    const formatScore = (score: number) => {
      // score is like 0.123456789 and we want 12.3%
      return `${Math.round(score * 1000) / 10}%`;
    };

    const show = () => {
      document.body.style.overflow = 'hidden';
      this.show = true;
    };

    const dismiss = () => {
      this.results = [];
      document.body.style.overflow = 'auto';
      this.show = false;
    };

    return (
      <Host>
        <button onClick={show}>
          <slot></slot>
        </button>
        {this.show && (
          <div id="overlay">
            <div class="absolute top-0 bottom-0 left-0 right-0" onClick={dismiss} />
            <div class="relative flex flex-col justify-start items-center gap-6 w-full max-w-md max-h-screen p-4">
              {this.results.length === 0 && (
                <Fragment>
                  <form onSubmit={e => this.handleSubmit(e)} class="flex flex-wrap sm:flex-no-wrap justify-stretch items-center gap-1">
                    <input
                      class="grow border border-gray-300 rounded-sm px-3 py-3 text-xl"
                      type="text"
                      placeholder="e.g. greek mythology"
                      value={this.query}
                      onChange={e => this.handleQueryChange(e)}
                    />
                    <button
                      class="relative grow-0 w-full sm:w-fit bg-white border border-blue-500 hover:bg-blue-100 px-6 py-3 text-xl text-blue-500 font-semibold rounded"
                      type="submit"
                    >
                      Search
                      {this.loading && (
                        <div class="absolute top-0 left-0 bottom-0 right-0 w-full h-full bg-blue-100 font-normal text-blue-400 flex justify-center items-center">Loading...</div>
                      )}
                    </button>
                  </form>
                  <div class="w-full justify-center">
                    <button class="mx-auto flex justify-center items-center text-white/90 gap-1" onClick={dismiss}>
                      <span>&times;</span>
                      <span class="underline">Close</span>
                    </button>
                  </div>
                </Fragment>
              )}
              {this.results.length > 0 && (
                <div class="flex flex-col justify-start items-start gap-6 w-full rounded-sm bg-white p-4 overflow-y-scroll">
                  <div>
                    <button
                      class="underline"
                      onClick={() => {
                        this.results = [];
                      }}
                    >
                      &larr; Search again
                    </button>
                  </div>
                  <div class="flex w-full justify-stretch items-center gap-2 text-2xl">
                    <div class="grow-0 font-semibold">Episodes:</div>
                    <div class="grow-1 truncate">{this.query}</div>
                  </div>
                  <ul class="flex flex-col justify-start items-start gap-2">
                    {this.results.map(episode => {
                      return (
                        <li key={episode.id} class="leading-normal">
                          <a class="text-blue-500 font-bold underline" href={`https://www.braggoscope.com${episode.permalink}`}>
                            {episode.title}
                          </a>{' '}
                          <span class="text-gray-400 text-xs">(score: {formatScore(episode.score)})</span>
                          <br />
                          <span class="text-gray-400">{formatDate(episode.published)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </Host>
    );
  }
}
