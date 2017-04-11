var app = angular.module('app', []);

app.controller('GameController', function($scope) {
    var socket = io();
    var currentNumber;
    var whoIsWaiting;

    $scope.mode = 1; // default playing mode is human with human
    $scope.isGameStarted = false;

    /**
     * Start game
     */
    $scope.startGame = function() {

        // Generate a random number between 10 and 3000:
        var min = 10, max = 3000; // you can change value here as you want
        var startingNumber = Math.floor((Math.random() * max) + min);

        $scope.isGameStarted = true;
        $('#startingNumber').text(startingNumber);
        $('#currentNumber').text(startingNumber);

        socket.emit('chat message', startingNumber, "P1");

        // player 1 starts game then player 1 wait for player 2
        $('#waitingPlayerName').val("P1");
        $('#restartGame').hide();
        $('#gameResult').html('');
        console.log('You are game starter. You have recently sent the number ' + startingNumber);

    };

    /**
     * Restart the game by reload the page
     */
    $scope.restartGame = function() {
        location.reload();
    };

    /**
     * Adding one of {-1, 0, 1} to current number
     * @param number = [-1, 0, 1]
     */
    $scope.addNumber = function(number) {
        whoIsWaiting = $('#waitingPlayerName').val();
        // if P1 is waiting then P2 is playing
        playing = (whoIsWaiting == "P1") ? "P2" : "P1";

        currentNumber = parseInt($('#currentNumber').text());
        if ((currentNumber + number) % 3 != 0) {
            alert('The new number ' + (currentNumber + number) + ' can not be divisible by 3. Please choose another adding.');
        } else {
            currentNumber = currentNumber + number;
            currentNumber = currentNumber / 3;

            socket.emit('chat message', currentNumber, playing);
            $('#currentNumber').text(currentNumber);

            $('#whoIsWaiting').html('');
            $('.playBtn').prop('disabled', true);

            if (currentNumber == 1) {
                $('#restartGame').show();
                $('#gameResult').html('<span style="color:green">Congratulation! You are the winner!</span>');
            }
        }
    };

    /**
     * Handle on playing
     * @type {Number}
     */
    socket.on('chat message', (number, player, clientId) => {
        currentNumber = parseInt(number);

        //console.log(number + '/' + player + '/' + clientId);
        $('#currentNumber').text(currentNumber);

        if (currentNumber == 1) {
            $('#restartGame').show();
            $('#gameResult').html('<span style="color:red">Sorry! You are the loser!</span>');
        } else {
            $('#restartGame').hide();
            $('#gameResult').html('');

            $('#waitingPlayerName').val(player);
            $('.isGameStarted').hide();
            $('#whoIsWaiting').html(player + ' is now waiting for you');

            $('.playBtn').prop('disabled', false);
        }

    });

});
