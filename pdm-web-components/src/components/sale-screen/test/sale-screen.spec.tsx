import { newSpecPage } from '@stencil/core/testing';
import { SaleScreen } from '../sale-screen';

describe('sale-screen', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [SaleScreen],
      html: `<sale-screen></sale-screen>`,
    });
    expect(page.root).toEqualHtml(`
      <sale-screen>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </sale-screen>
    `);
  });
});
