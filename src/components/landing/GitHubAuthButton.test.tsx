// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GitHubAuthButton } from './GitHubAuthButton'

describe('GitHubAuthButton', () => {
    it('renders a disabled archive notice button', () => {
        render(<GitHubAuthButton />)

        expect(screen.getByRole('button', { name: /github auth removed in archive/i })).toBeDisabled()
    })
})
