const mockGetToken = jest.fn();
const mockEncode = jest.fn();
const mockDecode = jest.fn();

module.exports = {
  getToken: mockGetToken,
  encode: mockEncode,
  decode: mockDecode,
};
