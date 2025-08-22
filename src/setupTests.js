import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');

Object.assign(global, {
  TextDecoder,
  TextEncoder,
});

// Mock window.alert for tests
global.alert = jest.fn();