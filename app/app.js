var app = angular.module('app', []);

app.controller('GameController', function($scope) {
    var socket = io();
    var currentNumber;
    var whoIsWaiting;

    $scope.isGameStarted = false;
    $scope.iAmWaitingForOtherPlayer = false;

    $scope.startGame = function() {
        // Generate a random number between 3 and 2147483647:
        var startingNumber = Math.floor((Math.random() * 200) + 10);

        $('#startingNumber').text(startingNumber);
        $('#currentNumber').text(startingNumber);

        $scope.isGameStarted = true;
        //$scope.iAmWaitingForOtherPlayer = true;
        socket.emit('chat message', startingNumber, "P1");
        console.log('You have recently sent the number ' + startingNumber);

        // player 1 starts game then player 1 wait for player 2
        $('#waitingPlayerName').val("P1");
        $('#restartGame').hide();
        $('#gameResult').html('');
    };

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


    socket.on('chat message', (number, player, clientId) => {
        currentNumber = parseInt(number);

        console.log(number + '/' + player + '/' + clientId);
        $('#currentNumber').text(currentNumber);

        if (currentNumber == 1) {
            $('#restartGame').show();
            $('#gameResult').html('<span style="color:red">Sorry! You are the loser!</span>');
        } else {
            $('#restartGame').hide();
            $('#gameResult').html('');

            $('#waitingPlayerName').val(player);
            $('#isGameStarted').hide();
            $('#whoIsWaiting').html(player + ' is now waiting for you');

            $('.playBtn').prop('disabled', false);
        }

    });

});