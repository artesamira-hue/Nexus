import type { ReactNode } from "react";

type Props = {
    title: string;
    value: string | number;
    subtitle?: ReactNode;
    color?: "blue" | "green" | "red" | "orange" | "purple" | "dark";
};

const StatsCard = ({ title, value, subtitle, color = "blue" }: Props) => {
    return (
        <div className={`card ${color}`}>
            <p className="card-title">{title}</p>
            <h2>{value}</h2>
            <span>{subtitle}</span>
        </div>
    );
};

export default StatsCard;
