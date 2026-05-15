// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GitHubAuthButton } from './GitHubAuthButton'

describe('GitHubAuthButton', () => {
    const originalLocation = window.location
    const originalAlert = window.alert

    beforeEach(() => {
        vi.unstubAllEnvs()
        vi.stubEnv('NEXT_PUBLIC_GITHUB_CLIENT_ID', '')
        window.alert = vi.fn()

        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                ...originalLocation,
                origin: 'http://localhost:3000',
                href: 'http://localhost:3000/'
            }
        })
    })

    afterEach(() => {
        window.alert = originalAlert
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation
        })
    })

    it('does not redirect when the GitHub client id is not configured', () => {
        render(<GitHubAuthButton />)

        fireEvent.click(screen.getByRole('button', { name: /connect with github/i }))

        expect(window.alert).toHaveBeenCalledWith(
            'GitHub OAuth is disabled in this public archive. Add NEXT_PUBLIC_GITHUB_CLIENT_ID locally if you want to test auth.'
        )
        expect(window.location.href).toBe('http://localhost:3000/')
    })
})
