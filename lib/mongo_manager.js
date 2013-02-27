var MongoManager = function () {
    var MongoClient = require('mongodb').MongoClient;
    var MONGO_CONNECTION = "mongodb://176.58.109.95:27017/node-task-board";
    var mongoDb = undefined;

    var stored_boards = {sprints: []};

    this.stored_boards = function(){
       return stored_boards;
    };

    this.mongoDb = function(){
      return mongoDb;
    };

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

        db.collection('sprints').find().toArray(function (err, items) {
            stored_boards.sprints = items;
        });

        mongoDb = db;
    });
};

MongoManager.prototype = {
    updateCard: function updateCard(card, mySprint) {
        var collection = this.mongoDb().collection('sprints');
        var companySprint = mySprint.split("/");
        collection.update({"name": companySprint[1], "company": companySprint[0], "tasks.id": card.id}, {$set: {"tasks.$.position.top": card.position.top, "tasks.$.position.left": card.position.left}}, {w: 1}, function (err, result) {
            if (err) {
                return console.dir(err);
            }
        });
    },

    insertCard: function insertCard(card, mySprint) {
        var collection = this.mongoDb().collection('sprints');
        var companySprint = mySprint.split("/");
        collection.update({"name": companySprint[1], "company": companySprint[0]}, {$push: {tasks: card}}, {w: 1}, function (err, result) {
            if (err) {
                return console.dir(err);
            }
        });
    },

    deleteCard: function deleteCard(id, mySprint) {
        var companySprint = mySprint.split("/");
        this.mongoDb().collection('sprints').remove({"name": companySprint[1], "company": companySprint[0], "tasks.id": id}, function (err, result) {
            if (err) {
                return console.dir(err);
            }
        });
    },

    insertNewSprint: function insertNewSprint(sprint) {
        this.mongoDb().collection('sprints').insert(sprint, {w: 1}, function (err, result) {
            if (err) {
                return console.dir(err);
            }
        });
    }
};

module.exports = new MongoManager();