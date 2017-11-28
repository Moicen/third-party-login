
const login = require("login");


exports.init = (options) => {
  if(!options) throw new Error("options is required!");
  login.init(options);
};

exports.weibo = {
	auth: (req, res, next) => {
		login.url(res, "weibo", "auth");
	},
	token: (req, res, next) => {

	},
	user: (req, res, next) => {

	}
};

exports.qq = {
	auth: (req, res, next) => {
		login.url(res, "qq", "auth");
	},
	token: (req, res, next) => {

	},
	user: (req, res, next) => {
		
	}
};

exports.weixin = {
	auth: (req, res, next) => {
		login.url(res, "weixin", "auth");
	},
	token: (req, res, next) => {

	},
	user: (req, res, next) => {
		
	}
};

exports.taobao = {
	auth: (req, res, next) => {
		login.url(res, "taobao", "auth");
	},
	token: (req, res, next) => {

	},
	user: (req, res, next) => {
		
	}
};

exports.alipay = {
	auth: (req, res, next) => {
		login.url(res, "alipay", "auth");
	},
	token: (req, res, next) => {

	},
	user: (req, res, next) => {
		
	}
};

exports.jd = {
	auth: (req, res, next) => {
		login.url(res, "jd", "auth");
	},
	token: (req, res, next) => {

	},
	user: (req, res, next) => {
		
	}
};

exports.github = {
	auth: (req, res, next) => {
		login.url(res, "github", "auth");
	},
	token: (req, res, next) => {

	},
	user: (req, res, next) => {
		
	}
};

exports.douban = {
	auth: (req, res, next) => {
		login.url(res, "douban", "auth");
	},
	token: (req, res, next) => {

	},
	user: (req, res, next) => {
		
	}
};