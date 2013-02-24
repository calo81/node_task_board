var socketio = require('socket.io')
    , fs = require('fs')
    , path = require('path')
    , currentSprint = {};

var  stored_boards = require('../sprints/sprints');

function update_stored_card(card,my_sprint) {
    stored_boards.sprints.forEach(function(sprint){
        if(my_sprint == sprint.company+"/"+sprint.name){
          sprint.tasks.forEach(function(task){
             if(card.id == task.id){
                 task.position = card.position;
                 task.name = card.name;
                 task.description = card.description;
             }
          });
        }
    });
    console.log(JSON.stringify(stored_boards));
}


exports.listen = function (server) {
    var io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {

        socket.on('join', function(company_and_sprint){
           console.log("A new client joining " + JSON.stringify(stored_boards));
           socket.leave(currentSprint[socket.id])
           stored_boards.sprints.forEach(function(sprint){
              if(company_and_sprint == sprint.company+"/"+sprint.name){
                  currentSprint[socket.id] = sprint.company+"/"+sprint.name
                  socket.join(currentSprint[socket.id]);
                  socket.emit("sprintJoined",sprint);
              }
            });
        });

        socket.on('card', function (card) {
            update_stored_card(card,currentSprint[socket.id]);
            socket.broadcast.emit('card', card);
        });

    });
};