import { Conf } from "./conf";
import * as fs from 'fs';
import * as Telegraf from 'telegraf';
import { Room } from "./room";
import { User, Message, PhotoSize, Chat } from "telegraf/typings/telegram-types";
import { brotliCompress } from "zlib";

const version = '1.0.1';
const confPath = process.argv[2] || './conf';
const conf: Conf = JSON.parse(fs.readFileSync(confPath + '/conf.json', { encoding: 'UTF-8' }));
const bot = new Telegraf.default(conf.token);
const roomMapByChat = new Map<number, Room>();
const roomMapByRoom = new Map<string, Room>();

bot.start(ctx => {
    ctx.reply(conf.messages.start, { parse_mode: "Markdown" });
    ctx.from
});

bot.command('admin', ctx => {
    const text = ctx.message.text.split('admin').pop();
    if (!text || text.trim() === '') {
        ctx.reply('You must specify the message. For example: `/admin I love you`', { parse_mode: 'Markdown' })
    } else {
        bot.telegram.sendMessage(conf.adminChat, `User ${makeUserLink(ctx.from)} has sent you the following message\n${text.trim()}`, { parse_mode: "Markdown" }).then(
            data => {
                ctx.reply('Message to the admin has been sent');
            }
        )
    }
});

bot.command('send', (ctx) => {
    if (ctx.chat.id === +conf.adminChat) {
        let args = ctx.message.text.split(' ');
        bot.telegram.sendMessage(args[1], 'Message from bot admin: ' + args.slice(2).join(' ') + '\nYou can answer to them using /admin your message').then(mess => {
            ctx.reply('Message sent proprerly');
        });
    }
});

bot.command(['create', 'join'], ctx => {
    if (!roomMapByChat.has(ctx.chat.id)) {
        const roomID = ctx.message.text.split(' ')[1];
        let room: Room;
        if (roomMapByRoom.has(roomID)) {
            room = roomMapByRoom.get(roomID);
        } else {
            room = new Room(roomID);
            roomMapByRoom.set(roomID, room);
        }
        room.chats.push(ctx.chat);
        roomMapByChat.set(ctx.chat.id, room);
        ctx.reply('Session joined with success');
    } else {
        ctx.reply('You are already in a session, You may /leave it');
    }
});

bot.command('leave', ctx => {
    if (roomMapByChat.has(ctx.chat.id)) {
        const room = roomMapByChat.get(ctx.chat.id);
        room.chats = room.chats.filter(chat => chat.id !== ctx.chat.id);
        if (room.chats.length === 0) {
            roomMapByRoom.delete(room.id);
        }
        roomMapByChat.delete(ctx.chat.id);
        ctx.reply('Session leaved');
    } else {
        ctx.reply("You're not on a room");
    }
});

// bot.on('text', ctx => {
//     reSendToChat(ctx, (chat) => bot.telegram.sendMessage(chat.id, ctx.message.text));
// });

// bot.on('photo', ctx => {
//     const photo = getBestPhoto(ctx.message);
//     reSendToChat(ctx, (chat) => bot.telegram.sendPhoto(chat.id, photo.file_id, {caption: ctx.message.caption}));
// });

// bot.on('video', ctx => {
//     reSendToChat(ctx, (chat) => bot.telegram.sendVideo(chat.id, ctx.message.video.file_id, {caption: ctx.message.caption}));
// });

bot.use(ctx => {
    reSendToChat(ctx, (chat) => bot.telegram.sendCopy(chat.id, ctx.message));
});

bot.launch();

function reSendToChat(ctx: Telegraf.ContextMessageUpdate, fn: (chat: Chat) => Promise<Message>) {
    if (roomMapByChat.has(ctx.chat.id)) {
        const room = roomMapByChat.get(ctx.chat.id);
        for (const chat of room.chats) {
            if (chat.id !== ctx.chat.id) {
                fn(chat);
            }
        }
    }
}

function makeUserLink(usr: User) {
    return `[${usr.first_name}](tg://user?id=${usr.id})`
}

function getBestPhoto(ctx: Message) {
    let bestPhoto: PhotoSize;
    for (const photo of ctx.photo) {
        if (!bestPhoto || bestPhoto.file_size < photo.file_size) {
            bestPhoto = photo;
        }
    }
    return bestPhoto;
}
