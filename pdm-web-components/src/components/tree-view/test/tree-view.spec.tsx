import { newSpecPage } from '@stencil/core/testing';
import { TreeView } from '../tree-view';

describe('tree-view', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [TreeView],
      html: `<tree-view></tree-view>`,
    });
    expect(page.root).toEqualHtml(`
      <tree-view>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </tree-view>
    `);
  });
});
