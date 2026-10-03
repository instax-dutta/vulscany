// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { GitHubAuthButton } from './GitHubAuthButton';

describe('GitHubAuthButton', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders an enabled sign-in button', () => {
        render(<GitHubAuthButton />);

        expect(screen.getByRole('button', { name: /sign in with github/i })).toBeEnabled();
    });

    it('sends the browser to the server-side login route when clicked', async () => {
        const assign = vi.fn();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { ...window.location, assign, href: '' },
        });

        render(<GitHubAuthButton />);
        await userEvent.click(screen.getByRole('button', { name: /sign in with github/i }));

        expect(window.location.href).toBe('/api/auth/login');
    });
});