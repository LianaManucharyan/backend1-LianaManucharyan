import express from 'express';
import handlebars from 'express-handlebars';
import http from 'http';
import { Server as socketIo } from 'socket.io';  
import mongoose from 'mongoose';

import productsRoutes from './routes/api/products.routes.js';
import cartsRoutes from './routes/api/carts.routes.js';
import viewsRouter from './routes/views.router.js';
import usersRouter from './routes/api/users.routes.js';

const PORT = 8080;
const app = express(); 
const server = http.createServer(app);
const io = new socketIo(server);  
export { io };

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", handlebars.engine());
app.set("views", "src/views");
app.set("view engine", "handlebars");

const connectDb = () => {
    console.log('base de datos conectada')
    mongoose.connect('mongodb+srv://lianamanucharyan002:lFpAttBQRk86o7lB@cluster0.v00xs.mongodb.net/backendLianaM?retryWrites=true&w=majority&appName=Cluster0')
}
connectDb();

app.use('/', viewsRouter(io));
app.use('/api/users', usersRouter);
app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
