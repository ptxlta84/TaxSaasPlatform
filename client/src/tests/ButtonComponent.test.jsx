import { render, screen, fireEvent } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import Button from '../../components/Button/Button.jsx';
import { describe, it, expect, vi } from 'vitest';

describe('Button Component', () => {
    it('renders correctly with children', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByRole('button')).toHaveTextContent('Click Me');
    });

    it('triggers onClick handler', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state', () => {
        render(<Button isLoading>Submit</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
