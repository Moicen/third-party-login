/**
 * some utils
 *
 */

const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

/**
 * read key from .pem file
 * @param {string} pathname - .pem file path
 * @return {string} key's content
 */
const read = (pathname) => {
    let pem = path.join(process.cwd(), pathname);
    if (!fs.existsSync(pem)) {
    	console.error(`pem file [${pem}] not exist.`)
        return "";
    }
    return fs.readFileSync(pem).toString();
};

/**
 * transform object params to ali's sign content
 * @param {object} params - parameters object
 * @return {string} content to be used in sign and verify
 */
const transform = (params) => {
    const names = [], contents = [];
    for (let name in params) {
        //skip empty parameters and sign
        if (params[name] && name !== "sign") {
            names.push(name);
        }
    }
    names.sort().forEach((name) => {
        contents.push(`${name}=${params[name]}`);
    });
    return contents.join("&");
};

/**
 * add padding 0 to number
 * @param {number} num - number to be padded
 * @return {string} padded number
 */
const padding = (num) => {
    return (num < 10 ? "0" + num : num).toString();
};

/**
 * Generate a timestamp of current
 * format: yyyy-MM-dd HH:mm:ss
 * @return {string} timestamp
 */
const timestamp = () => {
	const date = new Date();
	let year = date.getFullYear(),
		mon = padding(date.getMonth() + 1),
		day = padding(date.getDate()),
		hour = padding(date.getHours()),
		min = padding(date.getMinutes()),
		sec = padding(date.getSeconds());
    return `${year}-${mon}-${day} ${hour}:${min}:${sec}`;
}

module.exports = {
	read: read,
    padding: padding,
    timestamp: timestamp,
    url: (platform, step) => {
        let args = [].slice.apply(arguments, [2]);
        return platform.urls[step].apply(null, args);
    },
    sign: (key, params) => {
        const sign = crypto.createSign('RSA-SHA256');
        let content = transform(params);
        sign.update(content);
        return sign.sign(key, 'base64');
    },
    verify: (key, params) => {
        const verify = crypto.createVerify("RSA-SHA256");
        let signature = params.sign;
        let content = transform(params);
        verify.update(content);
        return verify.verify(key, signature, "base64");
    }
};
