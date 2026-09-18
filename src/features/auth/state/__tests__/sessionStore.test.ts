import { FakeAuthRepository } from '../../data/fakeAuthRepository';
import { createSessionStore } from '../sessionStore';

describe('sessionStore', () => {
  it('restore() starts idle, goes to data with the restored session', async () => {
    const store = createSessionStore(new FakeAuthRepository(0), 'mobile');
    expect(store.getState().status).toBe('idle');

    await store.getState().restore();

    expect(store.getState().status).toBe('data');
    expect(store.getState().session).toBeNull();
  });

  it('signIn() updates the session on success and returns the Result', async () => {
    const store = createSessionStore(new FakeAuthRepository(0), 'web');

    const result = await store.getState().signIn({ email: 'a@b.com', password: '123456' });

    expect(result.kind).toBe('ok');
    expect(store.getState().session?.email).toBe('a@b.com');
    expect(store.getState().session?.origin).toBe('web');
  });

  it('signIn() does not touch the session on failure', async () => {
    const store = createSessionStore(new FakeAuthRepository(0), 'web');

    const result = await store.getState().signIn({ email: 'a@b.com', password: 'wrong' });

    expect(result.kind).toBe('err');
    expect(store.getState().session).toBeNull();
  });

  it('signOut() clears the session', async () => {
    const store = createSessionStore(new FakeAuthRepository(0), 'web');
    await store.getState().signIn({ email: 'a@b.com', password: '123456' });
    expect(store.getState().session).not.toBeNull();

    await store.getState().signOut();

    expect(store.getState().session).toBeNull();
  });
});
