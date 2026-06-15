import { useState } from "react";

export function useLoading(initial = true) {
    const [loading, setLoading] = useState(initial);
    return { loading, setLoading };
}
