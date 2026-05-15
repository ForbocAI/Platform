import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import gameReducer from '../src/features/game/store/gameSlice'
import uiReducer from '../src/features/core/ui/slice/uiSlice'
import narrativeReducer from '../src/features/narrative/slice/narrativeSlice'
import audioReducer from '../src/features/audio/slice/audioSlice'
import { baseApi } from '../src/features/core/api/baseApi'
import Home from '../src/app/page'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}))

// Mock next/image to a plain img
vi.mock('next/image', () => ({
    default: (props: Record<string, unknown>) => {
        const { unoptimized: _u, ...rest } = props
        return <img {...rest} />
    },
}))

function createTestStore() {
    return configureStore({
        reducer: {
            game: gameReducer,
            ui: uiReducer,
            narrative: narrativeReducer,
            audio: audioReducer,
            [baseApi.reducerPath]: baseApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(baseApi.middleware),
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
