import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

// parse body params
const verify = (req, _, buf) => {
  req.rawBody = buf.toString();
};
app.use(bodyParser.json({verify}));
app.use(bodyParser.urlencoded({extended: true, verify}));
app.use(cors());
// HTTP request logger middleware for node.js
app.use(morgan('dev'));
// static path for HTML page
const publicDir = path.resolve(__dirname, '..', '..', 'public');
app.use(express.static(publicDir));

app.use(cookieParser());

export default app;
