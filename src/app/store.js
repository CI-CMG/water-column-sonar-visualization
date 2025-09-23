import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice"

export const store = configureStore({
    reducer: {
        counter: counterReducer,
    },
},
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
