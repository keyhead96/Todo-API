var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');



var app = express();
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());




var PORT = process.env.PORT || 3000;

app.get('/', function(req, res){
   res.send('Todo API Root'); 
});


app.get('/todos', function(req, res){
   res.json(todos); 
});

app.get('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    
    if(matchedTodo){
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
    
    res.json('Asking for todo with ID of: ' + req.params.id);
});


app.delete('/todos/:id', function(req, res){
   
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    
    if(matchedTodo){
         todos = _.without(todos, matchedTodo);
    } else {
        res.status(404).send();
    }
    
    res.json(matchedTodo);
    
    
});


app.post('/todos', function(req, res){
    var body = _.pick(req.body,"description", "completed");
    
    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0)     {
        return res.status(400).send("No Todo Found!");
    }
    
    
    body.description = body.description.trim();
    
    
    body.id = todoNextId++;
    
    todos.push(body);
    
    console.log('description: ' + body.description);
    
    res.json(body);
});




app.listen(PORT, function(){
   console.log("Server Started. PORT: " + PORT); 
});