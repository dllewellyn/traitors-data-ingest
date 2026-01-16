import { github } from '@gcp-adl/github';

describe('Local Dependencies', () => {
  it('should resolve local @gcp-adl/github dependency', () => {
    expect(github).toBe('github');
  });
});
