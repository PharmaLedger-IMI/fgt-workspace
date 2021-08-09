import { newE2EPage } from '@stencil/core/testing';

describe('sale-screen', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<sale-screen></sale-screen>');

    const element = await page.find('sale-screen');
    expect(element).toHaveClass('hydrated');
  });
});
