var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
require('dotenv').config();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('./services/passport');

var index = require('./routes/indexRoutes');
var userApi = require('./routes/api/users/usersRoutes');
var authApi = require('./routes/api/users/authRoutes');

var product_type = require('./routes/api/product_type/typeRoutes');
var products = require('./routes/api/product/productRoutes')
// const connection = await mysql.createConnection(process.env.DATABASE_URL)
var app = express();
app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/users', userApi);
app.use('/api/auth', authApi)
app.use('/api/pro_type', product_type)
app.use('/api/product', products)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const { name, message } = err;
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({ error: { name, message } })
  // res.render('error');
});

module.exports = app;
