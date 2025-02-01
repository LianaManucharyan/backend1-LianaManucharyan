import express from 'express';
import productsRoutes from './routes/api/products.routes.js';
import cartRoutes from './routes/api/carts.routes.js';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import viewsRoutes from './routes/views.router.js';  
import mongoose from 'mongoose';

const app = express();
const PORT = 8080;  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const runtimeOptions = {
  allowProtoPropertiesByDefault: true,
  allowProtoMethodsByDefault: true,
};

app.engine("handlebars", handlebars.engine({ runtimeOptions }));
app.set("view engine", "handlebars");
app.set("views", "./src/views");
app.use(express.static('public'));

app.use('/api/products', productsRoutes);
app.use('/api/carts', cartRoutes);
app.use('/', viewsRoutes);  

const connectDb = () => {
  mongoose.connect('mongodb+srv://lianamanucharyan002:lFpAttBQRk86o7lB@cluster0.v00xs.mongodb.net/backendLianaM?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.log('Error al conectar a MongoDB:', err));
};
connectDb();

const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  const io = new Server(httpServer);

  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  io.on('connection', (socket) => {
    console.log("Nuevo cliente conectado");
  });
});
