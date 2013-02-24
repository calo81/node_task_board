var socket = io.connect();
$(document).ready(function () {
    var taskBoard = new TaskBoard(socket);
    socket.on('card', function (result) {
        if (result.position !== undefined) {
            cards[result.id].updatePosition(relativizePosition(result.position));
        } else {
            console.log("Error result doesn' have position coordinates" + JSON.stringify(result));
        }
    });

    socket.on("sprintJoined", function (sprint) {
        sprint.tasks.forEach(function (task) {
            var card = new Card(task);
            $("#stories-column").append(card.html);
            card.updatePosition(relativizePosition(task.position));
            makeDraggable(card);
            cards[task.id] = card;
        });

    });

    function makeDraggable(card) {
        $("#" + card.id).draggable({
            drag: function (event, ui) {
                console.log("DRAGGED " + JSON.stringify(ui.position));
                taskBoard.cardMoved(card.updatePosition(ui.position));
            }
        });
    }

    $("#commander").keypress(function (event) {
        if (event.which == 13) {
            socket.emit("join", $("#commander").val());
        }
    });
});

var browserWidth = 0;
var browserHeight = 0;


function jqUpdateSize(){
    browserWidth = $(window).width();     // Display the width
    browserHeight = $(window).height();    // Display the height
    console.log(browserWidth + "x" + browserHeight);
}

function relativizePosition(position){
    return {
        top: position.top,
        left: position.left * browserWidth / 1905
    }
}

function absolutePosition(position){
    return {
        top: position.top,
        left: position.left * 1905 / browserWidth
    }
}

$(document).ready(jqUpdateSize);    // When the page first loads
$(window).resize(jqUpdateSize);