import { newE2EPage } from '@stencil/core/testing';

describe('s-bar-plot', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<s-bar-plot></s-bar-plot>');

    const element = await page.find('s-bar-plot');
    expect(element).toHaveClass('hydrated');
  });
});
