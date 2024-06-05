import { MenuItem } from "./menuitem.js";

export class CheckboxItem extends MenuItem {
    private _checked: boolean;

    constructor(text: string, description: string = "", checked: boolean, icon: string = "") {
        super(text, description, icon);
        this._checked = checked;
        this.icon = icon ? icon : 'mdi-checkbox-marked';
    }

    set checked(checked: boolean) {
        this._checked = checked;
    }

    get checked(): boolean {
        return this._checked;
    }

    toJson(): object {
        return {
            ...super.toJson(),
            type: "checkbox",
            checked: this.checked
        };
    }
}