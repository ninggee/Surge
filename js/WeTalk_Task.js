/**
 * WeTalk_Task.js
 * Surge 定时任务移植版
 *
 * 存储键：wetalk_accounts_v1
 *
 * 功能：
 * 1. 每日签到
 * 2. 视频奖励
 * 3. 多账号支持
 */


/* ================= 配置区域 ================= */

const API_HOST = "api.wetalkapp.com";

const SECRET = "0fOiukQq7jXZV2GRi9LGlO";

const STORE_KEY = "wetalk_accounts_v1";

// 总开关
const TASK_ENABLED = true;

// 是否签到
const ENABLE_CHECKIN = true;

// 是否领取视频奖励
const ENABLE_VIDEO = true;

// 最大视频奖励次数
const MAX_VIDEO = 5;

// 视频奖励间隔
const VIDEO_DELAY_MS = 8000;

// 账号切换间隔
const ACCOUNT_GAP_MS = 3500;

// User-Agent 版本池
const IOS_VER = [
    "17.5.1",
    "17.6.1",
    "17.4.1",
    "18.0.1"
];

const MODELS = [
    "iPhone14,3",
    "iPhone15,3",
    "iPhone16,1"
];


/* ================= MD5 算法 ================= */

function MD5(s) {
    function RL(v, n) {
        return (v << n) | (v >>> (32 - n));
    }

    function AU(x, y) {
        var x4 = x & 0x40000000;
        var y4 = y & 0x40000000;
        var x8 = x & 0x80000000;
        var y8 = y & 0x80000000;

        var r = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);

        if (x4 & y4)
            return r ^ 0x80000000 ^ x8 ^ y8;

        if (x4 | y4)
            return (r & 0x40000000)
                ? (r ^ 0xC0000000 ^ x8 ^ y8)
                : (r ^ 0x40000000 ^ x8 ^ y8);

        return r ^ x8 ^ y8;
    }

    function F(x, y, z) {
        return (x & y) | ((~x) & z);
    }

    function G(x, y, z) {
        return (x & z) | (y & (~z));
    }

    function H(x, y, z) {
        return x ^ y ^ z;
    }

    function I(x, y, z) {
        return y ^ (x | (~z));
    }

    function FF(a, b, c, d, x, s, ac) {
        a = AU(a, AU(AU(F(b, c, d), x), ac));
        return AU(RL(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
        a = AU(a, AU(AU(G(b, c, d), x), ac));
        return AU(RL(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
        a = AU(a, AU(AU(H(b, c, d), x), ac));
        return AU(RL(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
        a = AU(a, AU(AU(I(b, c, d), x), ac));
        return AU(RL(a, s), b);
    }

    function CWA(str) {
        var ml = str.length;
        var t1 = ml + 8;
        var t2 = (t1 - (t1 % 64)) / 64;
        var nw = (t2 + 1) * 16;

        var wa = Array(nw).fill(0);
        var bp = 0;
        var bc = 0;

        while (bc < ml) {
            var wc = (bc - (bc % 4)) / 4;
            bp = (bc % 4) * 8;
            wa[wc] |= str.charCodeAt(bc) << bp;
            bc++;
        }

        var wc = (bc - (bc % 4)) / 4;
        bp = (bc % 4) * 8;

        wa[wc] |= 0x80 << bp;
        wa[nw - 2] = ml << 3;
        wa[nw - 1] = ml >>> 29;

        return wa;
    }

    function W2H(v) {
        var r = '';

        for (var i = 0; i <= 3; i++) {
            var b = (v >>> (i * 8)) & 255;
            var t = '0' + b.toString(16);
            r += t.substr(t.length - 2, 2);
        }

        return r;
    }

    var x = CWA(s);
    var a = 0x67452301;
    var b = 0xEFCDAB89;
    var c = 0x98BADCFE;
    var d = 0x10325476;

    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    for (var k = 0; k < x.length; k += 16) {
        var AA = a, BB = b, CC = c, DD = d;

        a = FF(a,b,c,d,x[k+0],S11,0xD76AA478);
        d = FF(d,a,b,c,x[k+1],S12,0xE8C7B756);
        c = FF(c,d,a,b,x[k+2],S13,0x242070DB);
        b = FF(b,c,d,a,x[k+3],S14,0xC1BDCEEE);

        a = FF(a,b,c,d,x[k+4],S11,0xF57C0FAF);
        d = FF(d,a,b,c,x[k+5],S12,0x4787C62A);
        c = FF(c,d,a,b,x[k+6],S13,0xA8304613);
        b = FF(b,c,d,a,x[k+7],S14,0xFD469501);

        a = FF(a,b,c,d,x[k+8],S11,0x698098D8);
        d = FF(d,a,b,c,x[k+9],S12,0x8B44F7AF);
        c = FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b = FF(b,c,d,a,x[k+11],S14,0x895CD7BE);

        a = FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d = FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c = FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b = FF(b,c,d,a,x[k+15],S14,0x49B40821);

        a = GG(a,b,c,d,x[k+1],S21,0xF61E2562);
        d = GG(d,a,b,c,x[k+6],S22,0xC040B340);
        c = GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b = GG(b,c,d,a,x[k+0],S24,0xE9B6C7AA);

        a = GG(a,b,c,d,x[k+5],S21,0xD62F105D);
        d = GG(d,a,b,c,x[k+10],S22,0x02441453);
        c = GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b = GG(b,c,d,a,x[k+4],S24,0xE7D3FBC8);

        a = GG(a,b,c,d,x[k+9],S21,0x21E1CDE6);
        d = GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c = GG(c,d,a,b,x[k+3],S23,0xF4D50D87);
        b = GG(b,c,d,a,x[k+8],S24,0x455A14ED);

        a = GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d = GG(d,a,b,c,x[k+2],S22,0xFCEFA3F8);
        c = GG(c,d,a,b,x[k+7],S23,0x676F02D9);
        b = GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);

        a = HH(a,b,c,d,x[k+5],S31,0xFFFA3942);
        d = HH(d,a,b,c,x[k+8],S32,0x8771F681);
        c = HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b = HH(b,c,d,a,x[k+14],S34,0xFDE5380C);

        a = HH(a,b,c,d,x[k+1],S31,0xA4BEEA44);
        d = HH(d,a,b,c,x[k+4],S32,0x4BDECFA9);
        c = HH(c,d,a,b,x[k+7],S33,0xF6BB4B60);
        b = HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);

        a = HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d = HH(d,a,b,c,x[k+0],S32,0xEAA127FA);
        c = HH(c,d,a,b,x[k+3],S33,0xD4EF3085);
        b = HH(b,c,d,a,x[k+6],S34,0x04881D05);

        a = HH(a,b,c,d,x[k+9],S31,0xD9D4D039);
        d = HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c = HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b = HH(b,c,d,a,x[k+2],S34,0xC4AC5665);

        a = II(a,b,c,d,x[k+0],S41,0xF4292244);
        d = II(d,a,b,c,x[k+7],S42,0x432AFF97);
        c = II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b = II(b,c,d,a,x[k+5],S44,0xFC93A039);

        a = II(a,b,c,d,x[k+12],S41,0x6559C3);
        d = II(d,a,b,c,x[k+3],S42,0x8F0CCC92);
        c = II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b = II(b,c,d,a,x[k+1],S44,0x85845DD1);

        a = II(a,b,c,d,x[k+8],S41,0x6FA87E4F);
        d = II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c = II(c,d,a,b,x[k+6],S43,0xA3014314);
        b = II(b,c,d,a,x[k+13],S44,0x4E0811A1);

        a = II(a,b,c,d,x[k+4],S41,0xF7537E82);
        d = II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c = II(c,d,a,b,x[k+2],S43,0x2AD7D2BB);
        b = II(b,c,d,a,x[k+9],S44,0xEB86D391);

        a = AU(a,AA);
        b = AU(b,BB);
        c = AU(c,CC);
        d = AU(d,DD);
    }

    return (W2H(a) + W2H(b) + W2H(c) + W2H(d)).toLowerCase();
}


/* ================= 工具函数 ================= */

function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

function pick(arr, seed) {
    return arr[seed % arr.length];
}

function buildUA(base, seed) {
    var iv = pick(IOS_VER, seed);
    var mo = pick(MODELS, seed + 2);

    if (base && typeof base === "string") {
        var ua = base;

        ua = ua.replace(
            /iOS \d+(\.\d+){0,2}/,
            "iOS " + iv
        );

        ua = ua.replace(
            /iPhone\d+,\d+/,
            mo
        );

        return ua;
    }

    return "WeTalk/30.6.0 (com.innovationworks.wetalk; build:28; iOS "
        + iv + ") Alamofire/5.4.3";
}


/**
 * 生成签名参数
 */
function signedParams(capture) {
    var p = {};

    Object.keys(capture.paramsRaw || {}).forEach(function (k) {
        if (k !== "sign" && k !== "signDate") {
            p[k] = capture.paramsRaw[k];
        }
    });

    var n = new Date();

    function pad(x) {
        return String(x).padStart(2, "0");
    }

    p.signDate =
        n.getUTCFullYear() + "-" +
        pad(n.getUTCMonth() + 1) + "-" +
        pad(n.getUTCDate()) + " " +
        pad(n.getUTCHours()) + ":" +
        pad(n.getUTCMinutes()) + ":" +
        pad(n.getUTCSeconds());

    var base = Object.keys(p)
        .sort()
        .map(function (k) {
            return k + "=" + p[k];
        })
        .join("&");

    p.sign = MD5(base + SECRET);

    return p;
}


/**
 * GET 请求封装
 */
function httpGet(url, headers) {
    return new Promise(function (resolve, reject) {
        $httpClient.get(
            {
                url: url,
                headers: headers
            },
            function (error, response, data) {
                if (error) {
                    reject(new Error(error));
                    return;
                }

                if (!response) {
                    reject(new Error("无 HTTP 响应"));
                    return;
                }

                if (response.status < 200 || response.status >= 300) {
                    reject(new Error("HTTP " + response.status));
                    return;
                }

                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error("响应 JSON 解析失败"));
                }
            }
        );
    });
}


/**
 * 读取账号数据
 */
function readStore() {
    var raw = $persistentStore.read(STORE_KEY);

    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (e) {
        console.log("[WeTalk] 账号数据解析失败");
        return null;
    }
}


/* ================= 账号任务 ================= */

async function runAccount(acc, idx, total) {
    var label = "[" + (idx + 1) + "/" + total + " " + acc.alias + "]";

    console.log(label + " 开始处理");

    var capture = acc.capture;

    var ua = buildUA(acc.baseUA, acc.uaSeed);

    var headers = Object.assign({}, capture.headers || {});

    headers["User-Agent"] = ua;
    headers["Host"] = API_HOST;

    async function api(path) {
        var p = signedParams(capture);

        var qs = Object.keys(p)
            .map(function (k) {
                return k + "=" + encodeURIComponent(p[k]);
            })
            .join("&");

        var url = "https://" + API_HOST + "/app/" + path + "?" + qs;

        return await httpGet(url, headers);
    }

    var logs = [];

    try {
        // 每日签到
        if (ENABLE_CHECKIN) {
            var d = await api("checkIn");

            var msg = "[签到] ";

            if (d.retcode === 0) {
                msg += "成功";
            } else {
                msg += d.retmsg || "未知错误";
            }

            console.log(label + " " + msg);
            logs.push(msg);
        }

        // 视频奖励
        if (ENABLE_VIDEO) {
            for (var i = 1; i <= MAX_VIDEO; i++) {
                await sleep(i === 1 ? 1000 : VIDEO_DELAY_MS);

                var d = await api("videoBonus");

                var msg = "[视频" + i + "] ";

                if (d.retcode === 0) {
                    msg += "+" + (
                        d.result && d.result.bonus !== undefined
                            ? d.result.bonus
                            : "奖励"
                    );
                } else {
                    msg += d.retmsg || "未知错误";
                }

                console.log(label + " " + msg);
                logs.push(msg);

                if (d.retcode !== 0) {
                    break;
                }
            }
        }

    } catch (e) {
        var errorMsg = "[错误] " + e.message;

        console.log(label + " " + errorMsg);
        logs.push(errorMsg);
    }

    return label + "\n" + logs.join("\n");
}


/* ================= 主程序 ================= */

(async function () {
    console.log("[WeTalk] 定时任务启动");

    if (!TASK_ENABLED) {
        console.log("[WeTalk] 任务已关闭");
        $done();
        return;
    }

    var store = readStore();

    if (!store || !store.order || store.order.length === 0) {
        console.log("[WeTalk] 没有已保存的账号");

        $notification.post(
            "WeTalk",
            "签到任务",
            "没有发现已保存的账号，请先打开 WeTalk App"
        );

        $done();
        return;
    }

    var results = [];

    for (var i = 0; i < store.order.length; i++) {
        var id = store.order[i];
        var acc = store.accounts[id];

        if (!acc || !acc.capture) {
            console.log("[WeTalk] 跳过无效账号：" + id);
            continue;
        }

        var result = await runAccount(
            acc,
            i,
            store.order.length
        );

        results.push(result);

        if (i < store.order.length - 1) {
            await sleep(ACCOUNT_GAP_MS);
        }
    }

    console.log("[WeTalk] 所有任务执行完毕");

    $notification.post(
        "WeTalk 任务完成",
        "签到结果",
        results.join("\n\n")
    );

    $done();

})();
