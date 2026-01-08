import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice"
import { pokemonApi } from "../services/pokemon";
import storeReducer from "../features/store/storeSlice";

// Define the app's store
// The store is a centralized data storage that can be accessed from any part of the app
export const store = configureStore({
    reducer: {
        // Test reducers
        counter: counterReducer,
        [pokemonApi.reducerPath]: pokemonApi.reducer,
        // The actual reducer for fetching the zarr stores
        store: storeReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokemonApi.middleware),
},
    // I'm not exacly sure why, but the Redux dev tools will not work without this line
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
