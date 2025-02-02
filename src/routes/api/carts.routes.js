import express from 'express';
import Cart from '../../models/cart.js';
import Product from '../../models/product.js';

const router = express.Router();

router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid).populate('products.productId');
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const total = cart.products.reduce((acc, product) => {
      return acc + product.productId.price * product.quantity;
    }, 0);

    res.render('cartDetail', {
      products: cart.products,
      total: total.toFixed(2),
      cartId: cart._id,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === pid);
    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += req.body.quantity || 1;
    } else {
      cart.products.push({ productId: pid, quantity: req.body.quantity || 1 });
    }

    await cart.save();

    // Corregir el redirect aquí con backticks
    res.redirect(`/cartDetail/${cid}`);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/:cid/products/:pid/delete', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await Cart.findById(cid);
    const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);

    if (productIndex !== -1) {
      cart.products.splice(productIndex, 1);
      await cart.save();

      res.redirect(`/cartDetail/${cid}`);
    } else {
      res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({ status: 'success', message: 'Cantidad del producto actualizada', cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;