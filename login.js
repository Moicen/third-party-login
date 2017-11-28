const api = require("./lib/api");
const platforms = require("./platforms");
const fs = require("fs");
const path = require("path");
const utils = require("./lib/utils");

let config = {};


const callbacks = {
    token: (target, req, res, next) => {
        const opt = config[target];
        var code = req.query.code;
        //未授权
        if(!code){
            opt.fail(req, res, next, "can not get auth code");
            return;
        }
        var options = {
            url: utils.url(platforms[target], "token", opt, code),
            method: "POST"
        };
        request(options, function(err, response, body) {
            if(err || !body){
                opt.fail(req, res, next, "auth failed");
                return;
            }
            if(typeof body === "string") body = JSON.parse(body);
            weibo.user(body.uid, body.access_token, req, res);
        });
    },
    user: (uid, token, req, res) => {
        var opt = {
            url: utils.url(platforms[target], "user", opt, token, uid),
            method: "GET"
        };
        request(opt, function (err, response, body) {
            if(err){
                opt.fail(req, res, next, "get user info failed.");
            }
            var user = JSON.parse(body);
            var param = {
                thirdPartyId: uid,
                appName: "weibo",
                loginName: user.screen_name
            };
            login(req, res, param);
        });
    }
}



module.exports = {
    init: (options) => {
        if(typeof options === "string"){
            let pathname = path.join(process.cwd(), options);
            if(!fs.existsSync(pathname)){
                throw Error(`Can not find config file at ${options}`);
            }
            options = require(pathname);
        }
        config = Object.assign({}, options);

        for(let key in config){
            if(config.hasOwnProperty(key)){
                let platform = config[key];
                if(typeof platform === "object"){
                    platform.api = api[key];
                }
            }
        }

    },

    auth: (res, target, step) => {
        const url = utils.url(platforms[target], step);
        res.redirect(url);
    },
    token: (req, res, next, target) => {
        const opt = config[target];
        platforms[target].callbacks.token(req, res, next, opt);

    },
    user: (req, res, next) => {
        const platform = platforms[target];
    }
}