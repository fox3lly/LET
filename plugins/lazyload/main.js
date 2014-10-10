(function () {
	LET.lazyload = function(options){
		return new LET.LazyLoad(options);
	};
    LET.LazyLoad = Class.extend({
        windowHeight: document.documentElement.clientHeight,
        showThreshold: 200,
        arrLoad: {},
        timer: null,
        time: 100,
        init: function (options) {
            var that = this;
            var lazyLoadObject = this._init(options);
            for (var key in lazyLoadObject) {
                this.calculate(lazyLoadObject[key]);
            }
            this.isLoad();
            LET.addEvent(window, "scroll", function () {
                that.loadElements();
            });
            LET.addEvent(window, "resize", function () {
                that.loadElements();
            });
        },
        loadElements: function () {
            var that = this;
            clearTimeout(this.timer);
            this.timer = setTimeout(function () {
                that.isLoad();
            }, this.time);
        },
        _init: function (options) {
            var obj = {};
            for (var key in options) {
                obj[key] = LET.getElementsByAttribute(key + "[" + options[key] + "]");
            }
            return obj;
        },
        calculate: function (lazyloadobject) {
            if (lazyloadobject.length == 0) {
                return null;
            } else {
                for (var i = 0, len = lazyloadobject.length; i < len; i++) {
                    var scrollTop = LET.getCoords(lazyloadobject[i]).top;
                    if (!this.arrLoad.hasOwnProperty(scrollTop)) {
                        this.arrLoad[scrollTop] = [];
                    }
                    this.arrLoad[scrollTop].push(lazyloadobject[i]);
                }
            }
        },
        isLoad: function () {
            var scrolltop = this.getScrollTop();
            var loadObj = this.arrLoad;
            if (loadObj != null && loadObj != {}) {
                var n = this.showThreshold;
                for (var i in loadObj) {
                    if (parseInt(i) >= scrolltop - n && parseInt(i) <= scrolltop + this.windowHeight + n && loadObj.hasOwnProperty(i)) {
                        for (var j = 0, len = loadObj[i].length; j < len; j++) {
                            var ele = loadObj[i][j];
                            var imgSrc = ele.getAttribute("lsrc");
                            ele.setAttribute("src", imgSrc);
                            ele.removeAttribute("lsrc");
                        }
                        delete this.arrLoad[i];
                    }
                }
            }
        },
        getScrollTop: function (node) {
            var doc = node ? node.ownerDocument : document;
            return doc.documentElement.scrollTop || doc.body.scrollTop;
        }
    });
})();