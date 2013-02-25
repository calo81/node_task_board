var socket = io.connect();
var taskBoard = new TaskBoard(socket);
var mySprint = undefined;

$(document).ready(function () {
    socket.on('card', function (result) {
        if (result.position !== undefined) {
            cards[result.id].updatePosition(relativizePosition(result.position));
        } else {
            console.log("Error result doesn' have position coordinates" + JSON.stringify(result));
        }
    });

    socket.on("sprintJoined", function (sprint) {
        $(".sticky").remove();
        mySprint = sprint.company + " / " + sprint.name;
        sprint.tasks.forEach(function (task) {
            var card = new Card(task);
            card.renderIn($("#not-started-column"));
            card.updatePosition(relativizePosition(task.position));
            card.makeDraggable();
            cards[task.id] = card;
        });

    });


    $("#commander").keypress(function (event) {
        if (event.which == 13) {
            socket.emit("join", $("#commander").val());
        }
    });

    $("#not-started-column").dblclick(function(){
       var randomId=Math.floor(Math.random()*1000000000);
       var card = new Card({
           id: randomId,
           position: {top: 60, left: 10},
           name: "",
           description: ""
       });
       card.renderFormIn($("#not-started-column"));
    });
});

var browserWidth = 0;
var browserHeight = 0;


function jqUpdateSize(){
    var previousWidth = browserWidth;
    browserWidth = $(window).width();     // Display the width
    browserHeight = $(window).height();    // Display the height

    for(var index in cards) {
        cards[index].updatePosition(relativizePosition(cards[index].position, previousWidth));
    }
}

function relativizePosition(position, previousWidth, previousHeight){
    if(previousWidth == undefined){
        previousWidth = 1905
    }
    return {
        top: position.top,
        left: position.left * browserWidth / previousWidth
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