import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/auth/Login'; 
import { AuthProvider } from '../contexts/AuthContext'; // Needed for context

// Mock Axios globally for this test file
// Mock authService directly to avoid Axios/AuthContext bootstrap issues
vi.mock('../services/authService', () => ({
    authService: {
        login: vi.fn(),
        getCurrentUser: vi.fn(() => null),
        logout: vi.fn()
    },
    default: { // Mock the default export (axios instance) if used, but Login uses named export
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        }
    }
}));
// No need to mock axios anymore
// vi.mock('axios');

// Mock AuthContext if it's complex, OR wrap the component (Better Integration Test) -> Let's wrap it

// Need to import the mocked service to control it
import { authService } from '../services/authService';

describe('Login Integration (Mocked Service)', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('submits form and handles success', async () => {
        const user = userEvent.setup();
        
        render(
            <MemoryRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </MemoryRouter>
        );

        // Mock Service Success
        authService.login.mockResolvedValueOnce({
            user: { id: 1, name: 'Test User' },
            accessToken: 'fake-token', 
            message: 'Login successful' 
        });

        // Fill Form
        await user.type(screen.getByPlaceholderText(/enter your email/i), 'test@example.com');
        await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
        
        // Submit
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Verify Success
        expect(await screen.findByText(/Login successful/i)).toBeInTheDocument();
        
        // Verify Service Call
        expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('displays error on failed login', async () => {
        const user = userEvent.setup();
        
        render(
            <MemoryRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </MemoryRouter>
        );

        // Mock Service Failure
        const error = { response: { data: { message: 'Invalid credentials' } } };
        authService.login.mockRejectedValueOnce(error);

        // Submit
        await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
        await user.type(screen.getByLabelText(/password/i), 'wrongpass');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Check Error
        expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
    });
});
