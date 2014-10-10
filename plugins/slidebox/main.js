(function () {
    LET.slidebox = function (data, call) {
        return new LET.SlideBox(data, call);
    };
    LET.SlideBox = Class.extend({
        init: function (data, call) {
            this.data = data;
            this.type = this.data.type || "left";
            this.evet = this.data.evet || "click";
            this.hostop = this.data.hostop || false;
            this.slideObj = document.getElementById(this.data.slideid);
            this.changeBtn = document.getElementById(this.data.changeid);
            this.sum = this.data.sum || 1;
            this.shows = this.data.shows || 1;
            if (call == "box") {
                this.box();
            } else {
                this.view();
            };
        },
        view: function () {
            var time = this.data.time || 4000,
                hover = this.data.hover || "hover";
            var str = "",
                i = 0,
                len = 0,
                itmes = null,
                changeBtnS = null,
                slidejson = null,
                offl = null,
                olImgL = null,
                animateHook = false;
            var slideh = this.slideObj.getAttribute("slideh"),
                slidew = this.slideObj.getAttribute("slidew");
            var olImg = this.slideObj.children[0],
                liImg = olImg.children,
                stop = true;
            slidejson = this.slideStyle(olImg, liImg, slideh, slidew);
            for (i; i < liImg.length; i++) {
                if (i == 0) {
                    str += "<span class=" + hover + ">" + (i + 1) + "<\/span>";
                } else {
                    str += "<span >" + (i + 1) + "<\/span>";
                };
                liImg[i].style.cssText = "width:" + slidew + "px;height:" + slideh + "px";
            };
            this.changeBtn.innerHTML = str;
            changeBtnS = this.changeBtn.children;
            for (i = 0; i < changeBtnS.length; i++) {
                changeBtnS[i].index = i;
                changeBtnS[i]["on" + this.evet] = function () {
                    if (!olImg.isplay) {
                        changeBtnS[len].className = "";
                        var y = len == (changeBtnS.length - 1) ? true : false;
                        window.clearTimeout(itmes);
                        animate(this.index, y);
                        len = this.index;
                    }
                }
            };
            if (time) {
                itmes = setTimeout(timesfun, time);
                if (this.hostop) {
                    olImg.onmouseout = olImg.onmouseover = function (event) {
                        event = event || window.event;
                        var target = event.target || event.srcElement;
                        if (event.type == "mouseover" && LET.fixedMouse(event, olImg)) {
                            stop = false;
                            window.clearTimeout(itmes);
                        } else if (event.type == "mouseout" && LET.fixedMouse(event, olImg)) {
                            stop = true
                            itmes = window.setTimeout(timesfun, time);
                        };
                    };
                }
            };

            function timesfun() {
                window.clearTimeout(itmes);
                if (stop && !olImg.isplay) {
                    changeBtnS[len].className = "";
                    len++;
                    if (len > changeBtnS.length - 1) {
                        len = 0;
                    };
                    animate(len, true);
                };
            };

            function animate(k, y) {
                if (!olImg.isplay) {
                    changeBtnS[k].className = hover;
                    if (k == 0 && y) {
                        animateHook = true;
                        k = liImg.length;
                        liImg[0].style.position = "Relative";
                        liImg[0].style[slidejson.marg] = slidejson.offl * k + "px";
                    } else {
                        animateHook = false;
                    };
                    LET.startMove(olImg, LET.scrollmember(slidejson, true, k), null, function () {
                        if (animateHook) {
                            liImg[0].style[slidejson.marg] = "0px";
                            liImg[0].style.position = "";
                            olImg.style[slidejson.marg] = "0px";
                        };
                        if (stop) {
                            itmes = setTimeout(timesfun, time);
                        }
                    });
                }
            };
        },
        box: function () {
            var time = this.data.time || 4000,
                ispaly = true,
                offl = null,
                olImgL = null,
                slideh = null,
                slidew = null,
                liImg = null,
                itmes = null,
                slidejson = null;
            var changeLbtn = this.data.changeL ? document.getElementById(this.data.changeL) : null;
            var changeRbtn = this.data.changeR ? document.getElementById(this.data.changeR) : null;
            var olImg = this.slideObj.children[0],
                slidemous = this.slideObj,
                stop = true,
                _oldlength = olImg.children.length,
                _str;
            _str = olImg.innerHTML;
            do {
                olImg.innerHTML += _str;
            } while (olImg.children.length < _oldlength + parseInt(this.sum));
            liImg = olImg.children;
            slideh = LET.outerHeight(liImg[0]);
            slidew = LET.outerWidth(liImg[0]);
            slidejson = this.slideStyle(olImg, liImg, slideh, slidew, this.shows, this.sum, _oldlength);
            if (time) {
                itmes = window.setTimeout(timesfun, time);
                if (this.hostop) {
                    slidemous.onmouseout = slidemous.onmouseover = function (event) {
                        event = event || window.event;
                        var target = event.target || event.srcElement;
                        if (event.type == "mouseover" && LET.fixedMouse(event, slidemous)) {
                            window.clearTimeout(itmes);
                            ispaly = stop = false;
                        } else if (event.type == "mouseout" && LET.fixedMouse(event, slidemous)) {
                            ispaly = stop = true;
                            itmes = window.setTimeout(timesfun, 2000);
                        };
                    };
                }
            };
            if (changeRbtn && changeRbtn) {
                changeRbtn.onclick = changeLbtn.onclick = function (event) {
                    var play = true;
                    event = event || window.event;
                    var target = event.target || event.srcElement;
                    if (target === changeLbtn) {
                        play = false;
                    }
                    if (ispaly) {
                        window.clearTimeout(itmes);
                        LET.startMove(olImg, LET.scrollmember(slidejson, play), null, function () {
                            ispaly = true;
                            itmes = setTimeout(timesfun, time);
                        });
                    };
                    ispaly = false;
                };
            };

            function timesfun() {
                window.clearTimeout(itmes);
                if (stop && ispaly) {
                    LET.startMove(olImg, LET.scrollmember(slidejson, true), null, function () {
                        ispaly = true;
                        itmes = window.setTimeout(timesfun, time);
                    });
                };
                ispaly = false;
            };
        },
        slideStyle: function (olImg, liImg, slideh, slidew, sum, shows, oldlength) {
            var offl, olImgL, sum = parseInt(sum) || 1,
                shows = parseInt(shows) || 1;
            if (this.type && this.type.toUpperCase() == "TOP") {
                offl = slideh;
                olImgL = offl * oldlength + offl;
                olImg.style.cssText = "position:absolute;top:0px;";
                return {
                    memobj: olImg,
                    marg: this.type,
                    men: (olImgL - (offl * sum)),
                    offl: (offl * sum)
                };
            } else {
                offl = slidew;
                olImgL = offl * liImg.length;
                olImg.style.cssText = "width:" + olImgL + "px;position:absolute;";
                return {
                    memobj: olImg,
                    marg: this.type,
                    men: (olImgL - (offl * (shows + sum))),
                    offl: (offl * sum)
                };
            };
        }
    });
})();
