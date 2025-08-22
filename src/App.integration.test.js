import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Mock axios before importing App
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

import axios from 'axios';
import App from './App';

const server = setupServer(...handlers);

describe('App Integration Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    // Reset axios mocks but let MSW handle the actual HTTP calls
    jest.clearAllMocks();
    
    // Configure axios mocks to make actual calls (which MSW will intercept)
    axios.get.mockImplementation((url) => {
      return fetch(url).then(res => res.json()).then(data => ({ data }));
    });
    
    axios.post.mockImplementation((url, data) => {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()).then(data => ({ data }));
    });
  });

  test('fetches real data and creates real orders', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Integration Test Product')).toBeInTheDocument();
    });
    
    window.alert = jest.fn();
    const buyButton = screen.getByText('Buy Now');
    fireEvent.click(buyButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Order created!');
    });
  });
});