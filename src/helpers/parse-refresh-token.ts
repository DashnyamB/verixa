
export const parseRefreshToken = (req: Request): string => {
    const cookies = Object.fromEntries(req.headers.get("cookie")?.split("; ").map(c => c.split("=")) || []);
    return cookies["refreshToken"];
};