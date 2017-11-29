const config = require("./lib/config");
const platforms = require("./platforms");

const names = ["weibo", "weixin", "qq", "alipay"];


exports.init = (options) => {
    if (!options) throw new Error("options is required!");

    names.forEach((name) => {
        if (options.hasOwnProperty(name)) {
            let platform = config[name];
            config[name] = Object.assign({loadUserInfo: options.loadUserInfo}, platform, options[name]);
        }
    });
};

names.forEach((name) => {
    const platform = require(`./platforms/${name}`);
    const option = config[name];

    exports[name] = {
        auth: (req, res, next) => {
            res.redirect(platform.auth(option));
        },
        token: (req, res, next) => {
            Promise.resolve(platforms[name].token(option, req, res, next))
                .catch((err) => {
                    option.callbacks.failure(err, req, res, next);
                });
        }
    }
});