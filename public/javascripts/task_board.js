var Card = function (config) {
    this.position = config.position
    this.html = "<p class='sticky taped2' style='width: 150px;'>" +
        "<strong>The Little Turtle</strong>.<br />" +
        "There was a little turtle.<br />" +
        "</p>";

    this.updatePosition = function (position) {
        this.position = position
        this.x = position.left;
        $(".sticky").offset(position);
        console.log("moving to: " + JSON.stringify(position));
        return this;
    }
};

var TaskBoard = function (socket) {
    this.socket = socket;
};

TaskBoard.prototype.cardMoved = function (card) {
    var message = {
        card: card
    };
    this.socket.emit('card', card);
};


var card = new Card({position: {top: 0, left: 0}});