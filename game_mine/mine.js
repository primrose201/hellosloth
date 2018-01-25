/* Universal Method */
Array.prototype.contain = function(val) {
    for (var i = 0; i < this.length; ++i)
        if (this[i] === val) return true;
    return false;
};

/* global variables */
var minedLand = 0;
var i, j, MAP = [], $tr;
var $game = $('#game'),
    $icoStatus = $('#ico_status'),
    $cntClick = $('#cnt_click'),
    $cntMine = $('#cnt_mine');

/* option */
var option = {
    row: 9,
    col: 9,
    mineCount: 1
};

/* initialize */
var initialize = function() {

    var $row;

    /* reset */
    $game.find('tr').remove();
    minedLand = 0;
    var mine = [];

    /* process */
    createMine();

    setGameMap();

    plantMine();

    calcMine();

    createView();


    /* check mine & map */
    console.log(mine);
    console.log(MAP);


    /* get query to create area */
    function getQuery(m, v) {
        v = (v === -1 || v === 0) ? '' : v;
        if (m) return '<td><a href="#" class="area mine"><span class="land out-shadow"></span><span class="danger">' + v + '</span></a></td>';
        else return '<td><a href="#" class="area"><span class="land out-shadow"></span><span class="danger">' + v + '</span></a></td>';
    }


    /* create mines */
    function createMine() {
        if (mine.length >= option.mineCount) return 0;
        var p = Math.ceil(Math.random() * option.row * option.col);
        if(!mine.contain(p)) mine.push(p);
        createMine();
    }


    /* set a game map */
    function setGameMap() {
        var row, stat;
        MAP = new Array(option.row);

        for (i = 0; i < option.row; ++i) {

            row = new Array(option.col);
            for (j = 0; j < option.col; ++j) {
                stat = new Object({ m: false, n: 0, checked:false });
                row[j] = stat;
            }
            MAP[i] = row;
        }

    }


    /* plant mines */
    function plantMine() {
        mine.forEach(function(v) {
            var row = Math.floor(v / option.row);
            var col = v - 1 - row * option.row;
            // last index
            if (col === -1) {
                row--;
                col = option.col - 1;
            }
            MAP[row][col]['m'] = true;
        });
    }


    /* calculate mine num */
    function calcMine() {

        // check around
        function checkAround(row, col) {
            var isMine = MAP[row][col]['m'];
            if (isMine) {return -1}
            else {
                var count = 0;
                var rowPrev = ((row - 1) === -1) ? 0 : row -1;
                var rowNext = ((row + 1) === option.row) ? option.row - 1 : row + 1;
                var colPrev = ((col - 1) === -1) ? 0 : col -1;
                var colNext = ((col + 1) === option.col) ? option.col - 1 : col + 1;

                for (i = rowPrev; i <= rowNext; ++i) {
                    for (j = colPrev; j <= colNext; ++j) {
                        if(MAP[i][j]['m']) count++;
                    }
                }
                return count;
            }
        }

        // loop
        MAP.forEach(function(r, row) {
            r.forEach(function(a, col) {
                var n = checkAround(row, col);
                MAP[row][col]['n'] = n;
            });
        })
    }


    /* create views */
    function createView() {
        for (i = 0; i < option.row; ++i) {
            $row = $('<tr>');
            for (j = 0; j < option.col; ++j) {
                $row.append($(getQuery(MAP[i][j]['m'], MAP[i][j]['n'])));
            }
            $game.append($row);
        }
    }

    /* view object */
    $tr = $game.find('tr');

    /* click area */
    $('.area').on({
        click: e_clickArea,
        mousedown: e_rClickArea
    });

}; initialize();

/* VIEW */
/* if lose */
function setLoseView() {
    $icoStatus.addClass('ico_bad');
    $('.land').remove();
}

/* if win */
function setWinView() {
    alert('hello');
}

/* count up a cnt of clicks */
function countUpClick() {
    var cnt = Number($cntClick.html()) + 1;
    cnt = String(cnt);

    while (cnt.length < 3) {
        cnt = '0' + cnt;
    }
    $cntClick.html(cnt);
}

/* remove view */
function removeLand(row, col) {

    // count down a cnt of mined lands
    function countDownMine() {
        var cnt = Number($cntMine.html()) - 1;
        cnt = String(cnt);

        while (cnt.length < 3) {
            cnt = '0' + cnt;
        }
        $cntMine.html(cnt);
    }

    countDownMine();
    MAP[row][col]['checked'] = true;
    var query = 'tr:nth-child(' + (row + 1) + ') td:nth-child(' + (col + 1) + ') .land';
    $game.find(query).remove();
}
/* //VIEW */

/* EVENT * /
/* left click area */
function e_clickArea(e) {
    e.preventDefault();

    var $that = $(this);

    // find x-axis, y-axis
    var $myTr = $that.closest('tr'), $myTd = $that.closest('td'),
        row = $tr.index($myTr), col = $myTr.find('td').index($myTd);

    // count up
    if (!MAP[row][col]['checked']) countUpClick();


    // check and remove
    if ($that.hasClass('mine')){
        setLoseView();
    } else if (MAP[row][col]['n'] > 0) {
        removeLand(row, col);
    } else {
        checkAndRemove(row, col)
    }

    // win
    if ($cntMine.html() + option.mineCount === option.row * option.col) setWinView();
}

/* right click area */
function e_rClickArea(e) {
    e.preventDefault();

    if (e.button === 2 || e.which === 3) {
        $(this).find('.land').toggleClass('flag');
    }
}
/* //EVENT */

/* check and remove algorithm */
function checkAndRemove(row, col) {

    var checkList = [{r: row, c: col}];
    check();

    // check
    function check() {

        var pos = checkList.pop();
        checkAround(pos.r, pos.c);

        if (checkList.length === 0) return 0;
        else check();

        function checkAround(row, col) {
            var rowPrev = ((row - 1) === -1) ? 0 : row -1;
            var rowNext = ((row + 1) === option.row) ? option.row - 1 : row + 1;
            var colPrev = ((col - 1) === -1) ? 0 : col -1;
            var colNext = ((col + 1) === option.col) ? option.col - 1 : col + 1;

            for (i = rowPrev; i <= rowNext; ++i) {
                for (j = colPrev; j <= colNext; ++j) {
                    if(!MAP[i][j]['checked'] && MAP[i][j]['n'] === 0) {
                        checkList.push({r: i, c: j});
                        removeLand(i, j);
                    } else if (!MAP[i][j]['checked'] && MAP[i][j]['n'] > 0) {
                        removeLand(i, j);
                    }
                }
            }
        }
    }
}