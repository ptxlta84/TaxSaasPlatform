import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { describe, it, expect } from 'vitest';

// 1. Define a Schema (e.g., PAN Card)
const schema = z.object({
  pan: z.string().regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN Format")
});

// 2. Create a Test Component
const TestForm = () => {
  const { register, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange' // Validate immediately for easier testing
  });

  return (
    <form>
      <input placeholder="PAN Number" {...register('pan')} />
      {errors.pan && <span role="alert">{errors.pan.message}</span>}
    </form>
  );
};

describe('RHF + Zod Validation (PAN)', () => {
  it('shows error for invalid PAN', async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    const input = screen.getByPlaceholderText('PAN Number');
    
    // Type invalid PAN
    await user.type(input, 'ABCDE1234'); // Missing last char
    
    // Check error message
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid PAN Format');
  });

  it('accepts valid PAN', async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    const input = screen.getByPlaceholderText('PAN Number');
    
    // Type VALID PAN
    await user.type(input, 'ABCDE1234F'); // Full Valid
    
    // Ensure error is gone
    const alert = screen.queryByRole('alert');
    expect(alert).not.toBeInTheDocument();
  });
});
