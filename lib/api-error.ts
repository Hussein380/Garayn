export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export interface ValidationError {
    path: string;
    message: string;
}

export interface ApiErrorResponse {
    error: string;
    details?: ValidationError[];
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
            error: 'An unexpected error occurred'
        }));

        // Handle validation errors
        if (response.status === 400 && errorData.details) {
            throw new ApiError(
                'Validation Error',
                response.status,
                errorData.details
            );
        }

        // Handle rate limiting
        if (response.status === 429) {
            throw new ApiError(
                'Too many requests. Please try again later.',
                response.status
            );
        }

        // Handle authentication errors
        if (response.status === 401) {
            throw new ApiError(
                'Please sign in to continue',
                response.status
            );
        }

        // Handle authorization errors
        if (response.status === 403) {
            throw new ApiError(
                'You do not have permission to perform this action',
                response.status
            );
        }

        // Handle not found errors
        if (response.status === 404) {
            throw new ApiError(
                'The requested resource was not found',
                response.status
            );
        }

        // Handle image validation errors
        if (response.status === 400 && errorData.error.includes('Invalid image')) {
            throw new ApiError(
                errorData.error,
                response.status
            );
        }

        // Handle other errors
        throw new ApiError(
            errorData.error || 'An unexpected error occurred',
            response.status
        );
    }

    return response.json();
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 400 && Array.isArray(error.details)) {
            // Format validation errors
            return error.details
                .map(err => `${err.path}: ${err.message}`)
                .join('\n');
        }
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
}

export function isValidationError(error: unknown): error is ApiError {
    return error instanceof ApiError && error.status === 400 && Array.isArray(error.details);
}

export function isAuthError(error: unknown): error is ApiError {
    return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export function isRateLimitError(error: unknown): error is ApiError {
    return error instanceof ApiError && error.status === 429;
} 