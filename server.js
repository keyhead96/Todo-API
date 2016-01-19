var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bCrypt = require('bcryptjs');


var app = express();
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());




var PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.send('Todo API Root');
});





app.get('/todos', function (req, res) {
    var query = req.query;
    var where = {};

    if (query.hasOwnProperty('completed') && query.completed == 'false') {
        where.completed = false;
    } else if (query.hasOwnProperty('completed') && query.completed == 'true') {
        where.completed = true;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({
        where: where
    }).then(function (todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).send();
    })
});


app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    db.todo.findById(todoId).then(function (todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function (e) {
        res.status(500).send();
    });


});


app.delete('/todos/:id', function (req, res) {

    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: "No Todo with specified ID"
            });
        } else {
            res.status(204).send();
        }
    }, function (e) {
        res.status(500).send();
    });

});


app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    var body = _.pick(req.body, "description", "completed");
    var Attributes = {};


    if (body.hasOwnProperty('completed')) {
        Attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        Attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            todo.update(Attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);
            });

        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    })

});





app.post('/todos', function (req, res) {
    var body = _.pick(req.body, "description", "completed");

    db.todo.create(body).then(function (todo) {
        res.json(todo.toJSON());
    }, function (e) {
        res.status(400).json(e);
    });
});


app.post('/users', function(req, res){
   var body = _.pick(req.body, 'email', 'password');
    
    db.user.create(body).then(function(user){
        res.json(user.toPublicJSON());
    }, function(e){
       res.status(400).json(e); 
    });
});



app.post('/users/login', function(req, res){
    var loginDetails = _.pick(req.body, 'email', 'password');
    
    db.user.authenticate(loginDetails).then(function(user){
        res.json(user.toPublicJSON());
    }, function(e){
        res.status(401).send();
    });
});



db.sequelize.sync({force: true}).then(function () {
    app.listen(PORT, function () {
        console.log("Server Started. PORT: " + PORT);
    });
});