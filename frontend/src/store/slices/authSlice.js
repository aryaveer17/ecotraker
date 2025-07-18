import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../services/api"

// Async thunks
export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/register", userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message)
  }
})

export const login = createAsyncThunk("auth/login", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/login", userData)
    localStorage.setItem("token", response.data.token)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message)
  }
})

export const loadUser = createAsyncThunk("auth/loadUser", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/auth/profile")
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message)
  }
})

const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: false,
  user: null,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token")
      state.token = null
      state.isAuthenticated = false
      state.user = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // 🚫 Don't auto-login after register
      })
      
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.token = null
        localStorage.removeItem("token")
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer