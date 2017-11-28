const request = require("request");
const utils = require("../lib/utils");

const urls = {
    auth: (opt) => {
        const url = [opt.url.auth];
        const state = new Date().valueOf();
        url.push(`?client_id=${opt.app.key}`);
        url.push(`&response_type=code&state=${state}`);
        url.push(`&redirect_uri=${encodeURIComponent(opt.redirect)}`);
        return url.join("");
    },
    token: (opt, code) => {
        var url = [opt.url.token];
        url.push(`?client_id=${opt.app.key}`);
        url.push(`&client_secret=${opt.app.secret}`);
        url.push("&grant_type=authorization_code");
        url.push(`&redirect_uri=${encodeURIComponent(opt.url.callback)}`);
        url.push(`&code=${code}`);
        return url.join("");
    },
    user: (opt, token, uid) => {
        return `${opt.url.user}?access_token=${token}&uid=${uid}`;
    }
};


const failure = (opt, msg) => {
    return { action: opt.fail, message: msg };
}

const parse = (err, response, body, failure, req, res, next) => {
    if(err || !body){
        failure.action(req, res, next, failure.message);
        return false;
    }
    if(typeof body === "string") body = JSON.parse(body);
    return body;
};

const handlers = {
    token: (req, res, next, opt) => {
        const code = req.query.code;
        if(!code){
            opt.fail(req, res, next, "get authorization_code failed");
            return;
        }
        const options = {
            url: urls.token(opt, code),
            method: "POST"
        };
        request(options).then(() => {
            [].push.apply(arguments, [failure(opt, "authorize failed."), req, res, next]);
            let body = utils.res.call(null, arguments);
            if(!body) return;
            handlers.user(body.uid, body.access_token, req, res);
        }).catch((err) => { console.log("request error: ", err); });
    },
    user: (uid, token, req, res) => {
        var opt = {
            url: tool.url("weibo", "user", token, uid),
            method: "GET"
        };
        request(opt, (err, response, body) => {
            if(err){
                opt.fail(req, res, next, "get user info failed.");
                return;
            }
            user = JSON.parse(body);
            
        });
    }
}


module.exports = {
    urls: urls,
    dict: {
        code: "code",
        uid: "uid",
        token: "access_token"
    },
    api: {
        auth: "https://api.weibo.com/oauth2/authorize",
        token: "https://api.weibo.com/oauth2/access_token",
        user: "https://api.weibo.com/2/users/show.json"
    },
}
