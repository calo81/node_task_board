var socketio = require('socket.io')
    , fs = require('fs')
    , path = require('path')
    , currentSprint = {};


var mongoManager = require('./mongo_manager');

function update_stored_card(card, mySprint) {

    mongoManager.findSprint(mySprint, function (sprint) {
        if (sprint != null) {
            var newCard = true;
            sprint.tasks.forEach(function (task) {
                if (card.id == task.id) {
                    newCard = false;
                    mongoManager.updateCard(card, mySprint);
                }
            });
            if (newCard) {
                mongoManager.insertCard(card, mySprint);
            }
        }
    });
}

function delete_stored_card(id, mySprint) {
    mongoManager.findSprint(mySprint, function (sprint) {
        if (sprint != null) {
            mongoManager.deleteCard(id, mySprint);
        }
    });
}


exports.listen = function (server) {
    var io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {

        socket.on('join', function (company_and_sprint) {
            console.log("A new client joining " + company_and_sprint);
            socket.leave(currentSprint[socket.id]);
            currentSprint[socket.id] = undefined;
            var sprintJoined = undefined;
            mongoManager.findSprint(company_and_sprint, function (sprint) {
                if (sprint != null) {
                    sprintJoined = sprint;
                } else {
                    var splittedCompanyAndSprint = company_and_sprint.split("/");
                    sprintJoined = {
                        "company": splittedCompanyAndSprint[0],
                        "name": splittedCompanyAndSprint[1],
                        "tasks": []
                    }
                    mongoManager.insertNewSprint(sprintJoined);
                }
                currentSprint[socket.id] = company_and_sprint;
                socket.join(currentSprint[socket.id]);
                socket.emit("sprintJoined", sprintJoined);
            });


            mongoManager.stored_boards().sprints.forEach(function (sprint) {
                if (company_and_sprint == sprint.company + "/" + sprint.name) {
                    sprintJoined = sprint;
                }
            });

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