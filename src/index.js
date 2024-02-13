import {GetSocketIoServerInstance, OnConnectHandler} from './socketServer';
import expressServer from './expressServer';
import {SocketAuth} from './server/middlewares/socketAuth';
import mongoose from 'mongoose';
import {config} from '/config';

// connect to mongodb
let mongodbURL = config.mongodb;
if (config.env == 'production') {
  mongodbURL = config.mongodbremote;
}
mongoose.connect(mongodbURL, {
  dbName: config.dbName,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (err) => console.error('connection error', err));

// init express server
const server = expressServer;

// init websocket server
const io = GetSocketIoServerInstance();
io.use(SocketAuth);
io.on('connection', OnConnectHandler);

export default server;
