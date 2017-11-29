const Promise = require("bluebird");
const request = Promise.promisify(require("request"));
const utils = require("../lib/utils");

const urls = {
    auth: (config) => {
        const url = [config.api.auth];
        const state = new Date().valueOf();
        url.push(`?app_id=${config.app.id}`);
        url.push(`&scope=${config.scope}`);
        url.push(`&state=${state}`);
        url.push(`&redirect_uri=${encodeURIComponent(config.redirect)}`);
        return url.join("");
    },
    token: (config, code) => {
        const params = {
            app_id: config.app.id,
            method: "alipay.system.oauth.token",
            format: "json",
            charset: "utf-8",
            sign_type: "RSA2",
            timestamp: utils.timestamp(),
            version: "1.0",
            grant_type: "authorization_code",
            code: code
        };
        params.sign = utils.sign(config.keys.private, params);

        return {url: config.api.gateway, params: params};
    },
    user: (config, token) => {
        const params = {
            app_id: config.app.id,
            method: "alipay.user.info.share",
            format: "json",
            charset: "utf-8",
            sign_type: "RSA2",
            timestamp: utils.timestamp(),
            version: "1.0",
            auth_token: token
        };
        params["sign"] = utils.sign(config.keys.private, params);
        return {url: config.api.gateway, params: params};
    }
};

const tool = {
    option: (opt) => {
        return {
            url: opt.url,
            json: true,
            form: opt.params,
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded;charset=utf-8"
            }
        };
    },
    parse: (response) => {
        let body = response.body;
        if ((body.code && body.code !== "10000") || body.error_response) {
            throw new Error(`Response error, code: ${body.code}\nmessage: ${body.error_response}`);
        }
        return body;
    }
};

const handler = {
    user: (config, token, req, res, next) => {
        const options = tool.option(urls.user(config, token));
        return request(options)
            .then(tool.parse)
            .then((body) => body.alipay_user_info_share_response)
            .then((info) => {
                let valid = utils.verify(config.keys.public, info);
                if (!valid) throw new Error("Response verify failed.");
                return info;
            })
            .then((data) => {
                config.callbacks.success(data, req, res, next);
            });
    },
    token: (config, req, res, next) => {
        let code = req.query.auth_code;
        if (!code) return Promise.reject(new Error("'auth_code' is empty."));

        const options = tool.option(urls.token(config, code));
        return request(options)
            .then(tool.parse)
            .then((body) => body.alipay_system_oauth_token_response)
            .then((info) => {
                let valid = utils.verify(config.keys.public, info);
                if (!valid) throw new Error("Response verify failed.");
                return info;
            })
            .then((data) => {
                if (config.loadUserInfo) {
                    return handler.user(config, data.access_token, req, res, next);
                } else {
                    config.callbacks.success(data, req, res, next);
                }
            });
    }
};


module.exports = {
    auth: urls.auth,
    token: handler.token
};