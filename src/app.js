import express from 'express';
import productsRoutes from './routes/api/products.routes.js';
import cartRoutes from './routes/api/carts.routes.js';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import viewsRoutes from './routes/views.router.js'; 
import mongoose from 'mongoose';
import Product from './models/product.js';
import Cart from './models/cart.js'; 
import sessionsRoutes from './routes/sessions.routes.js'; 

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hbs = handlebars.create({
  helpers: {
    eq: function(a, b) {
      return a === b;
    }
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true
  }
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./src/views");  
app.use(express.static('public'));

const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const io = new Server(httpServer);

app.use((req, res, next) => {
  req.io = io; 
  next();
});

app.use('/api/products', productsRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/sessions', sessionsRoutes);  
app.use('/', viewsRoutes);

const connectDb = async () => {
  try {
    await mongoose.connect('mongodb+srv://lianamanucharyan002:2brmAjR4ZWmN6NQB@cluster0.v00xs.mongodb.net/backendLianaM');
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
  }
};
connectDb();

io.on('connection', (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on('newProduct', (newProduct) => {
    console.log("Producto recibido para emitir: ", newProduct);
    io.emit('newProduct', newProduct);  
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

app.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await Product.find(); 
    res.render('realtimeproducts', {
      title: 'Productos en tiempo real',
      products: products  
    });
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).send('Error al obtener productos');
  }
});

app.get('/', async (req, res) => {
  const { query = '', sort = '', limit = 5, page = 1 } = req.query;

  try {
    const filter = query ? { category: query } : {}; 
    const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {}; 

    const options = {
      page: parseInt(page),  
      limit: parseInt(limit),
      sort: sortOption,     
    };

    const result = await Product.paginate(filter, options);

    const hasPrevPage = result.page > 1;
    const hasNextPage = result.page < result.totalPages;
    const prevPage = hasPrevPage ? result.page - 1 : null;
    const nextPage = hasNextPage ? result.page + 1 : null;

    let cart = await Cart.findOne();
    if (!cart) {
      console.log('No se encontró un carrito, creando uno nuevo...');
      cart = await Cart.create({ products: [] });
    }

    console.log('Cart ID:', cart._id);

    res.render('home', {
      title: 'Productos',
      products: result.docs,  
      query, 
      sort,
      limit,
      currentPage: result.page, 
      totalPages: result.totalPages,
      hasPrevPage,
      prevPage,
      hasNextPage,
      nextPage,
      cartId: cart._id.toString() 
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error al cargar los productos');
  }
});

app.post('/api/carts/empty', async (req, res) => {
  try {
    const cart = await Cart.findById(req.body.cartId);
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

export default app;