import express from 'express';
import productsRoutes from './routes/api/products.routes.js';
import cartRoutes from './routes/api/carts.routes.js';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import viewsRoutes from './routes/views.router.js'; 
import mongoose from 'mongoose';
import Product from './models/product.js';

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

app.use('/api/products', productsRoutes);
app.use('/api/carts', cartRoutes);
app.use('/', viewsRoutes); 

const connectDb = async () => {
  try {
    await mongoose.connect('mongodb+srv://lianamanucharyan002:lFpAttBQRk86o7lB@cluster0.v00xs.mongodb.net/backendLianaM?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
  }
};
connectDb();

const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const io = new Server(httpServer);

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on('newProduct', (newProduct) => {
    io.emit('newProduct', newProduct);  
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

app.get('/realtimeproducts', (req, res) => {
  res.render('realtimeproducts', {
    title: 'Productos en tiempo real'
  });
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
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error al cargar los productos');
  }
});
