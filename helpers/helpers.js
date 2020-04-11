module.exports = {

    eAdmin: function(req, res, next) {
        if(req.isAuthenticated()){
            return next()
        }

        req.flash('error_msg', 'Você precisa esta logado para entrar aqui!')
        res.redirect('/usuarios/login')
    }

}