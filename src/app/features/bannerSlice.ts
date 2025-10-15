// src/app/features/movieSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface MovieItem {
  id: number;
  title?: string;
  original_title?: string;
  backdrop_path?: string | null;
  overview?: string;
}

interface BannerState {
  nowPlaying: MovieItem[];
  loading: boolean;
  error: string | null;
}

export const fetchNowPlaying = createAsyncThunk<
  MovieItem[],
  void,
  { rejectValue: string }
>("movies/fetchNowPlaying", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch("http://localhost:3000/now_playing");
    if (!res.ok) {
      return rejectWithValue(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      return rejectWithValue("Dữ liệu không phải dạng mảng");
    }
    return data as MovieItem[];
  } catch (e) {
    const message = e instanceof Error ? e.message : "Lỗi không xác định";
    return rejectWithValue(message);
  }
});

const initialState: BannerState = {
  nowPlaying: [],
  loading: false,
  error: null,
};

const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNowPlaying.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchNowPlaying.fulfilled,
        (state, action: PayloadAction<MovieItem[]>) => {
          state.nowPlaying = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchNowPlaying.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Không tải được dữ liệu";
      });
  },
});

export const { clearError } = bannerSlice.actions;

export default bannerSlice.reducer;
