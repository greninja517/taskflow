import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

describe('Login', () => {
  it('shows a validation error when submitted empty', () => {
    render(<Login onLogin={() => {}} onSwitch={() => {}} />);
    fireEvent.click(screen.getByText('Log in'));
    expect(screen.getByRole('alert')).toHaveTextContent('Email and password are required');
  });

  it('calls onSwitch when the register link is clicked', () => {
    let switched = false;
    render(<Login onLogin={() => {}} onSwitch={() => (switched = true)} />);
    fireEvent.click(screen.getByText('Need an account? Register'));
    expect(switched).toBe(true);
  });
});
