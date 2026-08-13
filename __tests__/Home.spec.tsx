import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import gameReducer from '../src/features/game/store/gameSlice'
import uiReducer from '../src/features/core/ui/slice/uiSlice'
import narrativeReducer from '../src/features/narrative/slice/narrativeSlice'
import audioReducer from '../src/features/audio/slice/audioSlice'
import Home from '../src/app/page'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}))

// Mock next/image to a plain img for test rendering
vi.mock('next/image', () => ({
    default: ({ unoptimized: _u, alt = '', ...rest }: Record<string, unknown>) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img alt={alt as string} {...rest} />
    },
}))

function createTestStore() {
    return configureStore({
        reducer: {
            game: gameReducer,
            ui: uiReducer,
            narrative: narrativeReducer,
            audio: audioReducer,
        },
    })
}

function renderWithStore(ui: React.ReactElement) {
    const store = createTestStore()
    return render(<Provider store={store}>{ui}</Provider>)
}

describe('Home Page', () => {
    it('renders without crashing', () => {
        renderWithStore(<Home />)
        expect(document.body).toBeDefined()
    })

    it('contains visible content', () => {
        const { container } = renderWithStore(<Home />)
        expect(container.textContent).toBeTruthy()
    })
})
