var app = angular.module('app', []);

app.controller('GameController', function($scope) {
    var socket = io();
    var currentNumber;
    var whoIsWaiting;

    $scope.mode = 1; // default playing mode is human with human
    $scope.isGameStarted = false;

    /**
     * Start game by mode
     * @param $mode = 1 => human with human
     *        $mode = 2 => computer with computer
     *        $mode = 3 => human with computer
     */
    $scope.startGame = function($mode) {

        // Generate a random number between 3 and 2147483647:
        var min = 10, max = 300;
        var startingNumber = Math.floor((Math.random() * max) + min);

        $scope.mode = $mode;
        $scope.isGameStarted = true;
        $('#startingNumber').text(startingNumber);
        $('#currentNumber').text(startingNumber);

        socket.emit('chat message', startingNumber, "P1");

        // player 1 starts game then player 1 wait for player 2
        $('#waitingPlayerName').val("P1");
        $('#restartGame').hide();
        $('#gameResult').html('');
        console.log('You have recently sent the number ' + startingNumber);

        if ($mode == 2) { // computer with computer

            computerWithComputer(startingNumber);

        } else if ($mode == 3) { // human with computer

        }

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

    /**
     * Computer play auto with computer
     * @param startingNumber
     */
    function computerWithComputer(startingNumber)
    {
        let currentNumber = startingNumber;

        whoIsWaiting = $('#waitingPlayerName').val();
        // if P1 is waiting then P2 is playing
        playing = (whoIsWaiting == "P1") ? "P2" : "P1";

        currentNumber = parseInt($('#currentNumber').text());

        do {
            currentNumber = smartDivisionByThree(currentNumber);
            socket.emit('chat message', currentNumber, playing);

        } while (currentNumber != 1);
    }

    /**
     * Automatically -1, +0, +1 to number to divisible by 3
     * @param number
     * @returns integer
     */
    function smartDivisionByThree(number)
    {
        if (number % 3 == 0) {
            return number / 3;
        } else if ((number + 1) % 3 == 0) {
            return ((number + 1) / 3);
        } else if ((number + 1) % 3 == 0) {
            return (number - 1) / 3 == 0
        }
    }

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
            $('.isGameStarted').hide();
            $('#whoIsWaiting').html(player + ' is now waiting for you');

            $('.playBtn').prop('disabled', false);
        }

    });

});