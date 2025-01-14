import express from 'express';
import handlebars from 'express-handlebars';
import http from 'http';
import { Server as socketIo } from 'socket.io';  

import productsRoutes from './routes/api/products.routes.js';
import cartsRoutes from './routes/api/carts.routes.js';
import viewsRouter from './routes/views.router.js';

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

app.use('/', viewsRouter(io));
app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
