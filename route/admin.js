//Configurando as rotas
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');

const {eAdmin} = require('../helpers/helpers')

//Definindo as rotas
router.get('/', (req, res) => {
    // console.log('O que tem no user', user)
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {

        res.render('admin/index', {postagens: postagens});

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar as postagens!')
        res.redirect('/')
    })
})

//Postagem pelo slug
router.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if(postagem){
            res.render('postagem/post', {postagem: postagem})
        }else{
            req.flash('error_msg', 'Esta postagem não exite!')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno!')
        res.redirect('/')
    })
})

//Listando as postagens
router.get('/postagens', (req, res) => {
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar as postagens!')
        res.redirect('/')
    })
})

//Chamada do formulario de postagens
router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().then((categoria) => {
        res.render('admin/addpostagens', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao buscar categorias!')
        res.redirect('/')
    })
})

//Criando uma postagem
router.post('/postagens/nova', eAdmin, (req, res) => {
    const erros = [];

    if(req.body.categoria === '0'){
        erros.push({texto: 'Categoria invalida, adicione uma categoria a postagem!'})
    }

    if(erros.length > 0){
        res.render('admin/addpostagens', {erros: erros})
    }else{

        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao criar a postagem!')
            res,redirect('/postagens/add')
        })
    }
})

//Editando uma postagem
router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).then((postagem) => {

        Categoria.findOne({_id: postagem.categoria._id}).then((categoria) => {
            res.render('admin/addpostagens', {postagem: postagem, categoria: categoria})
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao carregar a categoria')
            res.redirect('/postagens')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar a postagem')
    })
})

//Salvando a edição da postagem
router.post('/postagens/edit', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Edição da postagem realizada com sucesso!')
            res.redirect('/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao salvar a edição da postagem')
            res.redirect('/postagens')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao editar a postagem')
        res.redirect('/postagens')
    })
})

//Deletando uma postagem
router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagens deletada com sucesso!')
        res.redirect('/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao deletar a postagem!')
        res.redirect('/postagens')
    })
})

//Listando as categoria do banco de dado
router.get('/categorias', (req, res) => {
    Categoria.find().sort({data: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar categorias!')
        res.redirect('/')
    })
})

//Mostrando o formulario da categoria
router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

//Criando uma nova categoria
router.post('/categorias/nova', eAdmin, (req, res) => {

    let erros = [];

    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null){
        erros.push({texto: 'O nome é obrigatório'});
    }

    if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null){
        erros.push({texto: 'Informe um slug para categoria'});
    }

    if(req.body.nome.length < 3){
        erros.push({texto: 'O nome dever conter mais de 3 caracter!'})
    }

    if(erros.length > 0) {
        res.render('admin/addcategorias', {erros: erros});
        return;
    }else {

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {  
            req.flash('success_msg', 'Categoria criada com sucesso!');          
            res.redirect('/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao criar categoria!');
            res.redirect('/');
        })
    }
   
})

//Recuperando uma categoria pelo id para a edição
router.get('/categorias/edit/:id', eAdmin, (req, res) =>{
    let id = req.params.id;
    Categoria.findOne({_id: id}).then((categoria) =>{
        res.render('admin/addcategorias', {categoria: categoria})
    }).catch((err) =>{
        req.flash('error_msg', 'Categoria inexistente!')
        res.redirect('/categorias')
    })
})

//Editando a categoria
router.post('/categorias/edit', eAdmin, (req, res) =>{
    Categoria.findOne({_id: req.body.id}).then((categoria) =>{

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() =>{
            req.flash('success_msg', 'Categoria editada com sucesso!')
            res.redirect('/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao salva a edição da categoria')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao editar categoria!')
        res.redirect('/categorias')
    })
})

//Deletando uma categoria
router.post('/categorias/delete', eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria removida com sucesso!')
        res.redirect('/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao deletar a categoria!')
        res.redirect('/categorias')
    })
})

//Exportando o modulo de rotas
module.exports = router;