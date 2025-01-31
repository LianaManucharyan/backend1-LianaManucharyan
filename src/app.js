import express from 'express';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import path from 'path'; 
import productsRouter from './routes/api/products.routes.js';
import cartsRouter from './routes/api/carts.routes.js';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

const connectDb = () => {
  console.log("Base de datos conectada");
  mongoose.connect('mongodb+srv://lianamanucharyan002:lFpAttBQRk86o7lB@cluster0.v00xs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
};
connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', engine());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});