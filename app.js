const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();

// mongodb connection
mongoose.connect('mongodb://localhost/makeup_store');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
});
const Product = mongoose.model('Product', productSchema);

// 
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static(__dirname + '/public/'));

// ejs as the view engine
app.set('view engine', 'ejs');

// middleware to POST request bodies
app.use(express.urlencoded({ extended: true }));

// routes
app.get('/', async (req, res) => {
  const products = await Product.find();
  res.render('index', { products });
});

app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  res.render('cart', { cart });
});

app.post('/cart/add/:productId', async (req, res) => {
  const productId = req.params.productId;
  let cart = req.session.cart || [];
  const product = await Product.findById(productId);
  cart.push(product);
  req.session.cart = cart;
  res.redirect('/');
});

app.post('/cart/remove/:index', (req, res) => {
  const index = req.params.index;
  let cart = req.session.cart || [];
  cart.splice(index, 1);
  req.session.cart = cart;
  res.redirect('/cart');
});

app.post('/checkout', async (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) {
    res.redirect('/cart');
  } else {
    // checkout logic here (remove products, clear cart)
    req.session.cart = [];
    res.redirect('/');
  }
});

// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
