import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';

import {loginValidator, postCreateValidation, registerValidator} from './validations.js';
import {PostController, UserController} from './controllers/index.js';
import { checkAuth, handleValidationErrors } from './utils/index.js';
import { getLatsTags } from './controllers/PostControllers.js';

mongoose
  .connect('mongodb+srv://admin:admin@cluster0.nspkwh7.mongodb.net/blog?retryWrites=true&w=majority')
  .then(() => {console.log('DB ok')})
  .catch((err) => {console.log('DB error', err)})

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({storage});

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/auth/login',loginValidator, handleValidationErrors, UserController.login);
app.post ('/auth/register', registerValidator, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  })
});

app.get('/tags', PostController.getLatsTags);
app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLatsTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts',checkAuth, postCreateValidation, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err)
  }

  console.log('Server OK')
});