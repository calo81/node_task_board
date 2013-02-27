var socketio = require('socket.io')
    , fs = require('fs')
    , path = require('path')
    , currentSprint = {};

var MongoClient = require('mongodb').MongoClient;
var MONGO_CONNECTION = "mongodb://176.58.109.95:27017/node-task-board";

MongoClient.connect(MONGO_CONNECTION, function (err, db) {
    var sprint1 = {
        "_id": 1,
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
    };
    var collection = db.collection('sprints');
    collection.insert(sprint1, {w: 1}, function (err, result) {
    });
});

var stored_boards = {sprints: []};

MongoClient.connect(MONGO_CONNECTION, function (err, db) {
    db.collection('sprints').find().toArray(function (err, items) {
        stored_boards.sprints = items;
    });
});


function updateCardInMongo(card, mySprint) {
    MongoClient.connect(MONGO_CONNECTION, function (err, db) {
        if (err) {
            return console.dir(err);
        }
        var collection = db.collection('sprints');
        var companySprint = mySprint.split("/");
        collection.update({"name": companySprint[1], "company": companySprint[0], "tasks.id": card.id}, {$set: {"tasks.$.position.top": card.position.top, "tasks.$.position.left": card.position.left}}, {w: 1}, function (err, result) {
            if (err) {
                return console.dir(err);
            }
        });
    });
}

function insertCardInMongo(card, mySprint) {
    MongoClient.connect(MONGO_CONNECTION, function (err, db) {
        var collection = db.collection('sprints');
        var companySprint = mySprint.split("/");
        collection.update({"name": companySprint[1], "company": companySprint[0]}, {$push: {tasks: card}}, {w: 1}, function (err, result) {
            if (err) {
                return console.dir(err);
            }
        });
    });
}

function deleteCardInMongo(id, mySprint) {
    MongoClient.connect(MONGO_CONNECTION, function (err, db) {
        var companySprint = mySprint.split("/");
        db.collection('sprints').remove({"name": companySprint[1], "company": companySprint[0], "tasks.id": id}, function (err, result) {
            if (err) {
                return console.dir(err);
            }
        });
    });
}

function insertNewSprintInMongo(sprint) {
    MongoClient.connect(MONGO_CONNECTION, function (err, db) {
        db.collection('sprints').insert(sprint, {w: 1}, function (err, result) {
            if (err) {
                return console.dir(err);
            }
        });
    });
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
                    updateCardInMongo(card, my_sprint);
                }
            });
            if (newCard) {
                sprint.tasks.push(card);
                insertCardInMongo(card, my_sprint);
            }
        }
    });
}

function delete_stored_card(id, my_sprint) {
    stored_boards.sprints.forEach(function (sprint) {
        if (my_sprint == sprint.company + "/" + sprint.name) {
            for (var i = 0; i < sprint.tasks.length; i++) {
                if (id == sprint.tasks[i].id) {
                    sprint.tasks.splice(i, 1);
                }
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
            console.log("board " + JSON.stringify(stored_boards));
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
                insertNewSprintInMongo(sprintJoined);
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
            deleteCardInMongo(id, currentSprint[socket.id]);
            socket.broadcast.to(currentSprint[socket.id]).emit('cardDeleted', id);
        });

    });
};