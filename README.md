# third-party-login
third party login plugin

    npm install third-party-login --save
    

currently available for [weibo](https://weibo.com), [wechat](http://weixin.qq.com), [alipay](https://www.alipay.com)

will add [github](https://github.com) [douban](https://douban.com) [taobao](https://www.taobao.com) [jd](https://www.jd.com) soon.

usage: 
    
    const express = require('express');
    const router = express.Router();
        
    const config = require("./config");
    const login = require("third-party-login");
        
    login.init(config);
        
    router.get("/login/weibo", login.weibo.auth);
    router.get("/login/callback/weibo", login.weibo.token);
        
    router.get("/login/weixin", login.weixin.auth);
    router.get("/login/callback/weixin", login.weixin.token);
        
    router.get("/login/alipay", login.alipay.auth);
    router.get("/login/callback/alipay", login.alipay.token);;


`config`:

    {
        loadUserInfo: true,
        weibo: {
            redirect: "",
            app: {
                id: "",
                secret: ""
            },
            callbacks: {
                success: (data, req, res, next) => {
    
                },
                failure: (err, req, res, next) => {
    
                }
            }
        },
        weixin: {
            redirect: "",
            app: {
                id: "",
                secret: ""
            },
            scope: "snsapi_login",
            callbacks: {
                success: () => {
    
                },
                failure: () => {
    
                }
            }
        },
        alipay: {
            redirect: "",
            app: {
                id: ""
            },
            keys: {
                public: "",
                private: ""
            },
            scope: "auth_user",
            callbacks: {
                success: (req, res, next, data) => {
    
                },
                failure: (req, res, next, err) => {
    
                }
            }
        }
    }
    
field explain for `config`

- Common config
    
    `loadUserInfo`: if you want to load user info after you get token. set to `true` to load user info by token. Or `false` if `uid` is all you want.

- platform config

    `redirect`: redirect url for platform after user login and authorized.
    
    `app`: your developer info of the platform. Get this on your developer's app page of the platform
        
    - `id`: app id
    - `secret`: app secret

    `scope`: authorize scope
    
    `keys`: public key and private key to sign and verify.(alipay only)
    
    - `private`: private key you generate by alipay's key tool.(for parameter sign)
    - `public`: alipay generated public key after you uploaded your public key.(for response verify)
    
    `callbacks`: callback function to handle response data
    
    - `success`: callback for success response data(token or user info)
    - `failure`: callback for failed response or error