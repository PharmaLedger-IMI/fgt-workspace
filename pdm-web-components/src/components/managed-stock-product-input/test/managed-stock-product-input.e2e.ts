import { newE2EPage } from '@stencil/core/testing';

describe('managed-product-input', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<managed-product-input></managed-product-input>');

    const element = await page.find('managed-product-input');
    expect(element).toHaveClass('hydrated');
  });
});
