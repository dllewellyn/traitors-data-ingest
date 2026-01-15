import { describe, it, expect, vi } from 'vitest';
import { log } from './logging';

describe('logging', () => {
  it('should log a message to the console', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log('hello');
    expect(consoleLogSpy).toHaveBeenCalledWith('hello');
    consoleLogSpy.mockRestore();
  });
});
