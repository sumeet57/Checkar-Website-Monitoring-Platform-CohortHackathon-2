import { createSlice } from "@reduxjs/toolkit";

import {
    loginUser,
    registerUser,
    googleLogin,
    fetchCurrentUser,
    logoutUser,
} from "./authThunks";

const initialState = {
    user: null,
    authenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {},

    extraReducers: (builder) => {
        builder

            // LOGIN

            .addCase(
                loginUser.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                loginUser.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload.user;

                    state.authenticated = true;
                }
            )

            .addCase(
                loginUser.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )

            // REGISTER

            .addCase(
                registerUser.pending,
                (state) => {
                    state.loading = true;
                }
            )

            .addCase(
                registerUser.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload.user;

                    state.authenticated = true;
                }
            )

            .addCase(
                registerUser.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )

            // GOOGLE LOGIN

            .addCase(
                googleLogin.fulfilled,
                (state, action) => {
                    state.user =
                        action.payload.user;

                    state.authenticated = true;
                }
            )

            // CURRENT USER

            .addCase(
                fetchCurrentUser.fulfilled,
                (state, action) => {
                    state.user =
                        action.payload.user;

                    state.authenticated = true;
                }
            )

            // LOGOUT

            .addCase(
                logoutUser.fulfilled,
                (state) => {
                    state.user = null;
                    state.authenticated = false;
                }
            );
    },
});

export default authSlice.reducer;