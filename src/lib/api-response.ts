/**
 * API 响应的标准格式
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    error: string | null;
    message?: string;
}

/**
 * 成功响应
 */
export function successResponse<T>(
    data: T,
    message?: string,
    status: number = 200,
): Response {
    return new Response(
        JSON.stringify({
            success: true,
            data,
            error: null,
            message,
        } as ApiResponse<T>),
        {
            status,
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
}

/**
 * 错误响应
 */
export function errorResponse(
    error: string,
    status: number = 400,
    data: any = null,
): Response {
    return new Response(
        JSON.stringify({
            success: false,
            data,
            error,
        } as ApiResponse),
        {
            status,
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
}

/**
 * 未授权响应 (401)
 */
export function unauthorizedResponse(
    message: string = "Authentication required",
): Response {
    return errorResponse(message, 401);
}

/**
 * 未找到响应 (404)
 */
export function notFoundResponse(
    message: string = "Resource not found",
): Response {
    return errorResponse(message, 404);
}

/**
 * 服务器错误响应 (500)
 */
export function serverErrorResponse(
    message: string = "Internal server error",
): Response {
    return errorResponse(message, 500);
}
