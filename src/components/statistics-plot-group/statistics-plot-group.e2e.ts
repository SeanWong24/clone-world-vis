import { newE2EPage } from '@stencil/core/testing';

describe('s-statistics-plot-group', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<s-statistics-plot-group></s-statistics-plot-group>');

    const element = await page.find('s-statistics-plot-group');
    expect(element).toHaveClass('hydrated');
  });
});
