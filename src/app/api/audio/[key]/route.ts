import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFoundResponse } from "@/lib/api-response";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { env } = await getCloudflareContext();
        const { key: paramKey } = await params;
        const key = decodeURIComponent(paramKey);

        // 从 R2 获取文件
        const object = await env.FILES.get(key);

        if (!object) {
            return notFoundResponse("Audio file not found");
        }

        // 返回音频文件
        const arrayBuffer = await object.arrayBuffer();

        return new Response(arrayBuffer, {
            status: 200,
            headers: {
                "Content-Type": object.httpMetadata?.contentType || "audio/mpeg",
                "Content-Length": object.size.toString(),
                "Cache-Control": "public, max-age=31536000",
            },
        });
    } catch (error) {
        console.error("Error fetching audio:", error);
        return notFoundResponse("Audio file not found");
    }
}
