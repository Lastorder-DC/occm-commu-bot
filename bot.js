const dotenv = require('dotenv');
const Mastodon = require('mastodon-api');
const limit = require('./check-limit');

dotenv.config();

const m = new Mastodon({
    access_token: process.env.ACCESS_TOKEN,
    api_url: process.env.API_URL
});

let dup = [];

async function boost(msg) {
    console.log('[update]', msg);
    if(msg.event === 'update' && !msg.data.in_reply_to_id && !msg.data.reblog) {
        if(!dup.includes(msg.data.id)) {
            dup.push(msg.data.id);
            if(await limit.check(msg.data.account.acct, msg.data.account.id)) {
                await m.post(`statuses/${msg.data.id}/reblog`, {});
                await limit.set(msg.data.account.acct);
                dup.splice(dup.indexOf(msg.data.id), 1);
            }
        }
    }
}

m.stream('streaming/hashtag', {tag: '자캐커뮤'}).on('message', boost);
m.stream('streaming/hashtag', {tag: '커뮤홍보'}).on('message', boost);
m.stream('streaming/hashtag', {tag: '자커홍보'}).on('message', boost);
