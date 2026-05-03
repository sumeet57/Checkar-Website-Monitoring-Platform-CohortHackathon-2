import axios from "axios";

const createApiClient = (baseURL) => {
    return axios.create({
        baseURL: `${baseURL}/api`,
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export default createApiClient;