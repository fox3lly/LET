(function () {
    LET.combobox = function (ele, settings) {
        return new LET.Combobox(ele, settings);
    };
    LET.Combobox = Class.extend({
        init: function (ele, settings) {
            this.setting = {
                event: "click"
            };
            LET.extend(this.setting, settings);
            this.ele = ele;
            this.isShow = this.setting.isHide;
            this.setIndex();
            this.index = 0;
            this.create();
        },
        data: function () {
            var data = [];
            data = this.setting.data;
            return data;
        },
        change: function (ele, settings) {
            if (this.ele != ele) {
                LET.extend(this.setting, settings);
                var data = this.data();
                this.ele = ele;
                this.isShow = this.setting.isHide;
                this.setIndex();
                this.update(data);
            } else {
                this.triggle();
            }
        },
        create: function () {
            var combobox = this.combobox = LET.createElement('div', {
                id: "combobox"
            }, null);
            var _this = this;
            LET.addEvent(combobox, this.setting.event, function (e) {
                var target = LET.getTarget(e);
                if (target.nodeName.toLowerCase() === "li") {
                    var _index = !+"\v1" ? target['data-index'] : target.getAttribute('data-index'),
                        _value = !+"\v1" ? target['data-value'] : target.getAttribute('data-value');
                    for (var i = 0, l = _this.setting.target.length; i < l; i++) {
                        var targetElement = _this.setting.target[i];
                        if (targetElement.nodeName.toLowerCase() === "select") {
                            targetElement.selectedIndex = _index;
                        } else
                        if (targetElement.nodeName.toLowerCase() === "input") {
                            targetElement.value = _value;
                        } else {
                            targetElement.innerHTML = target.innerHTML;
                        }
                    }
                }
                _this.ele.focus();
                _this.hide();
            });
            LET.addEvent(combobox, "mouseover", function (e) {
                var target = LET.getTarget(e);
                if (target.nodeName.toLowerCase() === "li") {
                    var arr = this.getElementsByTagName("li");
                    for (var i = 0, l = arr.length; i < l; i++) {
                        LET.removeClassName(arr[i], 'hover');
                    }
                    LET.addClassName(target, 'hover');
                }
            });
            LET.addEvent(document, "keydown", function (e) {
                switch (e.keyCode) {
                case 40:
                    _this.updateTarget(true, e);
                    break;
                case 38:
                    _this.updateTarget(false, e);
                    break;
                case 13:
                    _this.triggle();
                    break;
                }
            });
            document.body.appendChild(combobox);
            LET.addEvent(document.body, "click", function (e) {
                var target = LET.getTarget(e);
                if (target != _this.ele) {
                    _this.hide();
                }
            });
            this.update(this.setting.data);
        },
        update: function (data) {
            var style = {
                "position": "absolute"
            };
            var resultString = "";
            var _this = this;
            this.listLength = data.length;
            if (LET.isArray(data) && data.length) {
                var dataStringArray = ['<ul>'];
                for (var i = 0, l = data.length; i < l; i++) {
                    var hover = _this.index == i ? "hover" : "";
                    if (LET.isArray(data[i])) {
                        dataStringArray.push('<li class="' + hover + '" data-value="' + data[i][1] + '" data-index="' + i + '">' + data[i][0] + '</li>');
                    } else {
                        dataStringArray.push('<li class="' + hover + '" data-value="' + data[i] + '" data-index="' + i + '">' + data[i] + '</li>');
                    }
                }
                dataStringArray.push('</ul>');
                resultString = dataStringArray.join("");
            } else {
                resultString = this.setting.blank;
            }
            this.combobox.innerHTML = resultString;
            var offset = LET.getCoords(this.ele);
            var top = offset.top + this.ele.offsetHeight + 2;
            var width = this.ele.offsetWidth;
            LET.setStyle(this.combobox, LET.extend(style, {
                "top": top + "px",
                "left": offset.left + "px",
                "width": width + "px"
            }));
            this.triggle();
        },
        triggle: function () {
            if (this.isShow) {
                this.hide();
            } else {
                this.show();
            }
        },
        hide: function () {
            this.combobox.style.display = 'none';
            this.isShow = false;
        },
        show: function () {
            this.combobox.style.display = 'block';
            this.updateList();
            this.isShow = true;
        },
        updateList: function () {
            var list = this.combobox.getElementsByTagName("li");
            for (var i = 0, l = list.length; i < l; i++) {
                var item = list[i];
                LET.removeClassName(item, "hover");
                if (i == this.index) {
                    LET.addClassName(item, "hover");
                    this.val = item.innerHTML;
                }
            }
        },
        updateTarget: function (isDown, e) {
            if (document.activeElement != document.body) {
                LET.preventDefault(e);
            };
            this.getIndex(isDown);
            var value = [];
            this.updateList();
            value = [this.val];
            if (this.select) {
                value = LET.getSelectValue(this.select);
            }
            for (var i = 0, l = this.setting.target.length; i < l; i++) {
                var targetElement = this.setting.target[i];
                if (targetElement.nodeName.toLowerCase() === "input") {
                    targetElement.value = value[0];
                } else if (targetElement.nodeName.toLowerCase() != "select") {
                    targetElement.innerHTML = value[0];
                }
            }
        },
        getIndex: function (isDown) {
            if (this.select) {
                this.index = this.select.selectedIndex;
            } else {
                if (document.activeElement == this.setting.target[0][0]) {
                    if (isDown) {
                        if (this.index < this.listLength - 1) {
                            this.index++;
                        }
                    } else {
                        if (this.index > 0) {
                            this.index--;
                        }
                    }
                }
            }
        },
        setIndex: function () {
            if (this.setting.select) {
                this.select = this.setting.select;
                this.index = this.select.selectedIndex;
                this.length = this.select.options.length;
            }
        }
    });
})();
(function () {
    LET.getSelectValue = function (select) {
        var idx = select.selectedIndex,
            option, value;
        if (idx > -1) {
            option = select.options[idx];
            value = option.attributes.value;
            return [option.text, ((value && value.specified) ? option.value : option.text)];
        }
        return null;
    };
    LET.getSelectOptions = function (item) {
        var list = [];
        var options = item.options;
        for (var i = 0, l = options.length; i < l; i++) {
            var option = options[i],
                value = option.attributes.value;
            value = (value && value.specified) ? option.value : option.text;
            var optiontext = option.text;
            list.push([optiontext, value]);
        }
        return list;
    };
    LET.getActiveElement = function (element) {
        if (element != null && element.className && element.className.toLowerCase().indexOf("super_select") > -1) {
            return element;
        } else {
            LET.getActiveElement(element.parentNode);
        }
    };
    LET.syncSelectIndex = function (activeElement, relatedSelect, isDown, e) {
        if (document.activeElement != document.body) {
            LET.preventDefault(e);
        };
        if (!relatedSelect || relatedSelect.nodeName.toLowerCase() != "select") {
            return;
        }
        if (isDown) {
            relatedSelect.selectedIndex++;
            if (relatedSelect.selectedIndex == -1) {
                relatedSelect.selectedIndex = relatedSelect.options.length - 1;
            }
            activeElement.firstChild.innerHTML = LET.getSelectValue(relatedSelect)[0]
        } else {
            relatedSelect.selectedIndex--;
            if (relatedSelect.selectedIndex == -1) {
                relatedSelect.selectedIndex = 0;
            }
            activeElement.firstChild.innerHTML = LET.getSelectValue(relatedSelect)[0]
        }
    };
    LET.beautyform = function (option) {
        return new LET.BeautyForm(option);
    };
    LET.BeautyForm = Class.extend({
        init: function (option) {
            var setting = {
                "id": "con_search_1"
            };
            LET.extend(setting, option);
            this.el = LET.$(setting.id)
            LET.beautyform.combobox = null;
            var self = this;
            LET.addEvent(this.el, "keydown", function (e) {
                var target = LET.getTarget(e);
                if (target.type == "text") {
                    return;
                };
                var activeElement = LET.getActiveElement(document.activeElement);
                switch (e.keyCode) {
                case 40:
                    LET.syncSelectIndex(activeElement, LET.getPreviousSibling(activeElement), true, e)
                    break;
                case 38:
                    LET.syncSelectIndex(activeElement, LET.getPreviousSibling(activeElement), false, e)
                    break;
                }
            });
            this.create();
        },
        create: function () {
            var select = this.el.getElementsByTagName("select");
            for (var i = 0, l = select.length; i < l; i++) {
                var select_ele = select[i];
                LET.toggleDisplay(select_ele, "none");
                var ele = LET.createElement('div', {
                    tabIndex: "0",
                    className: "super_select"
                }),
                    text = LET.createElement('span', {
                        className: "text"
                    }, null, ele),
                    txt = select_ele.options[0].getAttribute('data-init');
                text.innerHTML = !! txt ? txt : LET.getSelectValue(select_ele)[0];
                var list = LET.getSelectOptions(select_ele);
                LET.addEvent(ele, "click", (function (ele, select_ele, text, list) {
                    return function (e) {
                        var target = LET.getTarget(e);
                        if (!LET.beautyform.combobox) {
                            LET.beautyform.combobox = new LET.Combobox(ele, {
                                select: select_ele,
                                target: [text, select_ele],
                                data: list
                            })
                        } else {
                            LET.beautyform.combobox.change(ele, {
                                select: select_ele,
                                target: [text, select_ele],
                                data: list
                            });
                        }
                        LET.stopPropagation(e);
                    }
                })(ele, select_ele, text, list));
                LET.addEvent(document.body, "mouseover", (function (ele, text) {
                    return function (e) {
                        var target = LET.getTarget(e);
                        if (target === ele || target === text) {
                            LET.addClassName(ele, "hover");
                        }
                    }
                })(ele, text));
                LET.addEvent(document.body, "mouseout", (function (ele, text) {
                    return function (e) {
                        var target = LET.getTarget(e);
                        if (target === ele || target === text) {
                            LET.removeClassName(ele, "hover");
                        }
                    }
                })(ele, text));
                LET.insertAfter(ele, select_ele);
            }
            var inputarr = [];
            inputs = this.el.getElementsByTagName('input');
            for (var i = 0, l = inputs.length; i < l; i++) {
                var current = inputs[i],
                    _value = !+"\v1" ? current['type'] : current.getAttribute('type');
                if (_value == 'text') {
                    inputarr.push(inputs[i])
                };
            }
            for (var j = 0, g = inputarr.length; j < g; j++) {
                var item = inputarr[j],
                    initValue = item.value,
                    _value = !+"\v1" ? item['data-init'] : item.getAttribute('data-init');
                //item.value="";
                var text;
                if (_value != '') {
                    text = LET.createElement('span', {
                        innerHTML: _value
                    }, null, item, 'before');
                }
                LET.addEvent(text, "click", function (e) {
                    item.focus();
                });
                LET.addEvent(item, "focus", function (e) {
                    if (text) {
                        LET.removeNode(text);
                        text = null;
                    } else {
                        if (this.value == initValue) {
                            this.value = "";
                        }
                    }
                });
            }
        }
    });
})();
