var express = require('express');
var app = express();
var todos = [{
    id: 1,
    description: 'Go Home',
    completed: false
}, {
    id: 2,
    description: 'Play Xbox',
    completed: false
}, {
    id:3,
    description: 'Eat Dinner',
    completed: true
}];




var PORT = process.env.PORT || 3000;

app.get('/', function(req, res){
   res.send('Todo API Root'); 
});


app.get('/todos', function(req, res){
   res.json(todos); 
});

app.get('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id);
    var matchedTodo;
    
    todos.forEach(function(todo){
        if(todoId === todo.id){
            matchedTodo = todo;
        }
    });
    
    if(matchedTodo){
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
    
    res.json('Asking for todo with ID of: ' + req.params.id);
});


app.listen(PORT, function(){
   console.log("Server Started. PORT: " + PORT); 
});