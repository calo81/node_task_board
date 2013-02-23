var Card = function(config) {
  this.x = config.x;
  this.y = config.y;

    this.updatePosition = function(position){
      this.y = position.top;
      this.x = position.left;
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


var card = new Card({x: 0, y: 0});