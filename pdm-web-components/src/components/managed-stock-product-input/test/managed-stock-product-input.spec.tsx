import { newSpecPage } from '@stencil/core/testing';
import { ManagedStockProductInput } from '../managed-product-input';

describe('managed-product-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ManagedStockProductInput],
      html: `<managed-product-input></managed-product-input>`,
    });
    expect(page.root).toEqualHtml(`
      <managed-product-input>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </managed-product-input>
    `);
  });
});
