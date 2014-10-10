(function () {
    LET.tab = function (options, fn) {
        return new LET.Tab(options, fn);
    };
    LET.Tab = Class.extend({
        init: function (options, fn) {
            this.defaults = {
                tabname: "data-tab",
                classname: "data-onclass",
                ajaxname: 'data-ajax',
                typename: "data-type",
                currentname: "data-current",
                hidden: "none",
                event: "mouseenter",
                slide: false,
                ajax: false,
                ajaxOptions: null
            };
            var that;
            that = this; {
                this.options = LET.extend({}, that.defaults, options);
            }
            var tabLen = 0;
            var paramtype = 1;
            var tabList;
            var tabid = this.options.id.split(",");
            tabLen = tabid.length;
            if (parseInt(tabid.length) === 1) {
                var tabItem = this.options.id.split(" ");
                var tabParent = LET.$(tabItem[0]);
                tabList = tabParent.getElementsByTagName(tabItem[1]);
                tabLen = tabList.length;
                paramtype = 2;
            } else {}
            options = this.options;
            var tabName = options.tabname;
            var ajaxName = options.ajaxname;
            var className = options.classname;
            var typeName = options.typename;
            var ajax = "ajax";
            this.tabOptions = [];
            this.tabOptions[ajaxName] = [];
            this.tabOptions[className] = [];
            this.tabOptions[typeName] = [];
            this.tabOptions[ajax] = [];
            var steptmp = 0;
            for (var i = 0; i < tabLen; i++) {
                var self;
                if (parseInt(paramtype) === 1) {
                    self = LET.$(tabid[i]);
                } else {
                    self = tabList[i];
                }
                var boxObj = self.getAttribute(tabName);
                if (boxObj === undefined || boxObj === null) {
                    steptmp++;
                    continue
                };
                var boxObj = boxObj.substr(1);
                var $boxObj = LET.$(boxObj);
                var currentname = self.getAttribute(options.currentname);
                this.tabOptions[ajaxName].push(self.getAttribute(ajaxName));
                if (typeof self.getAttribute(className) === 'undefined') {
                    this.tabOptions[className].push("");
                } else {
                    this.tabOptions[className].push(self.getAttribute(className));
                }
                this.tabOptions[typeName].push([self, boxObj]);
                this.tabOptions[ajax].push( !! self.getAttribute(ajaxName) || this.options.ajax);
                if (LET.hasClassName(self, this.tabOptions[className][i]) && options.ajax && !! !$boxObj.innerHTML.trim()) {
                    getTabHtml(i);
                }
                var k = i - steptmp;
                (function (k) {
                    var event;
                    if (window.document.all) {
                        event = options.event;
                    } else {
                        if (options.event == "mouseenter") {
                            event = "mouseover";
                        } else {
                            event = options.event;
                        }
                    }
                    LET.addEvent(self, event, function () {
                        if (!LET.hasClassName(that.tabOptions[typeName][k][0], that.tabOptions[className][k])) {
                            var $boxObj = LET.$(that.tabOptions[typeName][k][1]);
                            var textareaLen = $boxObj.getElementsByTagName('textarea').length;
                            if ((that.tabOptions[ajax][k] && !! !$boxObj.innerHTML.trim()) || parseInt(textareaLen) != 0) {
                                that.getTabHtml.call(that, k);
                            } else {
                                that.changeTab.call(that, k);
                            }
                        }
                    });
                })(k)
                if (currentname == "true") {
                    this.fireEvent(self, eventType);
                }
            }
        },
        connect: function (pageurl, tabinstance, n) {
            var that = this;
            var page_request = false;
            var bustcacheparameter = "";
            if (window.ActiveXObject) {
                try {
                    page_request = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        page_request = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (e) {}
                }
            } else if (window.XMLHttpRequest)
                page_request = new XMLHttpRequest();
            else
                return false;
            ajaxfriendlyurl = "http://" + window.location.host + pageurl;
            page_request.onreadystatechange = function () {
                if (page_request.readyState == 4 && page_request.status == 200) {
                    tabinstance.innerHTML = page_request.responseText;
                    that.changeTab(n);
                }
            }
            page_request.open('GET', ajaxfriendlyurl, true);
            page_request.send(null);
        },
        changeTab: function (n) {
            var i;
            var that = this;
            var options = this.options;
            var typeName = options.typename;
            var className = options.classname;
            for (i = 0; i < this.tabOptions[typeName].length; i++) {
                var tmp = this.tabOptions[typeName][i];
                tabRemoveClass(tmp[0], this.tabOptions[className][i]);
                LET.addClassName(tmp[1], this.options.hidden);
            }
            LET.addClassName(this.tabOptions[typeName][n][0], this.tabOptions[className][n]);
            var myid = document.getElementById(this.tabOptions[typeName][n][1]);
            tabRemoveClass(myid, this.options.hidden);

            function tabRemoveClass(element, className) {
                var testaaa = element.className;
                if (typeof element.className != "undefined" && element.className != 0 && element.className != null) {
                    var oldClasses = element.className.split(/\s+/);
                    var newClasses = className.split(/\s+/);
                    var _old_length = oldClasses.length;
                    var _del_length = newClasses.length;
                    var j = 0;
                    var i = 0;
                    for (i = 0; i < _del_length; i++) {
                        for (j = 0; j < _old_length; ++j) {
                            if (oldClasses[j] == newClasses[i]) {
                                oldClasses.splice(j, 1);
                                j--;
                                _old_length--;
                            }
                        }
                    }
                    element.className = oldClasses.join(" ");
                    return element;
                }
            }
        },
        getTabHtml: function (n) {
            var options = this.options;
            var $boxObj = LET.$(this.tabOptions[options.typename][n][1]);
            var $textarea = $boxObj.getElementsByTagName('textarea')[0];
            var that = this;
            if ($textarea) {
                var str = "" + $textarea.innerHTML;
                str = str.replace(/&lt;/g, "<");
                str = str.replace(/&gt;/g, ">");
                $boxObj.innerHTML = str;
                this.changeTab(n);
            } else {
                this.connect(this.tabOptions[options.ajaxname][n], $boxObj, n);
            }
        },
        fireEvent: function (el, type) {
            if (document.createEventObject) {
                return el.fireEvent("on" + type);
            } else {
                var e = document.createEvent("HTMLEvents");
                e.initEvent(type, true, true);
                return !el.dispatchEvent(e);
            }
        }
    });
})();
