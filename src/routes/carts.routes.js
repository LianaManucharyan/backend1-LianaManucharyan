import { Router } from "express";
import fs from 'fs';
import { getProducts }  from './products.routes.js';

const cartsRoutes = Router();

const getCarts = async () => {
    try {
      const data = await fs.promises.readFile('src/db/carts.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  };
  
  const saveCarts = async (carts) => {
    try {
      const data = JSON.stringify(carts, null, 2);
      await fs.promises.writeFile('src/db/carts.json', data, 'utf-8');
      return true;
    } catch (error) {
      return false;
    }
  };

cartsRoutes.post('/', async (req, res) => {
  const carts = await getCarts();
  const newId = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
  const newCart = { id: newId, products: [] };
  carts.push(newCart);

  const isOk = await saveCarts(carts);
  if (!isOk) {
    return res.status(500).json({ status: 'Error', message: 'Could not create cart' });
  }

  res.status(201).json({ status: 'Ok', message: 'Cart created', cart: newCart });
});

cartsRoutes.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  const carts = await getCarts();
  const cart = carts.find(c => c.id == cid);
  if (!cart) {
    return res.status(404).json({ status: 'Error', message: 'Cart not found' });
  }
  res.json(cart.products);
});


cartsRoutes.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const carts = await getCarts();
  const cart = carts.find(c => c.id == cid);
  if (!cart) {
    return res.status(404).json({ status: 'Error', message: 'Cart not found' });
  }
  const products = await getProducts();
  const product = products.find(p => p.id == pid);
  if (!product) {
    return res.status(404).json({ status: 'Error', message: 'Product not found' });
  }
  const existingProduct = cart.products.find(p => p.product == pid);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.products.push({ product: pid, quantity: 1 });
  }
  const isOk = await saveCarts(carts);
  if (!isOk) {
    return res.status(500).json({ status: 'Error', message: 'Could not add product to cart' });
  }
  res.json({ status: 'Ok', message: 'Product added to cart' });
});

export default cartsRoutes;