import { Item } from "./item.js";
import { Menu } from "../menu.js";

export class MenuItem implements Item {
    private _id: string;
    private _text: string;
    private _icon: string;
    private _menu: Menu | null;

    static onSelect(item_id: string, index: number) : void {
        const menu = Menu.getInstance();
        if(!menu) return;

        const item = menu.getItem(item_id)
        if(!item) return;

        menu.selectCallbacks.forEach(callback => {
            callback(item, index);
        });
    }

    constructor(text: string, icon: string = "") {
        this._id = "";
        this._text = text;
        this._icon = icon;
        this._menu = Menu.getInstance();
    }

    set id(id: string) {
        this._id = id;
    }

    get id(): string {
        return this._id;
    }

    set title(text: string) {
        this._text = text;
    }

    get title(): string {
        return this._text;
    }

    set icon(icon: string) {
        this._icon = icon;
    }

    get icon(): string {
        return this._icon;
    }

    set menu(menu: Menu) {
        this._menu = menu;
    }

    get menu(): Menu {
        return this._menu;
    }

    toJson(): object {
        return {
            id: this.id,
            type: "item",
            text: this.title,
            icon: this.icon,
        };
    }
}
