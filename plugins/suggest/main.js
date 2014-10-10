(function () {
    LET.jsonp = new(function jsonp() {
        this.request = function (url, callBack) {
            var tempName = "jsonp" + (new Date().getTime()).toString().substr(5);
            this[tempName] = "";
            var sc = document.createElement("script");
            this[tempName] = function (str) {
                callBack(str);
                sc.parentNode.removeChild(sc);
                delete this[tempName]
            };
            sc.setAttribute("type", "text/javascript");
            sc.setAttribute("charset", "utf8");
            sc.setAttribute("src", url + "&callback=LET.jsonp." + tempName);
            document.body.appendChild(sc)
        }
    })();
    LET.suggest = function (id, option) {
        return new LET.Suggest(id, option);
    };
    LET.Suggest = Class.extend({
        init: function (id, option) {
            this.create(id, option)
        },
        create: function (id, option) {
            var absPos, closeTimer, requestTimer, lastKeyword, resultsBox, qURL, keyword, suggestForm;
            var searchInput = LET.$(id);
            var defaultOption = {
                requestDelay: 320,
                closeDelay: 160,
                maxResultsNum: 20,
                api: "http://data.house.sina.com.cn/api/search_suggest.php",
                param: {
                    city: "nc"
                },
                offset: {
                    left: 0,
                    top: 0,
                    width: 0
                }
            };
            option = LET.deepCopy(defaultOption, option);
            _init();

            function _init() {
                var suggestForm = document.getElementById('con_search_1');
                if (suggestForm) {
                    suggestForm = suggestForm.getElementsByTagName('form')[0];
                }
                if (searchInput && searchInput.tagName == "INPUT") {
                    qURL = option.api + "?";
                    for (p in option.param) {
                        qURL += p + "=" + option.param[p] + "&"
                    }
                    resultsBox = LET.createElement("div", {
                        className: "none com" + id
                    }, {
                        position: "absolute"
                    }, document.body);
                    LET.preventDefault(searchInput);
                    LET.addEvent(searchInput, "focus", function () {
                        _getResults()
                    });
                    LET.addEvent(searchInput, "blur", function () {
                        if (requestTimer) {
                            clearTimeout(requestTimer)
                        }
                        setTimeout(_hideResults, option.closeDelay)
                    });
                    LET.addEvent(searchInput, "input", function () {
                        if (requestTimer) {
                            clearTimeout(requestTimer)
                        }
                        requestTimer = setTimeout(_getResults, option.requestDelay)
                    });
                    LET.addEvent(searchInput, "keydown", function (e) {
                        e = e ? e : window.event;
                        var keyNum = e.keyCode;
                        var currentLi = LET.getElementsByClassName("selected", "LI", resultsBox)[0];
                        switch (keyNum) {
                        case 38:
                            if (currentLi.previousSibling) {
                                LET.removeClassName(currentLi, "selected");
                                LET.addClassName(currentLi.previousSibling, "selected");
                                _setInputValue(currentLi.previousSibling.innerHTML)
                            }
                            break;
                        case 40:
                            if (currentLi.nextSibling) {
                                LET.removeClassName(currentLi, "selected");
                                LET.addClassName(currentLi.nextSibling, "selected");
                                _setInputValue(currentLi.nextSibling.innerHTML)
                            }
                            break;
                        case 27:
                            _hideResults();
                            searchInput.blur();
                            break;
                        default:
                            if (!+"\v1") {
                                if (requestTimer) {
                                    clearTimeout(requestTimer)
                                }
                                requestTimer = setTimeout(_getResults, option.requestDelay)
                            }
                        }
                    });
                    LET.addEvent(resultsBox, "mouseover", function (e) {
                        e = e || window.event;
                        var ot = e.target || e.srcElement;
                        if (ot.tagName == "LI") {
                            var lis = ot.parentNode.childNodes;
                            var len = lis.length;
                            for (var i = 0; i < len; i++) {
                                LET.removeClassName(lis[i], "selected")
                            }
                            LET.addClassName(ot, "selected")
                        }
                    });
                    LET.addEvent(resultsBox, "click", function (e) {
                        e = e || window.event;
                        var ot = e.target || e.srcElement;
                        if (ot.tagName == "LI") {
                            clearTimeout(closeTimer);
                            _setInputValue(ot.innerHTML);
                            _hideResults();
                            if (suggestForm && suggestForm.submit) {
                                suggestForm.submit();
                            }
                        }
                    })
                } else {
                    return "init failed"
                }
            }

            function _getResults() {
                keyword = encodeURI(searchInput.value);
                if (keyword != "") {
                    if (keyword == lastKeyword) {
                        _showResults()
                    } else {
                        LET.jsonp.request(qURL + "q=" + keyword, _queryAPI)
                    }
                } else {
                    resultsBox.innerHTML = "";
                    lastKeyword = "";
                    _hideResults()
                }
            }

            function _queryAPI(str) {
                var results, tempUl, tempLi, len;
                resultsBox.innerHTML = "";
                try {
                    results = eval(str);
                    option.maxResultsNum > results.length ? len = results.length : len = option.maxResultsNum;
                    tempUl = document.createElement("ul");
                    for (var i = 0; i < len; i++) {
                        tempLi = document.createElement("li");
                        tempLi.innerHTML = results[i].name;
                        if (i == 0) {
                            LET.addClassName(tempLi, "selected")
                        }
                        tempUl.appendChild(tempLi)
                    }
                    resultsBox.appendChild(tempUl)
                } catch (e) {
                    resultsBox.innerHTML = "<ul><li>\u6682\u65E0\u7B26\u5408\u6761\u4EF6\u7684\u697C\u76D8</li></ul>";
                    LET.addClassName(tempLi, "selected")
                }
                lastKeyword = keyword;
                _getResults()
            }

            function _showResults() {
                if (resultsBox.innerHTML != "") {
                    absPos = LET.getCoords(searchInput.parentNode);
                    resultsBox.style.left = (absPos.left + option.offset.left) + "px";
                    resultsBox.style.top = (absPos.top + option.offset.top + searchInput.offsetHeight) + "px";
                    resultsBox.style.width = (searchInput.parentNode.offsetWidth + option.offset.width) + "px";
                    LET.removeClassName(resultsBox, "none")
                }
            }

            function _hideResults() {
                if (!LET.hasClassName(resultsBox, "none")) {
                    LET.addClassName(resultsBox, "none")
                }
            }

            function _setInputValue(value) {
                searchInput.value = value
            }
        }
    });
})();
