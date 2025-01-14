import { Router } from "express";
import fs from 'fs';
import { io } from '../../app.js'; 

const productsRoutes = Router();

export const getProducts = async () => {
  try {
    const products = await fs.promises.readFile('src/db/products.json', 'utf-8');
    return JSON.parse(products);
  } catch (error) {
    return [];
  }
};

const saveProducts = async (products) => {
  try {
    const parsedProducts = JSON.stringify(products, null, 2);
    await fs.promises.writeFile('src/db/products.json', parsedProducts, 'utf-8');
    return true;
  } catch (error) {
    console.log({ error });
    return false;
  }
};

productsRoutes.post('/', async (req, res) => {
  const product = req.body;
  product.id = Math.floor(Math.random() * 10000);

  if (!product.title || !product.description || !product.code || !product.price || !product.status || !product.stock || !product.category) {
    return res.status(400).send({ status: 'error', message: 'All fields are required' });
  }

  const products = await getProducts();
  products.push(product);
  const isOk = await saveProducts(products);

  if (!isOk) {
    return res.status(500).send({ status: 'Error', message: 'Could not be added' });
  }

  io.emit('product-updated', products);  

  res.status(201).send({ status: 'Ok', message: 'Product added' });
});

productsRoutes.delete('/:pid', async (req, res) => {
  const id = +req.params.pid;
  const products = await getProducts();
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).send({ status: 'Error', message: 'Product not found' });
  }

  products.splice(productIndex, 1);

  const isOk = await saveProducts(products);
  if (!isOk) {
    return res.status(500).send({ status: 'Error', message: 'Could not be deleted' });
  }

  io.emit('product-updated', products);  

  res.send({ status: 'Ok', message: 'Product deleted' });
});

export default productsRoutes;