const utils = require("../lib/utils");

const urls = {
    auth: (opt) => {
        const url = [opt.url.auth];
        const state = new Date().valueOf();
        url.push(`?app_id=${opt.app.key}`);
        url.push(`&scope=${opt.scope}`);
        url.push(`&state=${state}`);
        url.push(`&redirect_uri=${encodeURIComponent(opt.url.callback)}`);
        return url.join("");
    },
    token: (opt, code) => {
        const params = {
            app_id: opt.app.key,
            method: "alipay.system.oauth.token",
            format: "json",
            charset: "utf-8",
            sign_type: "RSA2",
            timestamp: utils.timestamp(),
            version: "1.0",
            grant_type: "authorization_code",
            code: code
        };
        params.sign = utils.sign(opt.keys.private, params);

        return { url: opt.url.gateway, params: params };
    },
    user: (opt, token, uid) => {
    	var opt = settings.alipay;
        var params = {
            app_id: opt.app.key,
            method: "alipay.user.info.share",
            format: "json",
            charset: "utf-8",
            sign_type: "RSA2",
            timestamp: utils.timestamp(),
            version: "1.0",
            auth_token: token
        };
        params["sign"] = utils.sign(opt.keys.private, params);
		return { url: opt.url.gateway, params: params };
    }
};

module.exports = {
	urls: urls,
	dict: {
        code: "code",
        uid: "",
        token: (body) => body.alipay_system_oauth_token_response.access_token,
        user: (body) => body.alipay_user_info_share_response;
    },
    api: {
        auth: "https://openauth.alipay.com/oauth2/publicAppAuthorize.htm",
        gateway: "https://openapi.alipay.com/gateway.do"
    }
}

const options = (url, params) => {
    return  {
        url: url,
        json: true,
        form: params,
        headers: {
            "content-type": "application/x-www-form-urlencoded;charset=utf-8"
        }
    };
};

const handler = {

    token: function (req, res, next) {
        var code = req.query.auth_code;
        //未授权
        if(!code){
            res.redirect("/");
            return;
        }
        var opt = tool.url("alipay", "token", code);
        var options = alipay.options(opt.url, opt.params);
        request.post(options, function(err, response, body) {
            logger.writeInfo("alipay token response: " + JSON.stringify(body));
            if(err){
                logger.writeErr("alipay token request error: " + JSON.stringify(err));
                failure(res, "用户授权验证失败！");
                return;
            }
            if((body.code && body.code !== "10000") || body.error_response){
                logger.writeErr("alipay token error: " + JSON.stringify(body));
                failure(res, "用户授权验证失败！");
                return;
            }
            var token = body.alipay_system_oauth_token_response.access_token;
            alipay.user(token, req, res);
        });
    },
    user: function (token, req, res) {
        var opt = tool.url("alipay", "user", token);
        var options = alipay.options(opt.url, opt.params);
        request.post(options, function (err, response, body) {
            logger.writeInfo("alipay get user response: " + JSON.stringify(body));
            if(err){
                logger.writeErr("alipay get user info request error: " + JSON.stringify(err));
                failure(res, "获取用户信息失败！");
                return;
            }
            if((body.code && body.code !== "10000")){
                logger.writeErr("alipay get user info error: " + JSON.stringify(body));
                failure(res, "获取用户信息失败！");
                return;
            }
            var user  = body.alipay_user_info_share_response;
            var param = {
                thirdPartyId: user.user_id,
                appName: "alipay",
                loginName: user.nick_name
            };
            login(req, res, param);
        });
    }
}