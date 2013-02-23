var socket = io.connect();
$(document).ready(function () {
    var taskBoard = new TaskBoard(socket);
    socket.on('card', function (result) {
        var message;
        if (result.success) {
            message = 'You are now known as ' + result.name + '.';
        } else {
            message = result.message;
        }
    });

    $(".label").draggable({
        drag: function (event, ui) {
          taskBoard.cardMoved(card.updatePosition(ui.position));
        }
    });
});