import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars'
import __dirname from './utils.js';
import productsRoutes from "./routes/productsRouter.js"
import cartsRoutes from "./routes/cartsRouter.js"
import viewsRoutes from "./routes/viewsRouter.js"
import messagesRouter from  "./routes/messagesRouter.js"
import { Server } from 'socket.io';
import { productsUpdated, chat  } from './utils/socketUtils.js';
import sessionsRouter from './routes/sessionsRouter.js'

const app = express();
const mongoURL = 'mongodb+srv://admin:admin@clusterprueba.g12vkb7.mongodb.net/ecommerce'
const connection = mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'))
app.use(session({
    store: new MongoStore({
        mongoUrl: mongoURL,
        ttl: 3600
    }),
    secret: "CoderS3cr3t",
    resave: false,
    saveUninitialized: false
}));

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');


app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);
app.use('/api/messages', messagesRouter);
app.use('/', viewsRoutes);
app.use('/api/sessions', sessionsRouter);

const port = 8080;
const serverHttp = app.listen(port, () => {console.log('Servidor iniciado')})

const io = new Server(serverHttp);

app.set('io', io);

io.on('connection', socket => {
    console.log('New client connected', socket.id);
    productsUpdated(io);
    chat(socket, io);
});