import { MenuItem } from "./menuitem.js";

export class InputItem extends MenuItem {
    private _value: string;
    private _placeholder: string;

    constructor(text: string, value: string = "", placeholder: string = "", icon: string = "") {
        super(text, icon);
        this._value = value;
        this._placeholder = placeholder;
    }

    set value(value: string) {
        this._value = value;
    }

    get value(): string {
        return this._value;
    }

    set placeholder(placeholder: string) {
        this._placeholder = placeholder;
    }

    get placeholder(): string {
        return this._placeholder;
    }

    toJson(): object {
        return {
            ...super.toJson(),
            type: "input",
            placeholder: this.placeholder,
            value: this.value
        };
    }
}
