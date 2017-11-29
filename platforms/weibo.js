const Promise = require("bluebird");
const request = Promise.promisify(require("request"));
const config = require("../lib/config").weibo;

const urls = {
    auth: () => {
        const url = [config.api.auth];
        const state = new Date().valueOf();
        url.push(`?client_id=${config.app.id}`);
        url.push(`&response_type=code&state=${state}`);
        url.push(`&redirect_uri=${encodeURIComponent(config.redirect)}`);
        return url.join("");
    },
    token: (code) => {
        const url = [config.api.token];
        url.push(`?client_id=${config.app.id}`);
        url.push(`&client_secret=${config.app.secret}`);
        url.push("&grant_type=authorization_code");
        url.push(`&redirect_uri=${encodeURIComponent(config.redirect)}`);
        url.push(`&code=${code}`);
        return url.join("");
    },
    user: (token, uid) => {
        return `${config.api.user}?access_token=${token}&uid=${uid}`;
    }
};

const handler = {
    user: (token, uid, req, res, next) => {
        let url = urls.user(token, uid);
        const opts = {url: url, method: "GET", json: true};
        return request(opts).then((response) => response.body).then((data) => {
            config.callbacks.success(data, req, res, next);
        });
    },
    token: (req, res, next) => {
        let code = req.query.code;
        if (!code) return Promise.reject(new Error("'auth_code' is empty."));

        const options = {
            url: urls.token(code),
            method: "POST",
            json: true
        };
        return request(options).then((response) => response.body).then((data) => {
            if (config.loadUserInfo) {
                return handler.user(data.access_token, data.uid, req, res, next)
            } else {
                config.callbacks.success(data, req, res, next);
            }
        });
    }
};

module.exports = {
    auth: urls.auth(),
    token: handler.token
};
