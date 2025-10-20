import { BrowserRouter, Route, Routes } from 'react-router'
import KitchenSink from './pages/KitchenSink'
import Fishbox from './pages/Fishbox'
import Zarrita from './pages/Zarrita'
import PokemonDisplay from './pages/Pokemon'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/zarrita' element={<Zarrita />} />
                <Route path='/fishbox' element={<Fishbox />} />
                <Route path='/kitchen-sink' element={<KitchenSink />} />
                <Route path='/' element={<PokemonDisplay />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
