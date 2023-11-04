import { Component, Host, State, h } from '@stencil/core';

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
  @State() show: boolean = false;
  @State() query: string = '';
  @State() results: Episode[] = [];

  partykitHost: string = '127.0.0.1:1999';
  party: string = 'search';
  room: string = 'braggoscope';

  private handleSubmit(event) {
    event.preventDefault();
    if (!this.query) return;
    // blur the form
    event.currentTarget.querySelector('input')?.blur();
    this.fetchResults();
    //window.location.href = `https://www.braggoscope.com/search?q=${this.query}`;
  }

  private handleQueryChange(event) {
    this.query = event.target.value;
  }

  private async fetchResults() {
    const res = await fetch(`//${this.partykitHost}/parties/${this.party}/${this.room}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: this.query }),
    });

    const { episodes } = await res.json();
    this.results = episodes;
  }

  render() {
    return (
      <Host>
        {!this.show && (
          <button
            onClick={() => {
              this.show = true;
            }}
          >
            <slot></slot>
          </button>
        )}
        {this.show && (
          <div id="overlay">
            <div
              class="absolute top-0 bottom-0 left-0 right-0"
              onClick={() => {
                this.show = false;
              }}
            />
            <div class="relative flex flex-col justify-start items-start gap-6 w-full max-w-md">
              {this.results.length === 0 && (
                <form onSubmit={e => this.handleSubmit(e)} class="w-full flex justify-start items-center gap-1">
                  <input class="grow border border-gray-300 rounded-sm px-2 py-2 w-full" type="text" value={this.query} onChange={e => this.handleQueryChange(e)} />
                  <button class="grow-0 bg-white border border-blue-500 hover:bg-blue-100 text-blue-500 hover:text-blue-700 font-semibold py-2 px-4 rounded-sm" type="submit">
                    Search
                  </button>
                </form>
              )}
              {this.results.length > 0 && (
                <div class="flex flex-col justify-start items-start gap-2 w-full rounded-sm bg-white p-4">
                  <div class="font-semibold">Episodes</div>
                  <ul class="flex flex-col justify-start items-start gap-2">
                    {this.results.map(episode => {
                      return (
                        <li key={episode.id}>
                          <a class="text-blue-500 hover:text-blue-700" href={`https://www.braggoscope.com${episode.permalink}`}>
                            {episode.title}
                          </a>{' '}
                          <span class="text-gray-400 text-xs">
                            {episode.published}. Score: {episode.score}
                          </span>
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
