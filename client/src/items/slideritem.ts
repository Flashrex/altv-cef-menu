import { MenuItem } from "./menuitem.js";

export class SliderItem extends MenuItem {
    private _value: number;

    constructor(text: string, description: string = "", value: number = 0.5, icon: string = "") {
        super(text, description, icon);
        this._value = value;
        this.icon = icon ? icon : 'mdi-tune-variant';
    }

    set value(value: number) {
        this._value = value;
    }

    get value(): number {
        return this._value;
    }

    toJson(): object {
        return {
            ...super.toJson(),
            type: "slider",
            value: this.value
        };
    }
}