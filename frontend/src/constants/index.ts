export type User = {
    username: string;
    role: string;
};

export type Page = "dashboard" | "attendance";

const _now = new Date();
export const CURRENT_YEAR = _now.getFullYear();
export const CURRENT_MONTH = _now.getMonth();
export const TODAY = _now.getDate() - 1;

export const MONTH_OPTIONS = ["May 2026", "Jun 2026"];
export const DEFAULT_MONTH = MONTH_OPTIONS[MONTH_OPTIONS.length - 1];