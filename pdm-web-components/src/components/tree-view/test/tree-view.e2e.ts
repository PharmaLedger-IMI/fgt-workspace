import { newE2EPage } from '@stencil/core/testing';

describe('tree-view', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<tree-view></tree-view>');

    const element = await page.find('tree-view');
    expect(element).toHaveClass('hydrated');
  });
});
