const config = require("./lib/config");
const platforms = require("./platforms");
const fs = require("fs");
const path = require("path");
const utils = require("./lib/utils");

const names = ["weibo", "weixin", "alipay"];

exports.init = (options) => {
    if (!options) throw new Error("options is required!");

    if (typeof options === "string") {
        let pathname = path.join(process.cwd(), options);
        if (!fs.existsSync(pathname)) {
            throw new Error(`Can not find config file at ${options}`);
        }
        options = require(pathname);
    }
    for (let key in config) {
        if (config.hasOwnProperty(key)) {
            let platform = config[key];
            if (typeof platform === "object") {
                config[key] = Object.assign(platform, options[key]);
                config[key].loadUserInfo = options.loadUserInfo;
            }
        }
    }
};

names.forEach((name) => {
    exports[name] = {
        auth: (req, res, next) => {
            const url = utils.url("auth");
            res.redirect(url);
        },
        token: (req, res, next) => {
            const opt = config[name];
            Promise.resolve(platforms[name].token(req, res, next, opt))
                .catch((err) => { opt.callbacks.failure(err, req, res, next); });
        }
    }
});