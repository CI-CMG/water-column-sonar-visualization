import '../App.css';
import { Provider } from 'react-redux';
import { store } from '../app/store';
import Counter from '../features/counter/Counter';

function KitchenSink() {
    return (
        <Provider store={store}>
            <div>
                <Counter />
            </div>
        </Provider>
    )
}

export default KitchenSink
