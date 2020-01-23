import { Chat } from "telegraf/typings/telegram-types";

export class Room {
    chats: Chat[];

    constructor (public id: string) {
        this.chats = [];
    }
}