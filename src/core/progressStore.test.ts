import { describe, expect, it, vi } from 'vitest';
import { ProgressStore } from './progressStore';

describe('ProgressStore', () => {
  it('clamps set values to [0, 100]', () => {
    const store = new ProgressStore();
    store.set(-5);
    expect(store.value).toBe(0);
    store.set(150);
    expect(store.value).toBe(100);
  });

  it('notifies subscribers on change, not on same value', () => {
    const store = new ProgressStore();
    const listener = vi.fn();
    store.subscribe(listener, false);
    store.set(10);
    store.set(10);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(10);
  });

  it('emits immediately on subscribe by default', () => {
    const store = new ProgressStore(42);
    const listener = vi.fn();
    store.subscribe(listener);
    expect(listener).toHaveBeenCalledWith(42);
  });

  it('unsubscribes cleanly', () => {
    const store = new ProgressStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener, false);
    unsubscribe();
    store.set(50);
    expect(listener).not.toHaveBeenCalled();
  });

  it('advances by rate·dt while playing and stops at 100', () => {
    const store = new ProgressStore(0, 10);
    store.tick(1);
    expect(store.value).toBe(0);
    store.play();
    store.tick(1);
    expect(store.value).toBe(10);
    store.tick(100);
    expect(store.value).toBe(100);
    expect(store.isPlaying).toBe(false);
  });

  it('restarts from 0 when play is pressed at 100', () => {
    const store = new ProgressStore(100);
    store.play();
    expect(store.value).toBe(0);
    expect(store.isPlaying).toBe(true);
  });

  it('toggle flips play state', () => {
    const store = new ProgressStore();
    store.toggle();
    expect(store.isPlaying).toBe(true);
    store.toggle();
    expect(store.isPlaying).toBe(false);
  });
});
