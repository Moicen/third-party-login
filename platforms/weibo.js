const Promise = require("bluebird");
const request = Promise.promisify(require("request"));
const config = require("./config").weibo;

const urls = {
    auth: () => {
        const url = [config.url.auth];
        const state = new Date().valueOf();
        url.push(`?client_id=${config.app.key}`);
        url.push(`&response_type=code&state=${state}`);
        url.push(`&redirect_uri=${encodeURIComponent(config.redirect)}`);
        return url.join("");
    },
    token: (code) => {
        var url = [config.url.token];
        url.push(`?client_id=${config.app.key}`);
        url.push(`&client_secret=${config.app.secret}`);
        url.push("&grant_type=authorization_code");
        url.push(`&redirect_uri=${encodeURIComponent(config.url.callback)}`);
        url.push(`&code=${code}`);
        return url.join("");
    },
    user: (token, uid) => {
        return `${config.url.user}?access_token=${token}&uid=${uid}`;
    }
};

const user = (token, uid, req, res, next) => {
    let url = urls.user(token, uid);
    const opts = {url: url, method: "GET", json: true};
    return request(opts).then((response) => response.body).then((data) => {
        config.callbacks.success(data, req, res, next);
    });
};

const token = (req, res, next) => {
    let code = req.query.code;
    if (!code) return Promise.reject(new Error("'auth_code' is empty."));

    const options = {
        url: urls.token(code),
        method: "POST",
        json: true
    };
    return request(options).then((response) => response.body).then((data) => {
        if (config.loadUserInfo) {
            return user(data.access_token, data.uid, req, res, next)
        } else {
            config.callbacks.success(data, req, res, next);
        }
    });
};

module.exports = {
    urls: urls,
    token: token
};
