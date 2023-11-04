import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'braggoscope-search',
  styleUrl: 'braggoscope-search.css',
  shadow: true,
})
export class BraggoscopeSearch {
  render() {
    return (
      <Host>
        <div>Hello, World!</div>
        <slot></slot>
      </Host>
    );
  }
}
