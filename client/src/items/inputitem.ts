import { MenuItem } from "./menuitem.js";

export class InputItem extends MenuItem {
    private _value: string;
    private _placeholder: string;
    private _active: boolean = false;

    constructor(text: string, description: string = "", value: string = "", placeholder: string = "", icon: string = undefined) {
        super(text, description, icon);
        this._value = value;
        this._placeholder = placeholder;
        this.icon = icon ? icon : 'mdi-form-textbox';
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

    set active(active: boolean) {
        this._active = active;
    }

    get active(): boolean {
        return this._active;
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
