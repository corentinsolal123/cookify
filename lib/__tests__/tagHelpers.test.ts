import { generateSlug, PREDEFINED_TAGS } from '../tagHelpers';

describe('tagHelpers', () => {
  it('generateSlug removes accents and spaces', () => {
    expect(generateSlug('Épice douce 1')).toBe('epice-douce-1');
  });

  it('predefined tags have matching slugs', () => {
    const tag = PREDEFINED_TAGS.find(t => t.name === 'Italien');
    expect(tag?.slug).toBe(generateSlug('Italien'));
  });
});
