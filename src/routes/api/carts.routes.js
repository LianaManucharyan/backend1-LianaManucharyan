import express from 'express';
import Cart from '../../models/cart.js';

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

    res.render('cart', {
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
  const { quantity } = req.body;

  try {
    const cart = await Cart.findById(cid);
    const product = cart.products.find(p => p.productId.toString() === pid);

    if (product) {
      product.quantity = quantity;
      await cart.save();
      res.redirect(`/carts/${cid}`);  
    } else {
      res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }
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
      res.redirect(`/carts/${cid}`);  
    } else {
      res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;