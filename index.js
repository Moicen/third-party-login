const config = require("./lib/config");
const platforms = require("./platforms");
const utils = require("./lib/utils");

const names = ["weibo", "weixin", "qq", "alipay"];

exports.init = (options) => {
    if (!options) throw new Error("options is required!");

    names.forEach((name) => {
        if(options.hasOwnProperty(name)){
            let platform = config[name];
            config[name] = Object.assign({ loadUserInfo: options.loadUserInfo }, platform, options[name]);
        }
    });
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