import { Menu } from "../menu.js";

export interface Item {

    set id(id: string);
    get id(): string;
    set title(text: string);
    get title(): string;
    set icon(icon: string);
    get icon(): string;
    set menu(menu: Menu);
    get menu(): Menu;

    toJson(): object;
}