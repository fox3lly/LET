(function () {
    String.prototype.removeJS = function () {
        return this.replace(/<script[^>]*?>([\w\W]*?)<\/script>/ig, '');
	};
    String.prototype.getJS = function () {
        var js = this.replace(/[\s\S]*?<script[^>]*?>([\w\W]*?)<\/script>[\s\S]*?/g, '$1\r');
        if (js == this) {
            return false;
        } else {
            var s = document.createElement('script');
            s.text = js;
            return s;
        }
	};
    LET.toArray = function (obj) {
        if (!obj) return [];
        if (obj instanceof Array) return obj;
        var arr = [],
            len = obj.length;
        if (/string|number/.test(typeof obj) || obj instanceof Function || len === undefined) {
            arr[0] = obj;
        } else {
            for (var i = 0; i < len; i++) {
                arr[i] = obj[i];
            }
        }
        return arr;
    };
    LET.Controller = function (id, ismutiEvent, islock) {
        this.id = id;
        this.ismuti = ismutiEvent;
        this.eventList = new Object();
        this.lockList = new Object();
        this.islock = islock;
	};
    LET.Controller.prototype = {
        addEvent: function () {
            var i, l, arges = Array.prototype.slice.call(arguments, 0),
                ev = arges.shift();
            if (this.eventList.hasOwnProperty(ev)) {
                if (this.ismuti) {
                    for (i = 0, l = arges.length; i < l; i++) {
                        this.eventList[ev].push(arges[i]);
                    };
                } else {
                    this.eventList[ev] = arges[0];
                }
            } else {
                this.eventList[ev] = this.ismuti ? arges : arges[0];
            }
            this.lockList[ev] = this.islock ? true : false;
            return this;
        },
        dispatchEvent: function () {
            var i, l, arges = Array.prototype.slice.call(arguments, 0),
                ev = arges.shift();
            if (this.lockList[ev]) return;
            if (!(this.eventList.hasOwnProperty(ev))) {
                return this;
            };
            var funlist = this.eventList[ev];
            if (this.ismuti) {
                for (i = 0, l = funlist.length; i < l; i++) {
                    funlist[i].apply(this, arges);
                }
            } else {
                funlist.apply(this, arges);
            }
        },
        removeEvent: function (ev) {
            if (this.eventList.hasOwnProperty(ev)) {
                delete this.eventList[ev];
            }
        },
        lock: function (ev) {
            this.lockList[ev] = true;
        },
        unlock: function (ev) {
            this.lockList[ev] = false;
        }
	};
    LET.superlazy = function(options){
    	return new LET.SuperLazy(options);
	};
    LET.SuperLazy = Class.extend({
        init: function (options) {
            this.startControl = new LET.Controller('startcon', true, false);
            this.endControl = new LET.Controller('endcon', false, false);
            this.binder = null;
            this.range = {};
            this.elems = [];
            this.container = null;
            this.mode = "";
            this.lock = false;
            this.elock = false;
            this.timer = null;
            this.options = {
                container: window,
                elems: [],
                mode: "v",
                ondataload: null,
                ondataend: function () {},
                islock: false,
                funeles: [],
                showThreshold: 200
            }
            LET.extend(this.options, options || {});
            this.elems = this.options.elems;
            this.mode = this.options.mode;
            this.showThreshold = this.options.showThreshold;
            this.funeles = LET.toArray(this.options.funeles);
            this.isnodelock = this.options.islock;
            this.pushEventQue(this.funeles);
            this.onDataLoad = this.options.ondataload || function (elem) {
                var h = elem.getElementsByTagName("textarea");
                if (h.length) {
                    var js = h[0].value.getJS();
                    if (js) {
                        elem.innerHTML = h[0].value.removeJS();
                        elem.appendChild(js);
                    } else {
                        elem.innerHTML = h[0].value;
                    }
                }
                this.elock = false;
            }
            this.onDataEnd = this.options.ondataend;
            this.create(this.options.container);
            this.loadRun();
            if (!this.elems.length) this.release();
        },
        pushEventQue: function (funeles) {
            for (var i = 0; i < funeles.length; i++) {
                var self = this,
                    eid = funeles[i].id,
                    ele = LET.$(eid);
                if (!ele) continue;
                ele.setAttribute("haveend", "false");
                this.elems.push(ele);
                var newonstart = funeles[i].onstart;
                if (funeles[i].onend) {
                    ele.setAttribute("haveend", "true");
                    newonstart = (function (self, obj, oldonstart) {
                        return function () {
                            if (oldonstart) {
                                oldonstart.apply(LET.$(obj.id), arguments);
                            };
                            self.endControl.addEvent(obj.id, obj.onend);
                        }
                    })(self, funeles[i], newonstart);
                }
                this.startControl.addEvent(eid, newonstart);
            }
        },
        create: function (c) {
            var doc = document,
                self = this;
            var isWin = c == window || c == doc || c == null || !c.tagName || /body|html/i.test(c.tagName);
            if (isWin) c = doc.documentElement;
            this.container = c;
            var getContainerRange = isWin && window.innerWidth ? function () {
                    return {
                        top: 0,
                        left: 0,
                        right: window.innerWidth,
                        bottom: window.innerHeight
                    }
                } : function () {
                    return self.getRect(c);
                }
            this.refreshRange = function () {
                self.range = getContainerRange();
            }
            this.refreshRange();
            this.scrollload = function () {
                if (!isWin) {
                    self.refreshRange();
                }
                self.loadRun();
            }
            this.noWinScroll = function () {
                self.range = getContainerRange();
                LET.removeEvent(window, "scroll", self.noWinScroll);
            }
            this.resizeload = function () {
                self.refreshRange();
                self.loadRun();
            }
            this.binder = isWin ? window : c;
            if (!isWin) LET.addEvent(window, "scroll", this.noWinScroll);
            LET.addEvent(this.binder, "scroll", LET.throttle(this.scrollload, 100));
            LET.addEvent(this.binder, "resize", LET.throttle(this.resizeload, 100));
        },
        getRect: function (elem) {
            var r = elem.getBoundingClientRect();
            return {
                top: r.top,
                left: r.left,
                bottom: r.bottom,
                right: r.right
            }
        },
        loadRun: function () {
            var elems = this.elems;
            if (elems.length) {
                for (var i = 0; i < elems.length; i++) {
                    var rect = this.getRect(elems[i]);
                    var side = this.isRange(this.inRange(rect));
                    var eleid = !+"\v1" ? elems[i]['id'] : elems[i].getAttribute('id');
                    if (side && side != 0) {
                        if (side == 1) {
                            if (!this.elock) {
                                this.elock = this.isnodelock;
                                var value = !+"\v1" ? elems[i]['haveend'] : elems[i].getAttribute('haveend');
                                this.startControl.dispatchEvent(eleid);
                                this.startControl.lock(eleid);
                                this.onDataLoad(this, elems[i]);
                                if (!value || value == "false") {
                                    elems.splice(i--, 1);
                                }
                            } else {
                                break;
                            }
                        } else {
                            this.startControl.unlock(eleid);
                            this.endControl.dispatchEvent(eleid);
                            this.endControl.removeEvent(eleid);
                        }
                    }
                }
                if (!elems.length) {
                    this.release();
                }
            }
            this.lock = false;
        },
        inRange: function (rect) {
            var range = this.range;
            var side = {
                v: rect.top <= range.bottom + this.showThreshold ? rect.bottom >= range.top - this.showThreshold ? "in" : "top" : "bottom",
                h: rect.left <= range.right + this.showThreshold ? rect.right >= range.left - this.showThreshold ? "in" : "left" : "right"
            };
            return side;
        },
        isRange: function (side) {
            return {
                v: side.v ? side.v == "in" ? 1 : -1 : 0,
                h: side.h ? side.h == "in" ? 1 : -1 : 0,
                c: side.v && side.h ? side.v == "in" && side.h == "in" ? 1 : -1 : 0
            }[this.mode || "c"]
        },
        release: function () {
            LET.removeEvent(this.binder, "scroll", this.scrollload);
            LET.removeEvent(this.binder, "resize", this.resizeload);
            this.onDataEnd();
        }
    });
})();
