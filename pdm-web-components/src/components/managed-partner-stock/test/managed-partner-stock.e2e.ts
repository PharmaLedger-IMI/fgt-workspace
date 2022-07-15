import { newE2EPage } from '@stencil/core/testing';

describe('managed-partner-stock', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<managed-partner-stock></managed-partner-stock>');

    const element = await page.find('managed-partner-stock');
    expect(element).toHaveClass('hydrated');
  });
});
