import {
    createAsyncThunk,
} from "@reduxjs/toolkit";

import {
    loginAPI,
    registerAPI,
    googleLoginAPI,
    getCurrentUserAPI,
    logoutAPI,
} from "../../../interceptors/auth/authAPI.js";

export const loginUser =
    createAsyncThunk(
        "auth/login",
        async (data, thunkAPI) => {
            try {
                return await loginAPI(data);
            } catch (error) {
                return thunkAPI.rejectWithValue(
                    error.response.data.message
                );
            }
        }
    );

export const registerUser =
    createAsyncThunk(
        "auth/register",
        async (data, thunkAPI) => {
            try {
                return await registerAPI(data);
            } catch (error) {
                return thunkAPI.rejectWithValue(
                    error.response.data.message
                );
            }
        }
    );

export const googleLogin =
    createAsyncThunk(
        "auth/googleLogin",
        async ( _,thunkAPI) => {
            try {
                return await googleLoginAPI();
            } catch (error) {
                return thunkAPI.rejectWithValue(
                    error.response.data.message
                );
            }
        }
    );

export const fetchCurrentUser =
    createAsyncThunk(
        "auth/currentUser",
        async (_, thunkAPI) => {
            try {
                return await getCurrentUserAPI();
            } catch (error) {
                return thunkAPI.rejectWithValue(
                    error.response.data.message
                );
            }
        }
    );

export const logoutUser =
    createAsyncThunk(
        "auth/logout",
        async (_, thunkAPI) => {
            try {
                await logoutAPI();
            } catch (error) {
                return thunkAPI.rejectWithValue(
                    error.response.data.message
                );
            }
        }
    );