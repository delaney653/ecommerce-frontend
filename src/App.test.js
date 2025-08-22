import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

//mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} }))
}));

import axios from 'axios';
const mockedAxios = axios;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders e-commerce store heading', () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    
    render(<App />);
    
    expect(screen.getByText('E-Commerce Store')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  test('fetches and displays products on mount', async () => {
    const mockProducts = [
      { id: 1, name: 'Test Product 1', price: 29.99 },
      { id: 2, name: 'Test Product 2', price: 19.99 }
    ];

    mockedAxios.get.mockResolvedValue({ data: mockProducts });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Price: $29.99')).toBeInTheDocument();
    expect(screen.getByText('Price: $19.99')).toBeInTheDocument();
  });

  test('creates order when buy button is clicked', async () => {
    const mockProducts = [{ id: 1, name: 'Test Product', price: 29.99 }];
    const mockOrderResponse = { id: 1, productId: 1, quantity: 1 };

    mockedAxios.get.mockResolvedValue({ data: mockProducts });
    mockedAxios.post.mockResolvedValue({ data: mockOrderResponse });

    // Mock window.alert
    window.alert = jest.fn();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    const buyButton = screen.getByText('Buy Now');
    fireEvent.click(buyButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3002/orders', {
        productId: 1,
        quantity: 1
      });
    });

    expect(window.alert).toHaveBeenCalledWith('Order created!');
  });
});