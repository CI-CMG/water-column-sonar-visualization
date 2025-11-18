import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice"
import { pokemonApi } from "../services/pokemon";
import zarrReducer from "../features/zarr/zarrSlice";

// Define the app's store
export const store = configureStore({
    reducer: {
        // Test reducers
        counter: counterReducer,
        [pokemonApi.reducerPath]: pokemonApi.reducer,
        // The actual reducer for fetching the data
        zarr: zarrReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokemonApi.middleware),
},
    // I'm not exacly sure why, but the Redux dev tools will not work without this line
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
