/* Universal Method */
// check array
Array.prototype.contain = function(val) {
    for (var i = 0; i < this.length; ++i)
        if (this[i] === val) return true;
    return false;
};

// get data in url
var getUrlData = function() {
    var data = {};
    var query = location.href;
    query = query.substring(query.indexOf('?') + 1,query.length).split(',');
    query.forEach(function(v, i, a) {
        var set = v.split('=');
        data[set[0]] = set[1];
    });

    return data;
};

/* global variables */
var minedLand = 0;
var i, j, MAP = [], $tr;
var $game = $('#game'),
    $inpMine = $('#inp_mine'),
    $icoStatus = $('#ico_status'),
    $cntClick = $('#cnt_click'),
    $cntMine = $('#cnt_mine');

/* default option */
var option = {
    row: 9,
    col: 9,
    mineCount: 12
};

/* setting data */
var envData = getUrlData();
if (envData.m) {
    option.mineCount = envData.m;
}

/* setting event */
$inpMine.on({
    'change': function(e) {
        var $that = $(this), val = $that.val();
        if (val >= option.row * option.col || val < 1) {
            $that.val(12);alert('지뢰 수가 너무 적거나 너무 많습니다.');
        }
    }
});

/* initialize */
var initialize = function() {

    var $row;

    /* reset */
    $game.find('tr').remove();
    $cntClick.html('000');
    $cntMine.html(makeDigit(option.row * option.col - option.mineCount));
    $inpMine.val(option.mineCount);
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
        var col = (v === -1 || v === 0) ? '' : 'col_' + v;
        if (m) return '<td><a href="#" class="area mine ' + col + '"><span class="land out-shadow"></span><span class="danger">' + v + '</span></a></td>';
        else return '<td><a href="#" class="area ' + col +'"><span class="land out-shadow"></span><span class="danger">' + v + '</span></a></td>';
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
    $('#layer_lose').fadeIn(1000);
}

/* if win */
function setWinView() {
    $('#layer_win').fadeIn(1000);
}

/* count up a cnt of clicks */
function countUpClick() {
    var cnt = Number($cntClick.html()) + 1;
    $cntClick.html(makeDigit(cnt));
}

/* remove view */
function removeLand(row, col) {

    // count down a cnt of mined lands
    function countDownMine() {
        var cnt = Number($cntMine.html()) - 1;
        $cntMine.html(makeDigit(cnt));
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
    if ($cntMine.html() === '000') setWinView();
}

/* right click area */
function e_rClickArea(e) {
    e.preventDefault();

    if (e.button === 2 || e.which === 3) {
        $(this).find('.land').toggleClass('flag');
    }
}
/* //EVENT */

/* make 3 digits num */
function makeDigit(n) {
    n = String(n);
    while (n.length < 3) {
        n = '0' + n;
    }
    return n;
}

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