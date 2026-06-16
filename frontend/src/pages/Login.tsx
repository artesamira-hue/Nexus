import React from "react";
import { useForm } from "react-hook-form";
import { login, getProfile } from "../api/authApi";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

type FormData = {
    username: string;
};

const Login: React.FC = () => {
    const { handleLogin } = useAuth();
    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors, isSubmitting }
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        try {
            const res = await login(data.username);
            const token = res.data.token;

            localStorage.setItem("token", token);

            const profile = await getProfile();
            handleLogin(profile.data.user);

            toast.success("Login successful 🎉");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Invalid user";
            toast.error(message);
            setError("username", {
                type: "manual",
                message: "Invalid user"
            });
        }
    };

    return (
        <div className="login-page">
            <Toaster position="bottom-right" reverseOrder={false} />

            <div className="login-card">
                <h2 className="login-title">Welcome 👋</h2>
                <p className="login-subtitle">Sign in to continue</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        className={`login-input ${errors.username ? "input-error" : ""}`}
                        placeholder="Enter username"
                        {...register("username", {
                            required: "Username is required",
                            onChange: () => clearErrors("username")
                        })}
                    />

                    {errors.username && (
                        <p className="error-text">{errors.username.message}</p>
                    )}

                    <button
                        className="login-button"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
