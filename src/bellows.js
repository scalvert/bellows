var Mobify = window.Mobify = window.Mobify || {};
Mobify.$ = Mobify.$ || window.Zepto || window.jQuery;

;(function($) {

    var noop = function(){};

    var Bellows = function(element, options) {
        this.init(element, options);
    };

    Bellows.DEFAULTS = {
        dragRadius: 10,

        closedClass: 'm-closed',
        openedClass: 'm-opened',
        activeClass: 'm-active',
        contentClass: 'm-content',
        innerContentClass: 'm-inner-content',
        headerClass: 'm-header',
        itemClass: 'm-item',
        moduleClass: 'm-bellows',

        initialized: noop,
        beforeOpened: noop,
        afterOpened: noop,
        beforeClosed: noop,
        afterClosed: noop
    };

    Bellows.prototype.init = function(element, options) {
        this.options = $.extend({}, Bellows.DEFAULTS, options);
        this.$bellows = $(element);

        // Auto-open items that are hash linked or have openedClass class
        var hash = window.location.hash;
        var $hashitem = this.$bellows.find('.' + this.options.headerClass + ' a[href="' + hash + '"]');

        if ($hashitem.length) {
            open($hashitem.parent());
        } else if (this.$bellows.find('.' + this.options.openedClass).length) {
            open(this.$bellows.find('.' + this.options.openedClass));
        }

        var $headers = this.$bellows.children('.' + this.options.itemClass).children('.' + this.options.headerClass);

        $headers
            .on(Utils.events.down, this.down)
            .on(Utils.events.move, this.move)
            .on(Utils.events.up, this.up)
            .on('click', click);

        if (Utils.events.transitionend) {
            this.$bellows.on(Utils.events.transitionend, '.' + this.options.contentClass, this.endTransition);
        }

        this._trigger('initialized');
    };

    Bellows.prototype.endTransition = function() {
        // transition attached to .content elements, use parent to grab .item
        var $item = $(this).parent();
        // if the transition is ending
        if ($item.hasClass(this.options.closedClass)) $(this).parent().removeClass(this.options.activeClass);
        // Execute any callbacks that were passed
        this._trigger.call($item, $item.hasClass(this.options.closedClass) ? 'afterClosed' : 'afterOpened');
        recalculateHeight($bellows);
    };

    // Recalculate proper height for specified bellows
    Bellows.prototype.recalculateHeight = function($bellows) {
        var height = 0;

        $bellows.children('.' + this.options.itemClass).each(function() {
            var $item = $(this);
            height += $item.height();
        });

        $bellows.css('min-height', height + 'px');
    };

    // Calculate height of individual accordion item (useful for dynamic item creation)
    Bellows.prototype.recalculateItemHeight = function($item) {
        var bellows = this;
        var $content = $item.children('.' + this.options.contentClass);
        // determine which height function to use (outerHeight not supported by zepto)
        var contentChildren = $content.children();
        var contentHeight = ('outerHeight' in contentChildren) ? contentChildren.outerHeight() : contentChildren.height();
        $content.css('max-height', contentHeight * 1.5 + 'px');
        // if transitions are supported, minimize browser reflow by adding the height
        // of the to-be expanded content element to the height of the entire accordion
        if (Utils.events.transitionend) {
            this.$bellows.css('min-height', this.$bellows.height() + 'px');
        }

        // we need to wait to recalculate, so that the heights are calculated properly first
        setTimeout(function() {
            $currentBellows = $item.closest('.' + this.options.moduleClass);
            bellows.recalculateHeight($currentBellows);

            // Resize the parent bellows if it exists
            $parentBellows = $currentBellows.parent().closest('.' + this.options.moduleClass);
            if ($parentBellows.length > 0) {
                bellows.recalculateItemHeight($item.parent().closest('.' + this.options.itemClass));
            }
        }, 150);
    };

    Bellows.prototype.close = function($item) {
        this._trigger('beforeClosed');

        // toggle opened and closed classes
        $item.removeClass(this.options.openedClass);
        $item.addClass(this.options.closedClass);
        // toggle active class on close only if there is no transition support
        if (!Utils.events.transitionend) $item.removeClass(this.options.activeClass);
        // set max-height to 0 upon close
        $item.children('.' + this.options.contentClass).css('max-height', '0px');

        this._trigger.call($item, 'afterClosed');
    };

    Bellows.prototype.open = function($item) {
        this._trigger('beforeOpened');

        $item.addClass(this.options.activeClass);
        $item.removeClass(this.options.closedClass);
        $item.addClass(this.options.openedClass);
        this.recalculateItemHeight($item);

        this._trigger.call($this, 'afterOpened');
    };

    Bellows.prototype.down = function(e) {
        // get initial position on mouse/touch start
        xy = Utils.getCursorPosition(e);
    };

    Bellows.prototype.move = function(e) {
        // update position upon move
        dxy = Utils.getCursorPosition(e);
    };

    Bellows.prototype.up = function(e) {
        // if there is dragging, do not close/open bellows
        if (dxy) {
            dx = xy.x - dxy.x;
            dy = xy.y - dxy.y;
            dxy = undefined;
            if ((dx * dx) + (dy * dy) > this.options.dragRadius * this.options.dragRadius) return;
        }
        // close or open item depending on active class
        var $item = $(this).parent();

        this[$item.hasClass(this.options.activeClass) ? 'close' : 'open']($item);
    };

    Bellows.prototype.unbind = function() {
        this.$bellows.off();
    };

    Bellows.prototype.destroy = function() {
        this.unbind();
        this.$bellows.remove();
    };

    Bellows.prototype._trigger = function(eventName, data) {
        this.options[eventName].call(this, $.Event('bellows:' + eventName, { bubbles: false }), data);
    };

    // BELLOWS PLUGIN
    // =========================

    $.fn.bellows = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data  = $this.data('bellows');

            if (!data) {
                $this.data('bellows', (data = new Bellows(this, option)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.bellows.Constructor = Bellows;


})(Mobify.$);