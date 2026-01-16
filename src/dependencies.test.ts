import { github } from '@gcp-adl/github';
import { jules } from '@gcp-adl/jules';
import { gemini } from '@gcp-adl/gemini';
import { state } from '@gcp-adl/state';

describe('Local Dependencies', () => {
  it('should resolve all local @gcp-adl/* dependencies', () => {
    expect(github).toBe('github');
    expect(jules).toBe('jules');
    expect(gemini).toBe('gemini');
    expect(state).toBe('state');
  });
});
