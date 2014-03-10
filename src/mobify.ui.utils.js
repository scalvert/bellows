var Mobify = window.Mobify = window.Mobify || {};
Mobify.$ = Mobify.$ || window.Zepto || window.jQuery;

/**
 @module Holds common functions relating to UI.
 */
Mobify.UI.Utils = (function($) {
    $.support = $.support || {};

    $.extend($.support, {
        'touch': 'ontouchend' in document
    });

    // determine which transition event to use
    var getTransitionEvent = function() {
        // http://stackoverflow.com/questions/5023514/how-do-i-normalize-css3-transition-functions-across-browsers
        // hack for ios 3.1.* because of poor transition support.
        if (/iPhone\ OS\ 3_1/.test(navigator.userAgent)) {
            return undefined;
        }

        var el = document.createElement('fakeelement');
        var transitions = {
            'transition': 'transitionEnd transitionend',
            'OTransition': 'oTransitionEnd',
            'MSTransition': 'msTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };

        var t;
        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
        return;
    };

    return {
        /**
         Events (either touch or mouse)
         */
        events: $.extend($.support.touch ?
            {down: 'touchstart', move: 'touchmove', up: 'touchend'} :
            {down: 'mousedown', move: 'mousemove', up: 'mouseup'},
            {
                'transitionend': getTransitionEvent()
            }),
        /**
         Returns the position of a mouse or touch event in (x, y)
         @function
         @param {Event} touch or mouse event
         @returns {Object} X and Y coordinates
         */
        getCursorPosition: ($.support.touch) ?
            function(e) {
                e = e.originalEvent || e;
                return {x: e.touches[0].clientX, y: e.touches[0].clientY};
            } :
            function(e) {
                return {x: e.clientX, y: e.clientY};
            },

        /**
         Returns prefix property for current browser.
         @param {String} CSS Property Name
         @return {String} Detected CSS Property Name
         */
        getProperty: function(name) {
            var prefixes = ['Webkit', 'Moz', 'O', 'ms', ''],
                testStyle = document.createElement('div').style;

            for (var i = 0; i < prefixes.length; ++i) {
                if (testStyle[prefixes[i] + name] !== undefined) {
                    return prefixes[i] + name;
                }
            }

            // Not Supported
            return;
        }
    };
})(Mobify.$);