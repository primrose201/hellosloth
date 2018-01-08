function flicking($fcont, $flayers, $fbtns, flickingOption) {

    // constant
    const LEFT = -1;
    const RIGHT = 1;

    flickingOption = flickingOption? flickingOption : {
        width: 800,
        area: 80,
        count: 6,
        duration: 240,
        circular: false,
        arrow: false
    };

    var $fbtn = $fbtns.find('.flick-btn'),
        $fbtnPrev, $fbtnNext;


    // create dummy
    if (flickingOption.circular) {
        var $firstDummy = $fcont.find('.flick-layer:first-child').clone(),
            $lastDummy = $fcont.find('.flick-layer:last-child').clone();
        $flayers.append($firstDummy);
        $flayers.prepend($lastDummy);
    }


    // initialize variables
    var posFlickX = flickingOption.circular? -1 * flickingOption.width : 0,
        posDownX = 0,
        posDragX = 0,
        layerIndex = 1,
        dragFlag = false,
        limitLeft = 20,
        limitRight = -1 * flickingOption.width * (flickingOption.count - 1) - 20;
    $flayers[0].style.transform = 'translate3d(' + posFlickX + 'px,0,0)';

    // bind event
    var flickEvent = {
        mousedown: function(e) {
            dragFlag = true;
            posDownX = e.clientX;
            posDragX = e.clientX;
        },
        mousemove: function(e) {
            e.stopPropagation();
            if (dragFlag && flickingOption.circular) {
                followMouse(e);
            } else if (dragFlag && !flickingOption.circular && posFlickX < limitLeft && posFlickX > limitRight) {
                followMouse(e);
            }
        },
        mouseup: function(e) {
            e.stopPropagation();
            if (dragFlag) {
                moving(e);
                setIndexButton();
                dragFlag = false;
            }
        },
        clickBtnPrev: function(e) {
            if (flickingOption.circular || (!flickingOption.circular && layerIndex !== 1)) {
                posDragX = flickingOption.area + 10;
                posDownX = 0;
                moving();
                setIndexButton();
            }
        },
        clickBtnNext: function(e) {
            if (flickingOption.circular || (!flickingOption.circular && layerIndex !== flickingOption.count)) {
                posDragX = 0;
                posDownX = flickingOption.area + 10;
                moving();
                setIndexButton();
            }
        }
    };

    $fcont.on({
        'mousedown': flickEvent.mousedown,
        'mousemove': flickEvent.mousemove,
        'mouseup': flickEvent.mouseup
    });

    $(window).on({
        'mousemove': flickEvent.mousemove,
        'mouseup': flickEvent.mouseup
    });

    $flayers.mouseout(function(e) {e.stopPropagation();});


    // arrow option
    if (flickingOption.arrow) {
        $fbtnPrev = $fcont.find('.flick-btn-prev');
        $fbtnNext = $fcont.find('.flick-btn-next');

        $fbtnPrev.click(flickEvent.clickBtnPrev);
        $fbtnNext.click(flickEvent.clickBtnNext);
    }


    //** flicking algorithms
    // panel follow mouse
    function followMouse(e) {

        var d = e.clientX - posDragX;
        posFlickX += d;
        posDragX = e.clientX;

        $flayers[0].style.transform = 'translate3d(' + posFlickX + 'px,0,0)';
    }


    // moving animation
    function animate(posNow, posDest, ms, lastStatus) {
        var time = 0;
        var i, cssValue;
        var unit = 16,
            section = ms / unit,
            distance = posDest - posNow,
            dUnit = distance / section;

        function move(moment, value) {
            setTimeout(function() {
                $flayers[0].style.transform = value;
            }, moment);
        }

        for (i = 0; i <= section - 1; i++) {
            cssValue = 'translate3d(' + (posNow + dUnit * i) + 'px,0,0)';
            move(time, cssValue);
            time += unit;
        }

        // last movement
        switch(lastStatus) {
            case 1:
                layerIndex = 6;
                posDest = -800 * flickingOption.count;
                break;
            case 2:
                layerIndex = 1;
                posDest = -800;
                break;
        }
        posFlickX = posDest;
        cssValue = 'translate3d(' + posDest + 'px,0,0)';
        move(time, cssValue);
    }


    // panel move
    function moving(e) {

        var direction;
        var d = posDragX - posDownX;
        var posDest, duration,
            lastStatus = 0;


        if (d <= -1 * flickingOption.area) { // go to right page
            direction = RIGHT;
            duration = flickingOption.duration;
            layerIndex ++;
            posDest = flickingOption.circular ? -1 * layerIndex * flickingOption.width : -1 * (layerIndex - 1) * flickingOption.width;
        } else if (d < flickingOption.area) { // stay now page
            direction = 0;
            duration = flickingOption.duration / 2;
            posDest = posFlickX - d;
        } else { // go to left page
            direction = LEFT;
            duration = flickingOption.duration;
            layerIndex --;
            posDest = flickingOption.circular ? -1 * layerIndex * flickingOption.width : -1 * (layerIndex - 1) * flickingOption.width;
        }


        if (flickingOption.circular) {
            if (layerIndex === 0 && direction === LEFT) {
                lastStatus = 1;
            } else if (layerIndex === flickingOption.count + 1 && direction === RIGHT) {
                lastStatus = 2;
            }
        } else {
            if (layerIndex === 0 && direction === LEFT) {
                layerIndex++;
                duration = flickingOption.duration / 2;
                posDest = posFlickX - d;
            } else if (layerIndex === flickingOption.count + 1 && direction === RIGHT) {
                layerIndex--;
                duration = flickingOption.duration / 2;
                posDest = posFlickX - d;
            }
        }

        animate(posFlickX, posDest, duration, lastStatus);

    }


    // set button color
    function setIndexButton() {
        var selector = '.flick-btn:nth-child(' + layerIndex + ')';
        $fbtn.removeClass('on');
        $fbtns.find(selector).addClass('on');
    }
}

flicking($('#flick-container'), $('#flick-layers'), $('#flick-btns'), {
    width: 800,
    area: 80,
    count: 6,
    duration: 224,
    circular: false,
    arrow: true
});

flicking($('#flick-container2'), $('#flick-layers2'), $('#flick-btns2'), {
    width: 800,
    area: 80,
    count: 6,
    duration: 224,
    circular: true,
    arrow: true
});