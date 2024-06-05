import { MenuItem } from "./menuitem.js";

export class ListItem extends MenuItem {
    private _items: string[];
    private _value: string;

    constructor(text: string, description: string = "", items: string[] = [], icon: string = "") {
        super(text, description, icon);
        this._items = items;
        this._value = items[0];
        this.icon = icon ? icon : 'mdi-format-list-bulleted';
    }

    set items(items: string[]) {
        this._items = items;
    }

    get items(): string[] {
        return this._items;
    }

    set value(value: string) {
        this._value = value;
    }

    get value(): string {
        return this._value;
    }

    addItem(item: string): void {
        this._items.push(item);
    }

    toJson(): object {
        return {
            ...super.toJson(),
            type: "list",
            items: this.items,
            value: this.value
        };
    }
}