import { newSpecPage } from '@stencil/core/testing';
import { ManagedPartnerStock } from '../managed-partner-stock';

describe('managed-partner-stock', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ManagedPartnerStock],
      html: `<managed-partner-stock></managed-partner-stock>`,
    });
    expect(page.root).toEqualHtml(`
      <managed-partner-stock>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </managed-partner-stock>
    `);
  });
});
