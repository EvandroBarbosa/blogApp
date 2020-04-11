/* Carregando os module da aplicação */
const express = require('express');
const handleBars = require('express-handlebars');
const bodyParser = require('body-parser');
const admin = require('./route/admin');
const path = require('path');
const mongoose = require('mongoose');

const usuarios = require('./route/usuario')

const app = express();
const session = require('express-session');
const flash = require('connect-flash')

const passport = require('passport')
require('./config/auth')(passport)

/* CONFIGURAÇÕES */
 
//Sessão
app.use(session({
    secret: 'programadoresdoAmanha',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(flash());

//MiddleWare
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next();
})

//Body-Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//HandleBars
app.engine('handlebars', handleBars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/blogapp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('Conectado ao mongo')
}).catch((err) => {
    console.log('Erro ao conectar ao mongo'+ err)
})

//Public
app.use(express.static(path.join(__dirname,'public')));

//Rotas
app.use('/', admin);
app.use('/usuarios', usuarios)

//Outros
const PORT = 8089
app.listen(PORT, () => {
    console.log('Servidor ON '+ PORT);
})

