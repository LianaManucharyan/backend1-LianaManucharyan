import { Router } from "express";
import ProductManager from '../managers/productManager.js';

const viewsRouter = Router();
const productManager = new ProductManager();  

viewsRouter.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();  
        res.render('home', {
            title: 'Home - Mi Tienda',
            products: products
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

viewsRouter.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();  
        res.render('realtimeproducts', {
            title: 'Productos en Tiempo Real',
            products: products
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

export default function(io) {
  viewsRouter.use((req, res, next) => {
    req.io = io;
    next();
  });
  
  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    
    socket.emit('product-list', productManager.getProducts()); 

    socket.on('new-product', async (product) => {
      try {
        await productManager.createProduct(product);
        const products = await productManager.getProducts();
        io.emit('product-list', products); 
      } catch (error) {
        console.error("Error al agregar el producto:", error);
      }
    });
  
    socket.on('delete-product', async (productId) => {
      try {
        const success = await productManager.deleteProduct(productId); 
        if (success) {
          const products = await productManager.getProducts(); 
          io.emit('product-list', products); 
        }
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
      }
    });
  });


  return viewsRouter;
}
