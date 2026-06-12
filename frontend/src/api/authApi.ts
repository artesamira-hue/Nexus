import api from "../api/api";

export const login = (username: string) => {
    return api.post("/login", { username });
};

export const getProfile = () => {
    return api.get("/profile");
};