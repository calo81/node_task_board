var socketio = require('socket.io')
    , fs = require('fs')
    , path = require('path')
    , currentSprint = {};

var stored_boards = {"sprints": [
    {
        "company": "cacique",
        "name": "sprint1",
        "tasks": [
            {
                "id": 1,
                "name": "fix everything",
                "description": "cause everything is broken",
                "time_booked": 8,
                "time_worked": 5,
                "position": {
                    "top": 60,
                    "left": 10
                }
            },

            {
                "id": 2,
                "name": "task 2",
                "description": "another task",
                "time_booked": 8,
                "time_worked": 5,
                "position": {
                    "top": 90,
                    "left": 40
                }
            }
        ]
    }
 ]
}

function update_stored_card(card, my_sprint) {
    stored_boards.sprints.forEach(function (sprint) {
        if (my_sprint == sprint.company + "/" + sprint.name) {
            var newCard = true;
            sprint.tasks.forEach(function (task) {
                if (card.id == task.id) {
                    newCard = false;
                    task.position = card.position;
                    task.name = card.name;
                    task.description = card.description;
                }
            });
            if (newCard) {
                sprint.tasks.push(card);
            }
        }
    });
}


exports.listen = function (server) {
    var io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {

        socket.on('join', function (company_and_sprint) {
            console.log("A new client joining " + company_and_sprint);
            socket.leave(currentSprint[socket.id])
            currentSprint[socket.id] = undefined;
            var sprintJoined = undefined;
            stored_boards.sprints.forEach(function (sprint) {
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
                stored_boards.sprints.push(sprintJoined);
            }
            currentSprint[socket.id] = company_and_sprint;
            socket.join(currentSprint[socket.id]);
            socket.emit("sprintJoined", sprintJoined);
        });

        socket.on('card', function (card) {
            update_stored_card(card, currentSprint[socket.id]);
            console.log("Update to " + currentSprint[socket.id]);
            socket.broadcast.to(currentSprint[socket.id]).emit('card', card);
        });

    });
};