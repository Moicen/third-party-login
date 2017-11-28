module.exports = {
	loadUserInfo: true,
    weibo: {
        redirect: "http://www.westair.cn/login/callback/weibo",
        fail: (req, res, next, msg) => { res.redirect("/"); },
        app: {
            id: "2663330620",
            secret: "d02e7b6e78cbb20342182e495989fe07"
        }
    },
    weixin: {
        redirect: "http://www.westair.cn/login/callback/weixin",
        fail: (req, res, next, msg) => { res.redirect("/"); },
        app: {
            id: "wxcfc40bafa9e34f8b",
            secret: "52428b6bdfecb56f1280ec8198c0af26"
        },
        scope: "snsapi_login"
    },
    alipay: {
        redirect: "http://www.westair.cn/login/callback/alipay",
        fail: (req, res, next, msg) => { res.redirect("/"); },
        app: {
            id: "2017101909381867"
        },
        keys: {
        	server: "",
        	client: ""
        }
        scope: "auth_user"
    }
};