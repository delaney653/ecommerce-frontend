import { rest } from 'msw';

export const handlers = [
  rest.get('http://localhost:3001/products', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'Integration Test Product', price: 99.99 }
      ])
    );
  }),
  
  rest.post('http://localhost:3002/orders', (req, res, ctx) => {
    return res(
      ctx.json({ id: 1, productId: 1, quantity: 1 })
    );
  })
];