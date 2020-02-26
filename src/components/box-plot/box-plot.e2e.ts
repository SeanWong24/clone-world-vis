import { newE2EPage } from '@stencil/core/testing';

describe('s-box-plot', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<s-box-plot></s-box-plot>');

    const element = await page.find('s-box-plot');
    expect(element).toHaveClass('hydrated');
  });
});
