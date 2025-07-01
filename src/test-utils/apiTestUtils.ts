/**
 * Common utilities for API route testing
 */
export const createMockRequest = (data: any): Request => {
  return {
    json: async () => data,
  } as Request;
};

/**
 * Common pattern for testing API responses
 */
export const testApiResponse = async (
  handler: (req: Request) => Promise<Response>,
  requestData: any,
  expectedStatus: number,
  expectedSuccess: boolean
) => {
  const request = createMockRequest(requestData);
  const response = await handler(request);
  const responseData = await response.json();

  expect(response.status).toBe(expectedStatus);
  expect(responseData.success).toBe(expectedSuccess);
  
  return { response, responseData };
};

/**
 * Common pattern for testing service error responses
 */
export const testServiceErrorResponse = async (
  handler: (req: Request) => Promise<Response>,
  requestData: any,
  mockError: any,
  mockServiceMethod: jest.Mock,
  expectedStatus: number
) => {
  mockServiceMethod.mockResolvedValue(mockError);
  
  const { responseData } = await testApiResponse(
    handler,
    requestData,
    expectedStatus,
    false
  );
  
  return responseData;
};