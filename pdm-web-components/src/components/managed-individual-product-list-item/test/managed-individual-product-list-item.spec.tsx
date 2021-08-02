import { newSpecPage } from '@stencil/core/testing';
import { ManagedIndividualProductListItem } from '../managed-individual-product-list-item';

describe('managed-individual-product-list-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ManagedIndividualProductListItem],
      html: `<managed-individual-product-list-item></managed-individual-product-list-item>`,
    });
    expect(page.root).toEqualHtml(`
      <managed-individual-product-list-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </managed-individual-product-list-item>
    `);
  });
});
