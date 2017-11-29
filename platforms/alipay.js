const Promise = require("bluebird");
const request = Promise.promisify(require("request"));
const utils = require("../lib/utils");
const config = require("./config").alipay;

const urls = {
    auth: () => {
        const url = [config.url.auth];
        const state = new Date().valueOf();
        url.push(`?app_id=${config.app.key}`);
        url.push(`&scope=${config.scope}`);
        url.push(`&state=${state}`);
        url.push(`&redirect_uri=${encodeURIComponent(config.url.callback)}`);
        return url.join("");
    },
    token: (code) => {
        const params = {
            app_id: config.app.key,
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

        return {url: config.url.gateway, params: params};
    },
    user: (token) => {
        const params = {
            app_id: config.app.key,
            method: "alipay.user.info.share",
            format: "json",
            charset: "utf-8",
            sign_type: "RSA2",
            timestamp: utils.timestamp(),
            version: "1.0",
            auth_token: token
        };
        params["sign"] = utils.sign(config.keys.private, params);
        return {url: config.url.gateway, params: params};
    }
};


const getOption = (opt) => {
    return {
        url: opt.url,
        json: true,
        form: opt.params,
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded;charset=utf-8"
        }
    };
};

const parse = (response) => {
    let body = response.body;
    if ((body.code && body.code !== "10000") || body.error_response) {
        throw new Error(`Response error, code: ${body.code}\nmessage: ${body.error_response}`);
    }
    return body;
};

const verify = (info) => {
    let valid = utils.verify(config.keys.public, info);
    if (!valid) throw new Error("Response verify failed.");
    return info;
};

const user = (token, req, res, next) => {
    const options = getOption(urls.user(token));
    return request(options)
        .then(parse)
        .then((body) => body.alipay_user_info_share_response)
        .then(verify)
        .then((data) => {
            config.callbacks.success(data, req, res, next);
        });
};

const token = function (req, res, next) {
    let code = req.query.auth_code;
    if (!code) return Promise.reject(new Error("'auth_code' is empty."));

    const options = getOption(urls.token(code));
    return request(options)
        .then(parse)
        .then((body) => body.alipay_system_oauth_token_response)
        .then(verify)
        .then((data) => {
            if (config.loadUserInfo) {
                return user(data.access_token, req, res, next);
            } else {
                config.callbacks.success(data, req, res, next);
            }
        });
};


module.exports = {
    urls: urls,
    token: token
};