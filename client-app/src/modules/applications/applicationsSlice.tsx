import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchApplications } from "./services/applicationsApi";
import type {
  Application,
  ApplicationQueryParams,
} from "./types/Application";

interface ApplicationsState {
  list: Application[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  list: [],
  total: 0,
  loading: false,
  error: null,
};

// 🚀 async thunk — зарежда приложенията по зададените параметри
export const loadApplications = createAsyncThunk(
  "applications/load",
  async (params: ApplicationQueryParams) => {
    const res = await fetchApplications(params);
    return res;
  }
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items;
        state.total = action.payload.totalCount;
        state.error = null;
      })
      .addCase(loadApplications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "❌ Failed to load applications";
      });
  },
});

export default applicationsSlice.reducer;
