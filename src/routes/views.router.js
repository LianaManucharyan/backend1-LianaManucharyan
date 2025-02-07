import express from 'express'; 
import Cart from '../models/cart.js'; 
import productManager from '../managers/productManager.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { limit = 5, page = 1, sort = '', query = '' } = req.query;

  try {
    const filter = query ? { category: query } : {};  
    
    const products = await productManager.getProducts({ limit, page, sort, filter });
    
    const totalCount = await productManager.countProducts(query);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    const currentPage = Math.max(1, Math.min(page, totalPages));
    
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;
    const prevPage = hasPrevPage ? currentPage - 1 : null;
    const nextPage = hasNextPage ? currentPage + 1 : null;

    let cart = await Cart.findOne({});
    if (!cart) {
      cart = new Cart({ products: [] });
      await cart.save();
    }

    res.render('home', {
      title: 'Productos',
      products,
      totalPages,
      currentPage,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      query,
      sort,
      limit,
      cartId: cart._id
    });
  } catch (error) {
    console.error('Error al obtener productos para el home:', error);
    res.status(500).send('Error al obtener productos');
  }
});

router.get('/cartDetail/:cid', async (req, res) => {
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
      title: 'Detalle del Carrito',
      products: cart.products,
      total: total.toFixed(2),
      cartId: cart._id,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/checkCart', async (req, res) => {
  console.log('Accediendo a /checkCart');  
  try {
    let cart = await Cart.findOne({}); 
    console.log('Carrito encontrado:', cart);  

    if (!cart) {
      cart = new Cart({ products: [] });
      await cart.save();
      console.log('Nuevo carrito creado:', cart);  
    }

    res.redirect(`/cartDetail/${cart._id}`);
  } catch (error) {
    console.error('Error al verificar el carrito:', error);
    res.status(500).send('Error al verificar el carrito');
  }
});

export default router;