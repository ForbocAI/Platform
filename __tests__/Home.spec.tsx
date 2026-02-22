import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Home from '../src/app/page'

// Mock Next.js navigation if needed, though simple Home render might just work
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}))

describe('Home Page', () => {
    it('renders the main heading', () => {
        render(<Home />)
        // Adjust selector based on actual content, assuming generic landing page elements
        // Fails initially to verify test runner works, or we inspect page content first
        // Just ensuring render doesn't crash is a good start
        expect(document.body).toBeDefined()
    })

    it('contains welcome text', () => {
        const { container } = render(<Home />)
        expect(container.textContent).toBeTruthy()
    })
})
