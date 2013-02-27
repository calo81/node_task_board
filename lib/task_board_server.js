var socketio = require('socket.io')
    , fs = require('fs')
    , path = require('path')
    , currentSprint = {};


var mongoManager = require('./mongo_manager');

function update_stored_card(card, my_sprint) {
    mongoManager.stored_boards().sprints.forEach(function (sprint) {
        if (my_sprint == sprint.company + "/" + sprint.name) {
            var newCard = true;
            sprint.tasks.forEach(function (task) {
                if (card.id == task.id) {
                    newCard = false;
                    task.position = card.position;
                    task.name = card.name;
                    task.description = card.description;
                    mongoManager.updateCard(card, my_sprint);
                }
            });
            if (newCard) {
                sprint.tasks.push(card);
                mongoManager.insertCard(card, my_sprint);
            }
        }
    });
}

function delete_stored_card(id, mySprint) {
    mongoManager.stored_boards().sprints.forEach(function (sprint) {
        if (mySprint == sprint.company + "/" + sprint.name) {
            for (var i = 0; i < sprint.tasks.length; i++) {
                if (id == sprint.tasks[i].id) {
                    sprint.tasks.splice(i, 1);
                }
            }
        }
    });
    mongoManager.deleteCard(id, mySprint);
}


exports.listen = function (server) {
    var io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {

        socket.on('join', function (company_and_sprint) {
            console.log("A new client joining " + company_and_sprint);
            console.log("board " + JSON.stringify(mongoManager.stored_boards()));
            socket.leave(currentSprint[socket.id])
            currentSprint[socket.id] = undefined;
            var sprintJoined = undefined;
            mongoManager.stored_boards().sprints.forEach(function (sprint) {
                if (company_and_sprint == sprint.company + "/" + sprint.name) {
                    sprintJoined = sprint;
                }
            });
            if (sprintJoined == undefined) {
                var splittedCompanyAndSprint = company_and_sprint.split("/");
                sprintJoined = {
                    "company": splittedCompanyAndSprint[0],
                    "name": splittedCompanyAndSprint[1],
                    "tasks": []
                }
                mongoManager.stored_boards().sprints.push(sprintJoined);
                mongoManager.insertNewSprint(sprintJoined);
            }
            currentSprint[socket.id] = company_and_sprint;
            socket.join(currentSprint[socket.id]);
            socket.emit("sprintJoined", sprintJoined);
        });

        socket.on('card', function (card) {
            update_stored_card(card, currentSprint[socket.id]);
            socket.broadcast.to(currentSprint[socket.id]).emit('card', card);
        });

        socket.on('deleteCard', function (id) {
            delete_stored_card(id, currentSprint[socket.id]);
            socket.broadcast.to(currentSprint[socket.id]).emit('cardDeleted', id);
        });

    });
};