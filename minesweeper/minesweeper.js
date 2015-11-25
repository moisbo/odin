var settings = {
    size: 10,
    bombs: 10,
    setDefaults: function(){
        $( "#size" ).val(settings.size);
        $( "#bombs" ).val(settings.bombs);
    }
};
//minesweeper
var msp = {
    render: function(){
        //Draw a board
        var board = $('.gameboard');
        board.html('');
        for(var i = 0; i < parseInt(settings.size); i++){
            board.append(msp.renderCells(i, settings.size));
        }
        msp.addBoardClicks();
        msp.clearTimer();
        msp.timer();
    },
    renderCells: function(i, size){
        var row = $('<tr>').attr('class','row').attr('row', i);
        for(var j = 0; j < size; j++){
            row.append($('<td>')
                .attr('class','cell')
                .attr('i',i)
                .attr('j',j));
        }
        return row;
    },
    prettyRenderCell: function(cell){
        if(cell.bomb === 'B'){
            return 'B';
        }else {
            if (cell.state != 0){
                return cell.state;
            }
        }
    },
    addClickHandlers: function(){
        $( "#reset" ).bind( "click", function() {
            settings.size = 10;
            settings.bombs = 10;
            settings.setDefaults();
            msp.lost = false;
            $('.alert').text('');
            msp.board(settings.size, settings.bombs, function (){
                msp.render();
            });
        });
        $( "#restart" ).bind( "click", function() {
            settings.size = parseInt($( "#size" ).val());
            settings.bombs = parseInt($( "#bombs" ).val());
            msp.lost = false;
            $('.alert').text('');
            msp.board(settings.size, settings.bombs, function (){
                msp.render();
            });
        });
    },
    addBoardClicks: function(){
        $( ".cell" ).bind( "click", function() {
            var i = $(this).attr('i');
            var j = $(this).attr('j');
            msp.discover(i, j);
        });
    },
    genBA: function(rows){
        var arr = [];
        for (var i = 0; i < rows; i++) {
            arr[i] = [];
            for(var j = 0; j < rows; j++) {
                arr[i][j] = {
                    bomb:null, state:null, status: null
                }
            }
        }
        return arr;
    },
    bA: {},
    board: function(size, numberOfBombs, cb){
        //A board is defined by the sizeXsize array, and number of bombs
        var initBoard = [];
        for(var i = 0; i < size * size; i++){
            numberOfBombs--;
            if(numberOfBombs >= 0){
                initBoard[i] = 'B';
            }else{
                initBoard[i] = '';
            }
        }
        initBoard = msp.randomizeBoard(initBoard);
        msp.bA = msp.genBA(size);
        i = 0;
        for(var j = 0; j < size; j++){
            for(var k = 0; k < size; k++){
                msp.bA[j][k].bomb = initBoard[i];
                i++;
            }
        }
        for(j = 0; j < size; j++){
            for(k = 0; k < size; k++){
                msp.bA[j][k].state = msp.state(j, k);
            }
        }
        cb();
    },
    randomizeBoard: function(array){
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    },
    state: function(i, j){
        i = parseInt(i);
        j = parseInt(j);
        var s = 0;
        for(var k = -1; k <= 1; k++) {
            for (var l = -1; l <= 1; l++) {
                s += msp.cA(i + k, j + l);
            }
        }
        return s;
    },
    cA: function(i, j){
        try{
            if(msp.bA[i][j].bomb === 'B') {
                return 1;
            }else{
                return 0;
            }
        }catch(e){
            return 0;
        }
    },
    sum: function(obj) {
    var sum = 0;
    for( var el in obj ) {
        if( obj.hasOwnProperty( el ) ) {
            sum += parseInt(obj[el]);
        }
    }
    return sum;
    },
    discover: function(i, j){
        if(msp.bA[i][j] != undefined){
            if (msp.bA[i][j].state === 0) {
                msp.bA[i][j].status = 'e';
                msp.clearCell(i, j, msp.bA[i][j].state);
                msp.findAdjacent(i, j);
            }
            if (msp.bA[i][j].bomb === 'B') {
                msp.lost = true;
                msp.showBombs('Red', function(){
                    msp.clearTimer();
                    $('.alert').text('BOMB!');
                    return;
                });
            }
            if (msp.bA[i][j].state != 'B') {
                msp.bA[i][j].status = 'n';
                msp.clearCell(i, j, msp.bA[i][j].state);
            }
            msp.win();
        }
    },
    findAdjacent: function(i, j){
        for (var k = -1; k <= 1; k++) {
            for (var l = -1; l <= 1; l++) {
                var a = parseInt(i) + parseInt(k);
                var b = parseInt(j) + parseInt(l);
                if(msp.bA[a] != undefined && msp.bA[a][b] != undefined) {
                    if (!msp.bA[a][b].status) {
                        msp.discover(a, b);
                    }
                }
            }
        }
    },
    clearCell: function (i, j, cellValue) {
        if(cellValue >= 3 && cellValue <= 10)
            cellValue = 3;
        cellValue = 'c' + cellValue;
        $('td[i='+i+'][j='+j+']')
            .addClass('empty '+ cellValue)
            .text(msp.prettyRenderCell(msp.bA[i][j]));
    },
    showBombs: function(color, cb){
        for(var j = 0; j < settings.size; j++) {
            for (var k = 0; k < settings.size; k++) {
                if (msp.bA[j][k].bomb) {
                    msp.clearCell(j, k, color);
                }
            }
        }
        cb();
    },
    win: function(){
        if(!msp.lost) {
            var total = settings.size * settings.size - settings.bombs;
            var states = 0;
            for (var j = 0; j < settings.size; j++) {
                for (var k = 0; k < settings.size; k++) {
                    if (msp.bA[j][k].status) {
                        states++;
                    }
                }
            }
            if (total === states) {
                msp.showBombs('Green', function () {
                    msp.clearTimer();
                    $('.alert').text('You won in ' + msp.time + ' Seconds!');
                });
            }
        }
    },
    lost: false,
    start:  new Date,
    interval: null,
    time: 0,
    timer: function(){
        msp.interval = setInterval(function() {
            msp.time = Math.round((new Date - msp.start) / 1000);
            $('.timer').text(msp.time + " Seconds");
        }, 1000);
    },
    clearTimer: function(){
        msp.start = new Date;
        clearInterval(msp.interval);
    },
    redraw: function(){
        for(var j = 0; j < settings.size; j++){
            for(var k = 0; k < settings.size; k++){
                if(msp.bA[j][k].status){
                    msp.clearCell(j, k)
                }
            }
        }
    }
};

$(document).ready(function(){
    settings.setDefaults();
    msp.addClickHandlers();
    msp.board(settings.size, settings.bombs, function(){
        msp.render();
    });
});