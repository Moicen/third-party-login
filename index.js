const config = require("./lib/config");

const names = ["weibo", "weixin", "qq", "alipay"];

exports.init = (options) => {
    if (!options) throw new Error("options is required!");

    names.forEach((name) => {
        if (options.hasOwnProperty(name)) {
            config[name] = Object.assign({loadUserInfo: options.loadUserInfo}, config[name], options[name]);
        }

        const platform = require(`./platforms/${name}`);
        exports[name] = (() => {
            return {
                auth: (req, res, next) => {
                    res.redirect(platform.auth());
                },
                token: (req, res, next) => {
                    Promise.resolve(platform.token(req, res, next))
                        .catch((err) => {
                            config[name].callbacks.failure(err, req, res, next);
                        });
                }
            };
        })();
    });
};