import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        domains: ["lh3.googleusercontent.com"],
    },
};

// Only run during `next dev`, not during `next build`
if (process.argv.includes("dev") || process.env.NODE_ENV === "development") {
    import("@opennextjs/cloudflare").then(
        ({ initOpenNextCloudflareForDev }) => {
            initOpenNextCloudflareForDev({
                experimental: {
                    remoteBindings: true, // 启用远程绑定，本地开发直接连接真实 R2
                },
            });
        },
    );
}

export default nextConfig;
