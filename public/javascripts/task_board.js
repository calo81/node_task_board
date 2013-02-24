var Card = function (config) {
    this.position = config.position
    this.html = "<p id='" + config.id + "'class='sticky taped' style='width: 150px;'>" +
        "<strong>" + config.name + "</strong>.<br />" +
        config.description + "<br />" +
        "</p>";


    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.position = config.position;


    this.updatePosition = function (position) {
        console.log(position);
        if (position == undefined){
            position = this.position;
        }
        this.position = position
        $("#"+this.id).offset(this.position);
        return this;
    };

};

var TaskBoard = function (socket) {
    this.socket = socket;
};

TaskBoard.prototype.cardMoved = function (card) {
    var clonedCard = JSON.parse(JSON.stringify(card));
    clonedCard.position = absolutePosition(card.position);
    this.socket.emit('card', clonedCard);
};

var cards = {};