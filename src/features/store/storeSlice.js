import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchStoreShape, fetchStoreAttributes } from './storeApi.js';

// Prevent a bunch of null values initially
const initialState = {
    shipName: "Henry_B._Bigelow",
    cruiseName: "HB1906",
    sensorName: "EK60",
    storeShape: null,
    storeShapeStatus: "idle",
}

// The selector is just a getter for the data we want
// Each property we want will need a selector for it
export const selectStoreAttributes = (state) => state.store.storeAttributes
export const selectStoreShape = (state) => state.store.storeShape
export const selectCruise = (state) => state.store.cruise
export const selectSvMin = (state) => state.store.svMin
export const selectSvMax = (state) => state.store.svMax
export const selectFrequencyIndex = (state) => state.store.frequenctIndex
export const selectColorIndex = (state) => state.store.colorIndex

// Eventually there will be a thunk for each property that needs to be accessed
// The thunks are separate from the Api in order to make each section more readable
export const storeShapeAsync = createAsyncThunk(
    "store/fetchStoreShape",
    async ({ ship, cruise, sensor }) => {
        const response = fetchStoreShape(ship, cruise, sensor)
        return response
    }
)

export const storeAttributesAsync = createAsyncThunk(
    "store/fetchStoreAttributes",
    async ({ ship, cruise, sensor }) => {
        const response = fetchStoreAttributes(ship, cruise, sensor)
        return [...response.data].map(x => Number(x))
    }
)

export const storeSlice = createSlice({
    name: "store",
    initialState,
    reducers: {},
    // Handle the state of the thunk, and add it to the state
    extraReducers: builder => {
        builder
            // Store attributes
            .addCase(storeAttributesAsync.pending, state => {
                state.storeAttributesStatus = "loading";
            }).addCase(storeAttributesAsync.fulfilled, (state, action) => {
                state.storeAttributesStatus = "idle";
                state.storeAttributes = action.payload; // attrs
            }).addCase(storeAttributesAsync.rejected, state => {
                state.storeAttributesStatus = "failed";
            })
            // Store shape
            .addCase(storeShapeAsync.pending, state => {
                state.storeShapeStatus = "loading"
            }).addCase(storeShapeAsync.fulfilled, (state, action) => {
                state.storeShapeStatus = "idle"
                state.storeShape = action.payload
            }).addCase(storeShapeAsync.rejected, state => {
                state.storeShapeStatus = "failed"
            })
    }
})

export default storeSlice.reducer
