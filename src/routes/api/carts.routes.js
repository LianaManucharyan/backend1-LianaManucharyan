import express from 'express';
import Cart from '../../models/cart.js';

const router = express.Router();


router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);
    if (productIndex !== -1) {
      cart.products.splice(productIndex, 1);
      await cart.save();
      res.status(200).json({ status: 'success', message: 'Producto eliminado del carrito' });
    } else {
      res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;
  try {
    const cart = await Cart.findById(cid);
    cart.products = products;
    await cart.save();
    res.status(200).json({ status: 'success', message: 'Carrito actualizado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findById(cid);
    const product = cart.products.find(p => p.productId.toString() === pid);
    if (product) {
      product.quantity = quantity;
      await cart.save();
      res.status(200).json({ status: 'success', message: 'Cantidad de producto actualizada' });
    } else {
      res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    cart.products = [];
    await cart.save();
    res.status(200).json({ status: 'success', message: 'Carrito vacío' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;