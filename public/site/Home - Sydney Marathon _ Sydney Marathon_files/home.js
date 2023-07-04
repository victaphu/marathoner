jQuery(function () {
    var $ = jQuery;
    (function($) {
        $.fn.animateNumbers = function(stop, dollarSign, commas, duration, ease) {
            return this.each(function() {
                var $this = $(this);
                var start = parseInt($this.text().replace(/,/g, ""));
                commas = (commas === undefined) ? true : commas;
                dollarSign = (dollarSign === undefined) ? true : dollarSign;
                const prefix = dollarSign ? "$" : "";
                $({value: start}).animate({value: stop}, {
                    duration: duration == undefined ? 1000 : duration,
                    easing: ease == undefined ? "swing" : ease,
                    step: function() {
                        $this.text(Math.floor(this.value));
                        if (commas) { $this.text($this.text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")); }
                    },
                    complete: function() {
                    if (parseInt($this.text()) !== stop) {
                        $this.text(stop);
                        if (commas) { $this.text(prefix + $this.text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")); }
                    }
                    }
                });
            });
        };
	// define the isOnScreen plugin from http://jsfiddle.net/moagrius/wN7ah/
	$.fn.isOnScreen = function() {
		var win = $(window);
		
		var viewport = {
		    top : win.scrollTop(),
		    left : win.scrollLeft(),
		    right: win.scrollLeft() + win.width(),
		    bottom: win.scrollTop() + win.height()
		};
		
		var bounds = this.offset();
		bounds.right = bounds.left + this.outerWidth();
		bounds.bottom = bounds.top + this.outerHeight();
		
		return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom)); 
	};
	
	
    })(jQuery);

    // define throttling function for use in scroll event listener
    // ref: http://blogorama.nerdworks.in/javascriptfunctionthrottlingan/
    function throttle(delay, callback) {
        var previousCall = new Date().getTime();
        return function() {
            var time = new Date().getTime();
            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    // set up an event to listen for window scroll 4 times a second
    $(window).on('scroll.numbers', throttle( 250, function () {

        // if #the-box is visible the call init functions and disable window scroll
        // event listener, as you only want to initialise the lightbox once
        if ( $(".map").isOnScreen() ) {

            // for demo purposes
            setTimeout(function() {            
                $raisedTotal.animateNumbers(raisedAmount);            
                $fundraiserCount.animateNumbers(fundraiserCount, false);
		$charityCount.animateNumbers(charityCount, false);
            }, 100);
		
            // turn off scroll listener
            $(window).off('scroll.numbers');
        }
    }));

    const $leaderboards = document.getElementsByClassName("thermometer-setup")[0];

    if (typeof($leaderboards) == 'undefined' && $leaderboards == null) return;

    const apiUrl = $leaderboards.getAttribute("data-api-host");
    const apiKey = $leaderboards.getAttribute("data-api-key");
    const eventTag = $leaderboards.getAttribute("data-event-tag");

    const defaultPageSize = 5;
    const pageSize = (typeof($leaderboards) == 'undefined' && $leaderboards && $leaderboards.getAttribute("data-pagesize")) || defaultPageSize;

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'ApiKey': apiKey
        }
    }

    function getRequestOptions() {
        return {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ tags: { event: [eventTag]}, type: "event", page: 1, pageSize: pageSize, orderDirection: "Desc", orderKey: "raisedAmount" })
        }
    };

    var $numbers = $(".thermometer-setup").find(".thermometer-value");
    var $raisedTotal = $numbers.eq(0);
    var $fundraiserCount = $numbers.eq(1);
    var $charityCount = $numbers.eq(2);
    var raisedAmount = 0;
    var fundraiserCount = 0;
    var charityCount = 0;

    function loadData() {
        const url = `${apiUrl}api/v3/page/search/public/`;

        const records = window.fetch(url, getRequestOptions());
        Promise.all([records])
            .then(res => {
                const responses = res.map(response => response.json())
                return Promise.all(responses)
            })
            .then(res => {
                res.map(obj => { 
                    obj.data.list.map(leaderboardItem => {
                        raisedAmount += leaderboardItem.raisedAmount;
                        fundraiserCount += leaderboardItem.fundraiserCount + leaderboardItem.teamCount + leaderboardItem.collectionCount;
                        charityCount += leaderboardItem.event.linkedOrganizationCount || 0;
                    });
                });
            });
    }

    if ($leaderboards) {
        loadData();
    }
});