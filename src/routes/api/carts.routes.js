import express from 'express';
import Cart from '../../models/cart.js';
import Product from '../../models/product.js';

const router = express.Router();

router.post('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  console.log(`Recibido cartId: ${cid}, productId: ${pid}, quantity: ${quantity}`);

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    const availableStock = product.stock;
    const requestedQuantity = parseInt(quantity);

    if (requestedQuantity > availableStock) {
      return res.status(400).json({ status: 'error', message: `No hay suficiente stock. Solo hay ${availableStock} disponibles.` });
    }

    const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === pid);
    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += requestedQuantity;
    } else {
      cart.products.push({ productId: pid, quantity: requestedQuantity });
    }

    await cart.save();

    res.redirect(`/cartDetail/${cid}`);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/:cid/products/:pid/delete', async (req, res) => {
  const { cid, pid } = req.params;

  console.log(`Recibiendo la solicitud para eliminar el producto con cartId: ${cid}, productId: ${pid}`);

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }

    cart.products.splice(productIndex, 1);
    await cart.save();

    res.json({ status: 'success', message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/empty', async (req, res) => {
  try {
    const cart = await Cart.findOne({ _id: req.body.cartId });
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    cart.products = []; 
    await cart.save();

    res.json({ status: 'success', message: 'Carrito vacío correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al vaciar el carrito' });
  }
});






export default router;