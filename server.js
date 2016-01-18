var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


var app = express();
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());




var PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.send('Todo API Root');
});


app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'true') {
        filteredTodos = _.where(filteredTodos, {
            completed: true
        });
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'false') {
        filteredTodos = _.where(filteredTodos, {
            completed: false
        });
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function (todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }

    res.json(filteredTodos);
});



app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    db.todo.findById(todoId).then(function(todo){
        if(!!todo){
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function(e){
        res.status(500).send();
    });
    

});


app.delete('/todos/:id', function (req, res) {

    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {
        id: todoId
    });

    if (matchedTodo) {
        todos = _.without(todos, matchedTodo);
    } else {
        res.status(404).send();
    }

    res.json(matchedTodo);


});


app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {
        id: todoId
    });
    var body = _.pick(req.body, "description", "completed");
    var validAttributes = {};


    if (!matchedTodo) {
        return res.status(404).send();
    }


    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    } else {
        //Never Provided Attribute, No Problems
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    } else {
        //Never Provided, No Problems
    }

    _.extend(matchedTodo, validAttributes);

    res.json(matchedTodo);


});





app.post('/todos', function (req, res) {
    var body = _.pick(req.body, "description", "completed");
    
    db.todo.create(body).then(function(todo){
        res.json(todo.toJSON());
    }, function(e){
        res.status(400).json(e);
    });

    /*if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send("No Todo Found!");
    }


    body.description = body.description.trim();


    body.id = todoNextId++;

    todos.push(body);

    console.log('description: ' + body.description);

    res.json(body);*/
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log("Server Started. PORT: " + PORT);
    });
});