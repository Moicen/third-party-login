

const urls = {
    auth: (opt) => {
        const url = [opt.url.auth];
        const state = new Date().valueOf();
        url.push(`?appid=${opt.app.key}`);
        url.push(`&redirect_uri=${encodeURIComponent(opt.url.callback)}`);
        url.push(`?scope=${opt.scope}`);
        url.push(`&response_type=code&state=${state}`);
        url.push("#wechat_redirect");
        return url.join("");
    },
    token: (opt, code) => {
        var url = [opt.url.token];
        url.push(`?appid=${opt.app.key}`);
        url.push(`&secret=${opt.app.secret}`);
        url.push("&grant_type=authorization_code");
        url.push(`&code=${code}`);
        return url.join("");
    },
    user: (opt, token, uid) => {
        return `${opt.url.user}?access_token=${token}&openid=${uid}`;
    }
};



module.exports = {
	urls: urls,
	dict: {
        code: "code",
        uid: "uid",
        token: "access_token"
    },
    api: {
        auth: "https://open.weixin.qq.com/connect/qrconnect",
        token: "https://api.weixin.qq.com/sns/oauth2/access_token",
        user: "https://api.weixin.qq.com/sns/userinfo"
    },
}


const handler = {
	token: function (req, res, next) {
        var code = req.query.code;
        //未授权
        if(!code){
            res.redirect("/");
            return;
        }
        var options = {
            url: tool.url("weixin", "token", code),
            method: "POST"
        };
        request(options, function(err, response, body) {
            logger.writeInfo("weixin auth response: " + JSON.stringify(response));
            if(err || !body){
                logger.writeErr("weixin auth error: " + JSON.stringify(err));
                failure(res, "用户授权验证失败！");
                return;
            }
            if(typeof body === "string") body = JSON.parse(body);
            weixin.user(body.openid, body.access_token, req, res);
        });
    },
    user: function (uid, token, req, res) {
        var opt = {
            url: tool.url("weixin", "user", token, uid),
            method: "GET"
        };
        request(opt, function (err, response, body) {
            if(err){
                logger.writeErr("Get user info error: " + JSON.stringify(err));
                failure(res, "获取用户信息失败！");
            }
            var user = JSON.parse(body);
            var param = {
                thirdPartyId: uid,
                appName: "weixin",
                loginName: user.nickname
            };
            login(req, res, param);
        });
    }
}