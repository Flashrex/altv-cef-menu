import { MenuItem } from "./menuitem.js";

export class ListItem extends MenuItem {
    private _items: string[];

    constructor(text: string, items: string[] = [], icon: string = "") {
        super(text, icon);
        this._items = items;
    }

    set items(items: string[]) {
        this._items = items;
    }

    get items(): string[] {
        return this._items;
    }

    addItem(item: string): void {
        this._items.push(item);
    }

    toJson(): object {
        return {
            ...super.toJson(),
            type: "list",
            items: this.items
        };
    }
}