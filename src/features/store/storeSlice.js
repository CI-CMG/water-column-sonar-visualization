import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchStoreShape, fetchStoreAttributes, fetchDepth, fetchDepthArray, fetchSv } from './storeApi.js';

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
export const selectStoreAttributes = state => state.store.storeAttributes
export const selectStoreShape = state => state.store.storeShape
export const selectSv = state => state.store.sv
export const selectDepth = state => state.store.depth
export const selectDepthArray = state => state.store.depthArray

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

export const svAsync = createAsyncThunk(
    "store/fetchSv",
    async ({ ship, cruise, sensor, indexDepth, indexTime }) => {
        const response = fetchSv(ship, cruise, sensor, indexDepth, indexTime)
        return [...response.data].map(x => Number(Math.round(x * 1e2) / 1e2))
    }
)

export const depthAsync = createAsyncThunk(
    "store/fetchDepth",
    async ({ ship, cruise, sensor, indexDepth }) => {
        const response = await fetchDepth(ship, cruise, sensor, indexDepth)
        // Round to 2 decimal places
        return Math.round(response * 1e2) / 1e2
    }
)

export const depthArrayAsync = createAsyncThunk(
    "store/fetchDepthArray",
    async ({ ship, cruise, sensor }) => {
        const response = await fetchDepthArray(ship, cruise, sensor)
        // Round to 2 decimal places
        return response.data
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
                state.storeShapeStatus = "loading";
            }).addCase(storeShapeAsync.fulfilled, (state, action) => {
                state.storeShapeStatus = "idle";
                state.storeShape = action.payload;
            }).addCase(storeShapeAsync.rejected, state => {
                state.storeShapeStatus = "failed";
            })
            // Sv
            .addCase(svAsync.pending, state => {
                state.svStatus = "loading";
            }).addCase(svAsync.fulfilled, (state, action) => {
                state.svStatus = "idle";
                state.sv = action.payload;
            }).addCase(svAsync.rejected, state => {
                state.svStatus = "failed";
            })
            // Depth
            .addCase(depthAsync.pending, state => {
                state.depthStatus = "loading";
            }).addCase(depthAsync.fulfilled, (state, action) => {
                state.depthStatus = "idle";
                state.depth = action.payload;
            }).addCase(depthAsync.rejected, state => {
                state.depthStatus = "failed";
            })
            // DepthArray
            .addCase(depthArrayAsync.pending, state => {
                state.depthArrayStatus = "loading";
            }).addCase(depthArrayAsync.fulfilled, (state, action) => {
                state.depthArrayStatus = "idle";
                state.depthArray = action.payload;
            }).addCase(depthArrayAsync.rejected, state => {
                state.depthArrayStatus = "failed";
            })
    }
})

export default storeSlice.reducer
