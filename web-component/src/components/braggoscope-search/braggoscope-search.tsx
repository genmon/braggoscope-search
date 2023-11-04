import { Component, Host, State, h } from '@stencil/core';

@Component({
  tag: 'braggoscope-search',
  styleUrl: 'braggoscope-search.css',
  shadow: true,
})
export class BraggoscopeSearch {
  @State() show: boolean = false;
  @State() query: string = '';

  handleSubmit(event) {
    event.preventDefault();
    // blur the form
    event.currentTarget.querySelector('input')?.blur();
    this.show = false;
    //window.location.href = `https://www.braggoscope.com/search?q=${this.query}`;
  }

  handleQueryChange(event) {
    this.query = event.target.value;
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
              <form onSubmit={e => this.handleSubmit(e)} class="w-full flex justify-start items-center gap-1">
                <input class="grow border border-gray-300 rounded-sm px-2 py-2 w-full" type="text" value={this.query} onChange={e => this.handleQueryChange(e)} />
                <button class="grow-0 bg-white border border-blue-500 hover:bg-blue-100 text-blue-500 hover:text-blue-700 font-semibold py-2 px-4 rounded-sm" type="submit">
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
