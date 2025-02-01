import express from 'express';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import path from 'path';
import Product from './models/product.js'; 

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

const connectDb = () => {
  console.log("Base de datos conectada");
  mongoose.connect('mongodb+srv://lianamanucharyan002:lFpAttBQRk86o7lB@cluster0.v00xs.mongodb.net/backendLianaM?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.log(err));
};
connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', engine({
  defaultLayout: 'main',  
  layoutsDir: path.join(__dirname, 'views', 'layouts') 
}));
app.set('views', path.join(__dirname, 'views'));  
app.set('view engine', 'handlebars'); 

app.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort = '', query = '' } = req.query;

    const filters = {};
    if (query) {
      filters.category = query; 
    }

    const sortOptions = {};
    if (sort === 'asc') {
      sortOptions.price = 1;  
    } else if (sort === 'desc') {
      sortOptions.price = -1;  
    }

    const products = await Product.find(filters)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort(sortOptions);

    const totalCount = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalCount / limit);

    res.render('home', {
      products, 
      page,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      query,
      sort,
      limit
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
