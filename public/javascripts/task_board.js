var Card = function (config) {

    var me = this;
    this.position = config.position;
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;


    this.updatePosition = function (position) {
        console.log(position);
        if (position == undefined) {
            position = this.position;
        }
        this.position = position;
        $("#" + this.id).offset(this.position);
        return this;
    };

    this.renderIn = function (element) {
        element.append(this.html());
    }

    this.makeDraggable = function () {
        $("#" + this.id).draggable({
            drag: function (event, ui) {
                taskBoard.cardMoved(me.updatePosition(ui.position));
            }
        });
    }

    this.html = function () {
        return "<p id='" + this.id + "'class='sticky taped' style='width: 150px; position: absolute;'>" +
            "<strong>" + this.name + "</strong>.<br />" +
            this.description + "<br />" +
            "</p>";
    };

    this.formHtml = function () {
        return "<div id='divForm" + this.id + "'>New Task: <input id='textForm" + this.id + "' type='text' name='title'/></div>";
    };

    this.renderFormIn = function (element) {
        if(mySprint == undefined) {
          alert("You have to select a Sprint");
            return;
        }

        element.append(this.formHtml());
        $("#textForm" + this.id).keypress(function (event) {
            if (event.which == 13) {
                var values = $("#textForm" + me.id).val().split("/");
                console.log(values[0]);
                me.name = values[0];
                me.description = values[1];
                $("#divForm" + me.id).remove();
                me.renderIn(element);
                me.makeDraggable();
                taskBoard.cardMoved(me);
            }
        });
    }

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