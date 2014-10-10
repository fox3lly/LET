(function () {
    Function.prototype.Bind = function () {
        var D = this,
            B = arguments[0],
            A = new Array();
        for (var C = 1; C < arguments.length; C++) {
            A.push(arguments[C])
        }
        return function () {
            return D.apply(B, A)
        }
    };
    LET.stockvisited = function (_stringElementId, _intMaxLength, interval) {
        return new LET.StockVisited(_stringElementId, _intMaxLength, interval);
    };
    LET.StockVisited = Class.extend({
        _elementTarget: null,
        _intMaxLength: 0,
        _stringHtmlTemplate: "",
        _arrayStockList: [],
        _arrayHotList: [],
        _arrayList: [],
        _intThread: -1,
        _arrayData: {},
        _replace: function (_stringHtml, _stringStock) {
            var _arrayData = "";
            if (_stringStock.indexOf("hk") == -1) {
                _arrayData = window["hq_str_s_" + _stringStock].split(",");
            } else {
                _arrayData = window["hq_str_" + _stringStock].split(",");
                _arrayData = [_arrayData[1], _arrayData[6], _arrayData[7], _arrayData[8], _arrayData[12], _arrayData[11]];
            }
            if (!_arrayData || !_stringStock || !_arrayData[0])
                return "";
            _arrayData[50] = _stringStock;
            _arrayData[51] = _stringStock.replace(/^s[hz]/, "");
            _arrayData[52] = "";
            _arrayData[54] = '　';
            _arrayData[1] = (_arrayData[1] * 1).toFixed(2);
            _arrayData[55] = (_arrayData[2] * 1).toFixed(2);
            _arrayData[56] = _stringStock;
            if (_stringStock in this._arrayData) {
                if (_arrayData[1] * 1 > this._arrayData[_stringStock]) {
                    _arrayData[54] = '';
                } else if (_arrayData[1] * 1 < this._arrayData[_stringStock]) {
                    _arrayData[54] = '';
                } else {
                    _arrayData[54] = '　';
                }
            }
            this._arrayData[_stringStock] = _arrayData[1] * 1;
            if (_arrayData[3] * 1 > 0) {
                _arrayData[52] = "col_2";
            }
            if (_arrayData[3] * 1 < 0) {
                _arrayData[52] = "col_9";
            }
            var _arrayKeys = _stringHtml.match(/(<!-- )?@[^@]*@( -->)?/gm);
            if (_arrayKeys != null) {
                for (var i = 0; i < _arrayKeys.length; i++) {
                    var _stringValue = _arrayData[_arrayKeys[i].replace(/(<!-- )|( -->)/g, "").replace(/@/g, "")];
                    _stringValue = typeof _stringValue == "undefined" ? "--" : _stringValue;
                    _stringHtml = _stringHtml.replace(_arrayKeys[i], _stringValue);
                }
            }
            return _stringHtml;
        },
        _fill: function () {
            var _stringHtmlTemplate = this._stringHtmlTemplate;
            var _arrayHtml = _stringHtmlTemplate.split("<!-- @SPACE@ -->");
            _stringHtmlSpace = _arrayHtml[1];
            _stringHtmlTemplate = _arrayHtml[0] + _arrayHtml[2];
            var _arrayHtml = _stringHtmlTemplate.split("<!-- @LOOP@ -->");
            var _stringHtml = _arrayHtml[0];
            var _stringHtmlLoop = _arrayHtml[1];
            for (var i = 0; i < this._arrayStockList.length; i++) {
                _stringHtml += this._replace(_stringHtmlLoop, this._arrayStockList[i]);
            }
            if (this._arrayStockList.length < this._intMaxLength - 1) {
                _stringHtml += _stringHtmlSpace;
            }
            for (var i = 0; i < this._arrayHotList.length; i++) {
                _stringHtml += this._replace(_stringHtmlLoop, this._arrayHotList[i]);
            }
            this._elementTarget.innerHTML = _stringHtml + _arrayHtml[2];
        },
        _makeList: function () {
            var str = !+"\v1" ? this._elementTarget['stock'] : this._elementTarget.getAttribute('stock');
            this._arrayStockList = str.split(",");
            return str.split(",");;
        },
        _random: function () {
            return (new Date()).getTime() + Math.random().toString().replace("0.", "");
        },
        _load: function (__stringUrl, __functionCallback, __stringCharset) {
            var __elementScript = document.createElement("script");
            __elementScript.type = "text/javascript";
            if (typeof __stringCharset != "undefined") {
                __elementScript.charset = __stringCharset;
            }
            __elementScript._functionCallback = typeof __functionCallback != "undefined" ? __functionCallback : new Function();
            __elementScript[document.all ? "onreadystatechange" : "onload"] = function () {
                if (document.all && this.readyState != "loaded" && this.readyState != "complete") {
                    return;
                }
                this._functionCallback(this);
                this._functionCallback = null;
                this[document.all ? "onreadystatechange" : "onload"] = null;
                this.parentNode.removeChild(this);
            };
            __elementScript.src = __stringUrl;
            document.getElementsByTagName("head")[0].appendChild(__elementScript);
        },
        load: function () {
            this._load("http://hq.sinajs.cn/rn=" + this._random() + "&list=" + this._arrayList.join(","), this._fill.Bind(this), "gb2312");
        },
        init: function (_stringElementId, _intMaxLength, interval) {
            this._elementTarget = document.getElementById(_stringElementId);
            this._intMaxLength = _intMaxLength;
            this._stringHtmlTemplate = this._elementTarget.innerHTML;
            var _arrayList = this._makeList();
            for (var i = 0; i < _arrayList.length; i++) {
                if (_arrayList[i].indexOf("hk") == -1) {
                    _arrayList[i] = "s_" + _arrayList[i];
                }
            }
            this._arrayList = _arrayList;
            this.interval = interval;
            this.load();
        },
        start: function () {
            if (typeof (this.timeId) != "undefined" && this.timeId != 0 && this.timeId != null) {
                clearInterval(this.timeId);
            } else {
                this.timeId = setInterval(this.load.Bind(this), this.interval);
            }
        },
        end: function () {
            if (typeof (this.timeId) != "undefined" && this.timeId != 0 && this.timeId != null) {
                clearInterval(this.timeId);
                this.timeId = null;
            }
        }
    })
})();
