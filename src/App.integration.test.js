import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';
import App from './App';

// Set up MSW server
const server = setupServer(...handlers);

describe('App Integration Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('fetches real data and creates real orders', async () => {
    render(<App />);
    
    // Wait for products to load from "real" API
    await waitFor(() => {
      expect(screen.getByText('Integration Test Product')).toBeInTheDocument();
    });
    
    // Test actual order creation
    window.alert = jest.fn();
    const buyButton = screen.getByText('Buy Now');
    fireEvent.click(buyButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Order created!');
    });
  });
});