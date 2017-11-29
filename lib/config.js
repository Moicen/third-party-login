/**
 * config file
 * will merge user config data
 */

module.exports = {
    weibo: {
        api: {
            auth: "https://api.weibo.com/oauth2/authorize",
            token: "https://api.weibo.com/oauth2/access_token",
            user: "https://api.weibo.com/2/users/show.json"
        }
    },
    weixin: {
        api: {
            auth: "https://open.weixin.qq.com/connect/qrconnect",
            token: "https://api.weixin.qq.com/sns/oauth2/access_token",
            user: "https://api.weixin.qq.com/sns/userinfo"
        }
    },
    alipay: {
        api: {
            auth: "https://openauth.alipay.com/oauth2/publicAppAuthorize.htm",
            gateway: "https://openapi.alipay.com/gateway.do"
        }
    }
};