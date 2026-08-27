import { describe, it, expect } from 'vitest';
import { statusLabel } from './statusLabel';

describe('statusLabel', () => {
  it('maps known statuses to human-readable labels', () => {
    expect(statusLabel('todo')).toBe('To Do');
    expect(statusLabel('in_progress')).toBe('In Progress');
    expect(statusLabel('done')).toBe('Done');
  });

  it('falls back to the raw value for unknown statuses', () => {
    expect(statusLabel('archived')).toBe('archived');
  });
});
