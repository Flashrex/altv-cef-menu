import { Item } from "./item.js";

export class MenuItem implements Item {
    private _id: string;
    private _text: string;
    private _description: string;
    private _icon: string;

    constructor(text: string, description: string = "", icon: string = undefined) {
        this._id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this._description = description;
        this._text = text;
        this._icon = icon !== undefined ? icon : 'mdi-menu';
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

    set description(description: string) {
        this._description = description;
    }

    get description(): string {
        return this._description;
    }

    set icon(icon: string) {
        this._icon = icon;
    }

    get icon(): string {
        return this._icon;
    }

    toJson(): object {
        return {
            id: this.id,
            type: 'item',
            text: this.title,
            description: this.description,
            icon: this.icon,
        };
    }
}
