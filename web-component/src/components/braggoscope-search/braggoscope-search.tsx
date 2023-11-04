import { Component, Host, State, h } from '@stencil/core';

@Component({
  tag: 'braggoscope-search',
  styleUrl: 'braggoscope-search.css',
  shadow: true,
})
export class BraggoscopeSearch {
  @State() show: boolean = false;

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
            <div class="relative flex flex-col bg-white justify-start items-start gap-6 w-full max-w-md p-6">Search</div>
          </div>
        )}
      </Host>
    );
  }
}
