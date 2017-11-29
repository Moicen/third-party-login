const Promise = require("bluebird");
const request = Promise.promisify(require("request"));


const urls = {
    auth: (config) => {
        const url = [config.api.auth];
        url.push(`?client_id=${config.app.id}`);
        url.push(`&redirect_uri=${encodeURIComponent(config.url.callback)}`);
        url.push(`&scope=${config.scope}`);
        url.push(`&response_type=code`);
        return url.join("");
    },
    token: (config, code) => {
        const url = [config.api.token];
        const state = new Date().valueOf();
        url.push(`?client_id=${config.app.id}`);
        url.push(`&client_secret=${config.app.secret}`);
        url.push("&grant_type=authorization_code");
        url.push(`&code=${code}&state=${state}`);
        url.push(`&redirect_uri=${encodeURIComponent(config.redirect)}`);
        return url.join("");
    },
    uid: (config, token) => {
        return `${config.api.uid}?access_token=${token}`;
    },
    user: (config, token, uid) => {
        const url = [config.api.user];
        url.push(`?access_token=${token}`);
        url.push(`&oauth_consumer_key=${config.app.id}`);
        url.push(`&openid=${uid}`);
        return url.join("");
    }
};


const handler = {
    user: (config, token, uid, req, res, next) => {
        let url = urls.user(config, token, uid);
        const opts = {url: url, method: "GET", json: true};
        return request(opts).then((response) => response.body).then((data) => {
            config.callbacks.success(data, req, res, next);
        });
    },
    uid: (config, token, req, res, next) => {
        let url = urls.uid(config, token);
        const opts = {url: url, method: "GET", json: true};
        return request(opts).then((response) => response.body).then((data) => {
            if (config.loadUserInfo) {
                return handler.user(config, token, data.openid, req, res, next)
            } else {
                config.callbacks.success(data, req, res, next);
            }
        });
    },
    token: (config, req, res, next) => {
        let code = req.query.code;
        if (!code) return Promise.reject(new Error("'auth_code' is empty."));

        const options = { url: urls.token(config, code), method: "POST", json: true };
        return request(options).then((response) => response.body).then((data) => {
            return handler.uid(config, data.access_token, req, res, next);
        });
    }
};


module.exports = {
    auth: urls.auth,
    token: handler.token
};