import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    value: 0,
}

// Create a slice of the store that will hold and change the counter value
export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
    }
})

export const { increment, decrement } = counterSlice.actions
export default counterSlice.reducer
