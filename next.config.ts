import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
    webpack: (config, { isServer }) => {
        // Ignore Node.js modules in browser bundles
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                worker_threads: false,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
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
