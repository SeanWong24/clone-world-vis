import { newE2EPage } from '@stencil/core/testing';

describe('s-parallel-sets', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<s-parallel-sets></s-parallel-sets>');

    const element = await page.find('s-parallel-sets');
    expect(element).toHaveClass('hydrated');
  });
});
