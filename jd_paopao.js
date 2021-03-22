/*
京东泡泡大战
Author: 799953468 https://github.com/799953468
更新时间：2020-11-05 07:45
[task_local]
# 京东抽奖机
2 0 * * * ./JD/jd_paopao.js, tag=京东泡泡大战, img-url=https://raw.githubusercontent.com/Orz-3/task/master/jd.png, enabled=true
*/
const $ = new Env('京东泡泡大战');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
} else {
    cookiesArr.push($.getdata('CookieJD'));
    cookiesArr.push($.getdata('CookieJD2'));
}
let message = '',
    UserName = '',
    subTitle = ''
const JD_API_HOST = 'https://api.m.jd.com/api';
!(async() => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', { "open-url": "https://bean.m.jd.com/" });
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
            console.log(`\n===============开始【京东账号${$.UserName}】==================\n`);
            $.errorMsg = '';
            $.index = i + 1;
            await activity_taskInfo();
            await activity();
            await share();
            await product();
            await shop();
            await prize_list();
            await rank();
            await showMsg();
        }
    }
})()
.catch((e) => {
    $.log('', `❌ ${$.UserName}, 失败! 原因: ${e}!`, '')
})

.finally(() => {
    $.done();
})

function showMsg() {
    if ($.isLogin) {
        $.log(`\n${message}\n`);
        jdNotify = $.getdata('jdpaopao') ? $.getdata('jdpaopao') : jdNotify;
        if (!jdNotify || jdNotify === 'false') {
            $.msg($.name, subTitle, `【京东账号${$.index}】${UserName}\n` + message);
        }
    }
}

// 获取任务信息
async function activity_taskInfo() {
    const functionId = `activity_taskInfo`;
    const body = `body=%7b%7d`;
    $.taskInfo = await get(functionId, body);
}

// 分享
async function share() {
    console.log('开始分享');
    for (i = $.taskInfo.data.shareTaskInfo.hasSharedTimes; i < $.taskInfo.data.shareTaskInfo.shareLimit; i++) {
        if ($.taskInfo.data.shareTaskInfo.hasSharedTimes === $.taskInfo.data.shareTaskInfo.shareLimit) {
            break;
        }
        await shareTask();
        await activity_taskInfo();
        if ($.shareInfo) {
            console.log('任务执行：' + $.shareInfo.errMsg + ' ' + $.taskInfo.data.shareTaskInfo.hasSharedTimes + '/' + $.taskInfo.data.shareTaskInfo.shareLimit);
        }
        await sleep(2000);
    }
}

// 逛会场
async function activity() {
    console.log('开始逛会场');
    await meetForactivity();
    if ($.meetInfo) {
        console.log(`任务执行结果:` + $.meetInfo.errMsg);
    }
    await sleep(2000);
    console.log('休息一下');
}

// 关注商品
async function product() {
    console.log('开始关注商品');
    for (i = $.taskInfo.data.taskInfo[1].finishNum; i < $.taskInfo.data.taskInfo[1].allValues.length; i++) {
        if ($.taskInfo.data.taskInfo[1].allValues.length === $.taskInfo.data.taskInfo[1].finishNum) {
            break;
        }
        await productForactivity(i);
        await activity_taskInfo();
        console.log($.taskInfo.data.taskInfo[1].allValues[i].id + ' ' + $.taskInfo.data.taskInfo[1].finishNum + '/' + $.taskInfo.data.taskInfo[1].allValues.length);
        if ($.productInfo) {
            console.log($.productInfo.errMsg);
        }
        await sleep(2000);
    }
}

// 关注店铺
async function shop() {
    console.log('开始关注店铺');
    await activity_taskInfo();
    await shopForactivity();
    if ($.shopInfo) {
        console.log($.shopInfo);
    }
    await sleep(2000);
}

// 查询排行榜
async function rank() {
    await activity_info();
    if ($.activity_info) {
        console.log('当前积分：' + $.activity_info.data.score + '\n排名: ' + $.activity_info.data.rank);
    }
    $.msg('泡泡大战', subTitle, '\n 当前积分 :' + $.activity_info.data.score + ' 排名:' + $.activity_info.data.rank);
}

// 查询排行API
async function activity_info() {
    const functionId = `activity_info`;
    const body = ``;
    $.activity_info = await get(functionId, body);
}

// 查看奖品
async function prize_list() {
    const functionId = `prize_list`;
    const body = ``;
    $.list = await get(functionId, body);
    if ($.list.data != '') {
        console.log($.list.data);
    }
}

// 分享API
async function shareTask() {
    const functionId = `activity_shareTask`;
    const body = ``;
    $.shareInfo = await get(functionId, body);
}

// 逛会场API
async function meetForactivity() {
    const functionId = `activity_stroll`;
    const value = $.taskInfo.data.taskInfo[0].allValues[0].value;
    const body = `'hallId':'${value}'`;
    $.meetInfo = await get(functionId, body);
}

// 关注商品API
async function productForactivity(i) {
    const functionId = `activity_followGood`;
    const value = $.taskInfo.data.taskInfo[1].allValues[i].value;
    const body = `'goodId':'${value}'`;
    $.productInfo = await get(functionId, body);
}

// 关注店铺API
async function shopForactivity() {
    const functionId = `activity_followShop`;
    const value = $.taskInfo.data.taskInfo[2].allValues[0].value;
    const body = `'shopId':'${value}'`;
    $.shopInfo = await get(functionId, body);
}

function get(functionId, body) {
    return new Promise(resolve => {
        $.get(taskGetUrl(functionId, body), (err, resp, data) => {
            try {
                if (err) {
                    console.log('\n京东泡泡大战: API查询请求失败 ‼️‼️')
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function taskGetUrl(functionId, body) {
    return {
        url: `${JD_API_HOST}?body=%7B${body}%7D&client=H5&clientVersion=8.8.8&appid=zuma-web&functionId=${functionId}`,
        headers: {
            'Origin': `https://jingqih5.m.jd.com`,
            'Cookie': cookie,
            'Connection': `keep-alive`,
            'Accept': `application/json`,
            'Referer': `https://jingqih5.m.jd.com/zm/activity.html`,
            'Host': `api.m.jd.com`,
            'Accept-Encoding': `gzip, deflate, br`,
            'Accept-Language': `zh-cn`,
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : "jdapp;iPhone;9.2.2;14.2;") : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;")
        },
    }
}

function sleep(s) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, s);
    })
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
