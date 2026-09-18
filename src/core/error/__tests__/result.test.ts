import { NetworkFailure } from '../failure';
import { err, ok, type Result } from '../result';

describe('Result', () => {
  it('wraps a success value', () => {
    const result: Result<number> = ok(42);
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.value).toBe(42);
    }
  });

  it('wraps a failure', () => {
    const result: Result<number> = err(NetworkFailure());
    expect(result.kind).toBe('err');
    if (result.kind === 'err') {
      expect(result.failure.type).toBe('network');
    }
  });
});
