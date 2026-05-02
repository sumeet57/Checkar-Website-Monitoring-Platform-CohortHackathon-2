import createApiClient from "../api.js";

const authApi = createApiClient(
    import.meta.env.VITE_AUTH_URL
);

export const loginAPI = async (data) => {
    const response = await authApi.post(
        "/auth/login",
        data
    );

    return response.data;
};

export const registerAPI = async (
    data
) => {
    const response = await authApi.post(
        "/auth/register",
        data
    );

    return response.data;
};

export const googleLoginAPI =
    async () => {
        const response = await authApi.post(
            "/auth/google"
        );

        return response.data;
    };

export const getCurrentUserAPI =
    async () => {
        const response = await authApi.get("/auth/profile");

        return response.data;
    };

export const logoutAPI = async () => {
    const response = await authApi.post(
        "/auth/logout"
    );

    return response.data;
};