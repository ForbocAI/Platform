import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('BDD Setup Verification', () => {
    it('runs a simple expectation', () => {
        expect(true).toBe(true)
    })

    it('can render a dummy component', () => {
        const TestComponent = () => <div>Hello BDD</div>
        render(<TestComponent />)
        expect(document.body.innerHTML).toContain('Hello BDD')
    })
})
