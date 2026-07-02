import { describe, expect, it } from 'vitest';
import { FrameBudget, qualityFor } from './updateScheduler';

describe('FrameBudget', () => {
  it('allows exactly `limit` takes per frame', () => {
    const budget = new FrameBudget(3);
    expect(budget.take()).toBe(true);
    expect(budget.take()).toBe(true);
    expect(budget.take()).toBe(true);
    expect(budget.take()).toBe(false);
    expect(budget.remaining).toBe(0);
  });

  it('reset restores the full budget (fairness across frames)', () => {
    const budget = new FrameBudget(2);
    budget.take();
    budget.take();
    expect(budget.take()).toBe(false);
    budget.reset();
    expect(budget.take()).toBe(true);
    expect(budget.remaining).toBe(1);
  });
});

describe('qualityFor', () => {
  it('desktop gets the full tier', () => {
    const q = qualityFor(false, 1920);
    expect(q.treeCount).toBe(1200);
    expect(q.pixelRatioCap).toBe(2);
  });

  it('small touch devices get the low tier', () => {
    const q = qualityFor(true, 400);
    expect(q.treeCount).toBe(500);
    expect(q.pixelRatioCap).toBe(1.5);
    expect(q.decisionBudget).toBeLessThan(qualityFor(false, 1920).decisionBudget);
  });

  it('touch tablets with large screens keep the full tier', () => {
    expect(qualityFor(true, 1200).treeCount).toBe(1200);
  });
});
