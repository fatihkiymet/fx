(function (w) {

    if (!w.fx) {
        w.fx = {};
    }    

    w.fx.newId = function() {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    w.fx.progressbar = {
        active : false,
        show: function () {
            if (!this.active) {
                this.active = true;
                $("#loadingPageLoad").show();
                var opts = {
                    lines: 17, // The number of lines to draw
                    length: 0,
                    width: 4,
                    radius: 16, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    trail: 100,
                    color: '#555555', // #rgb or #rrggbb or array of colors
                    speed: 2.2, // Rounds per second
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9 // The z-index (defaults to 2000000000)
                }
                var target = document.getElementById('loadingPageLoad');
                var spinner = new Spinner(opts).spin(target);
            }
        },
        hide: function () {
            $("#loadingPageLoad").fadeOut(800);
            this.active = false;
        }
    }

    w.fx.scroll = {
        keys : [37, 38, 39, 40],
        preventDefault : function(e) {
            e = e || window.event;
            if (e.preventDefault)
                e.preventDefault();
            e.returnValue = false;
        },
        keydown: function (e) {
            var self = fx.scroll;
            if (self.keys) {
                for (var i = self.keys.length; i--;) {
                    if (e.keyCode === self.keys[i]) {
                        preventDefault(e);
                        return;
                    }
                }
            }
        },
        wheel : function(e) {
            fx.scroll.preventDefault(e);
        },
        enable: function () {
            if (w.addEventListener) {
                w.addEventListener('DOMMouseScroll', this.wheel, false);
            }
            w.onmousewheel = document.onmousewheel = this.wheel;
            document.onkeydown = this.keydown;
        },
        disable: function () {
            if (w.removeEventListener) {
                w.removeEventListener('DOMMouseScroll', this.wheel, false);
            }
            w.onmousewheel = document.onmousewheel = document.onkeydown = null;
        }
    }

    fx.Observer = function (valuefn, onChange, interval) {        
        var self = this;
        this.oldValue = valuefn();
        this.valuefn = valuefn;
        this.interval = interval || 500;
        this.watch = function () {
            var newValue = self.valuefn();
            if (self.oldValue != newValue) {                
                self.oldValue = newValue;
                onChange(newValue);
            }
        }
            
        this.observe = function () { setInterval(function () { self.watch(); }, interval); }
    };

})(window);

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};