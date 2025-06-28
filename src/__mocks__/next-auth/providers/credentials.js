module.exports = jest.fn(config => ({
  id: 'credentials',
  name: 'credentials',
  type: 'credentials',
  ...config,
}));
