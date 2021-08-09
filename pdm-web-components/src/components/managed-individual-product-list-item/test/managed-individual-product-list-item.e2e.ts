import { newE2EPage } from '@stencil/core/testing';

describe('managed-individual-product-list-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<managed-individual-product-list-item></managed-individual-product-list-item>');

    const element = await page.find('managed-individual-product-list-item');
    expect(element).toHaveClass('hydrated');
  });
});
