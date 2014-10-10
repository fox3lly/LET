(function () {
    LET.login = function(){
    	return new LET.Login();
	};
    LET.Login = Class.extend({
        init: function (option) {
            var SL = LET.getCookie('SUP') || LET.getCookie('LUP');
            SL = decodeURIComponent(SL);
            var userinfo = this.getQueryString(SL);
            var username = userinfo.nick || userinfo.email;
            var userdata = LET.$('username');
            if (username) {
                var login = userdata.innerHTML;
                userdata.innerHTML = "\u60a8\u597d\uff0c" + username;
                LET.addClassName(LET.$('userlogin'), 'none');
                LET.removeClassName(LET.$('userinfo'), 'none');
            }
            var logout = LET.$('userlogout');
            logout.onclick = function () {
                LET.deleteCookie('SUP', '.sina.com.cn');
                LET.deleteCookie('LUP', '.sina.com.cn');
                LET.removeClassName(LET.$('userlogin'), 'none');
                LET.addClassName(LET.$('userinfo'), 'none');
            }
        },
        getQueryString: function (q) {
            var result = {}, queryString = q,
                re = /([^&=]+)=([^&]*)/g,
                m;
            while (m = re.exec(queryString)) {
                result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
            }
            return result;
        }
    });
})();
