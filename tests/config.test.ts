import { describe, expect, it } from 'vitest';
import config from '../astro.config.mjs';

describe('Astro-configuratie', () => {
  it('publiceert de site onder het subpad op GitHub Pages', () => {
    expect(config.site).toBe('https://yvanvds.github.io');
    expect(config.base).toBe('/workshop-test-breuken');
  });
});
