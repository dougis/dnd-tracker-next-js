// Re-export from consolidated API helpers to eliminate code duplication
export {
  createErrorResponse,
  createSuccessResponse,
  handleServiceResult
} from '@/lib/api/route-helpers';

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  pagination?: any;
}

export function validateAuth(request: Request): string | null {
  const userId = request.headers.get('x-user-id');
  return userId;
}

export function parseQueryParams(url: string) {
  const { searchParams } = new URL(url);
  return {
    type: searchParams.get('type'),
    search: searchParams.get('search'),
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
  };
}