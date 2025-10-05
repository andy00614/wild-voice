import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface UploadResult {
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
}

export async function uploadToR2(
    file: File,
    folder: string = "uploads",
): Promise<UploadResult> {
    try {
        const { env } = await getCloudflareContext();

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split(".").pop() || "bin";
        const key = `${folder}/${timestamp}_${randomId}.${extension}`;

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Upload to R2
        const result = await env.FILES.put(key, arrayBuffer, {
            httpMetadata: {
                contentType: file.type,
                cacheControl: "public, max-age=31536000", // 1 year
            },
            customMetadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString(),
                size: file.size.toString(),
            },
        });

        if (!result) {
            return {
                success: false,
                error: "Upload failed",
            };
        }

        // 使用 R2 公共 URL
        // 注意：启用了 experimental_remote 后，本地开发也会上传到真实 R2
        const publicUrl = `${env.CLOUDFLARE_R2_URL}/${key}`;

        return {
            success: true,
            url: publicUrl,
            key: key,
        };
    } catch (error) {
        console.error("R2 upload error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Upload failed",
        };
    }
}

export async function getFromR2(key: string): Promise<R2Object | null> {
    try {
        const { env } = await getCloudflareContext();
        return env.FILES.get(key);
    } catch (error) {
        console.error("Error getting data from R2", error);
        return null;
    }
}

export async function listR2Files() {}
