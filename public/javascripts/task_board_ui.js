var socket = io.connect();
$(document).ready(function () {
    var taskBoard = new TaskBoard(socket);
    socket.on('card', function (result) {
        if (result.position !== undefined) {
            card.updatePosition(result.position);
        } else {
            console.log("Error result doesn' have position coordinates" + JSON.stringify(result));
        }
    });

    $("#stories-column").append(card.html);
    $(".sticky").draggable({
        drag: function (event, ui) {
          taskBoard.cardMoved(card.updatePosition(ui.position));
        }
    });
});