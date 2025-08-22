import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:3001/products', () => {
    return HttpResponse.json([
      { id: 1, name: 'Integration Test Product', price: 99.99 }
    ]);
  }),
  
  http.post('http://localhost:3002/orders', () => {
    return HttpResponse.json({ id: 1, productId: 1, quantity: 1 });
  })
];