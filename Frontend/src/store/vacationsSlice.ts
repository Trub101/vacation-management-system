import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Vacation, VacationFilter } from "../types/vacation.types";
import { fetchVacations } from "../services/vacations.service";
import { getErrorMessage } from "../api/client";

interface VacationsState {
  items: Vacation[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  filter: VacationFilter;
  loading: boolean;
  error: string | null;
}

const initialState: VacationsState = {
  items: [],
  total: 0,
  totalPages: 1,
  page: 1,
  limit: 9,
  filter: "all",
  loading: false,
  error: null,
};

export const loadVacations = createAsyncThunk(
  "vacations/load",
  async (
    args: { filter: VacationFilter; page: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      return await fetchVacations(args.filter, args.page, args.limit ?? 9);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to load vacations"));
    }
  }
);

const vacationsSlice = createSlice({
  name: "vacations",
  initialState,
  reducers: {
    // Optimistically reflect a like/unlike in the current list.
    toggleLikeLocal(
      state,
      action: PayloadAction<{ vacationId: number; liked: boolean }>
    ) {
      const v = state.items.find(
        (i) => i.vacation_id === action.payload.vacationId
      );
      if (!v) return;
      if (action.payload.liked && !v.is_liked) {
        v.is_liked = true;
        v.likes_count += 1;
      } else if (!action.payload.liked && v.is_liked) {
        v.is_liked = false;
        v.likes_count = Math.max(0, v.likes_count - 1);
      }
    },
    setFilterAndPage(
      state,
      action: PayloadAction<{ filter: VacationFilter; page: number }>
    ) {
      state.filter = action.payload.filter;
      state.page = action.payload.page;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadVacations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVacations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(loadVacations.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load vacations";
      });
  },
});

export const { toggleLikeLocal, setFilterAndPage } = vacationsSlice.actions;
export default vacationsSlice.reducer;
