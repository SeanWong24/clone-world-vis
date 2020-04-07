import { newE2EPage } from '@stencil/core/testing';

describe('s-vis', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<s-vis></s-vis>');

    const element = await page.find('s-vis');
    expect(element).toHaveClass('hydrated');
  });
});
