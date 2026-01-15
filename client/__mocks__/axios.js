import { vi } from 'vitest';

const mockAxiosInstance = {
    interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
    },
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } }
};

const axios = {
    create: vi.fn(() => mockAxiosInstance),
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
    ...mockAxiosInstance
};

export default axios;
