import { User } from "telegraf/typings/telegram-types";

export class Room {
    id: string;
    users: User[];
}