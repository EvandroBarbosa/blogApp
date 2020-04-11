//Configurando as rotas
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
    res.render('usuario/registro')
})

router.post('/registro', (req, res) => {
    let erro = [];

    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null){
        erro.push({texto: 'O nome é obrigatório'})
    }

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null){
        erro.push({texto: 'O email é obrigatório'})
    }

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null){
        erro.push({texto: 'A senha é obrigatória'})
    }

    if(req.body.senha.length < 5){
        erro.push({texto: 'Senha muito curta'})
    }

    if(req.body.senha != req.body.confirmarSenha){
        erro.push({texto: 'A senha não conferem'})
    }

    if(erro.length > 0){

        res.render('usuario/registro', {erro: erro})

    }else{

        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash('error_msg', 'Já existe um usuário com esse e-mail em nosso sistema, tente outro email')
                res.redirect('/usuarios/registro')
            }else {

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {

                        if(erro){
                            req.flash('error_msg', 'Houve um erro ao cadastra o usuário, tente novamente')
                            res.redirect('/usuarios/registro')
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário registrado com sucesso!')
                            res.redirect('/usuarios/registro')
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao salvar o usuário')
                            res.redirect('/usuarios/registro')
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno!')
            res.redirect('/usuarios/registro')
        })
    }
})

router.get('/login', (req, res) => {
    res.render('usuario/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success_msg', 'Deslogado com sucesso')
    res.redirect('/')
})

module.exports = router