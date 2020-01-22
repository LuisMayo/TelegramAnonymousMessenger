import { Conf } from "./conf";
import * as fs from 'fs';
import * as Telegraf from 'telegraf';
import { Room } from "./room";

const version = '1.0.1';
const confPath = process.argv[2] || './conf';
const conf: Conf = JSON.parse(fs.readFileSync(confPath + '/conf.json', { encoding: 'UTF-8' }));
const bot = new Telegraf.default(conf.token);
const roomMap = new Map<number, Room>();

bot.start(ctx => {
    ctx.reply(conf.messages.start, { parse_mode: "Markdown" });
    ctx.from
});

bot.command('admin', ctx => {
    const text = ctx.message.text.split('admin').pop();
    if (!text || text.trim() === '') {
        ctx.reply('You must specify the message. For example: `/admin I love you`', { parse_mode: 'Markdown' })
    } else {
        bot.telegram.sendMessage(conf.adminChat, `User ${makeUserLink(ctx.from)} has sent you the following message:
${text.trim()}`, { parse_mode: "Markdown" });
        ctx.reply('Message to the admin has been sent');
    }
});

bot.command('create', ctx => {
    
});