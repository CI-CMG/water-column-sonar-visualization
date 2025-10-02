import { BrowserRouter, Route, Routes } from 'react-router'
import KitchenSink from './pages/KitchenSink'
import Fishbox from './pages/Fishbox'
import Zarrita from './pages/Zarrita'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Zarrita />} />
                <Route path='/fishbox' element={<Fishbox />} />
                <Route path='/kitchen-sink' element={<KitchenSink />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
