import alt from 'alt-client';
import { MenuItem } from "./menuitem.js";

export class ColorItem extends MenuItem {
    private _value: string;
    private _active: boolean = false;

    constructor(text: string, description: string = "", value: alt.RGBA = new alt.RGBA(0, 0, 0, 255), icon: string = "") {
        super(text, description, icon);
        this._value = this.toHexColor(value);
        this.icon = icon ? icon : 'mdi-format-color-fill';
    }

    set value(color: alt.RGBA) {
        this._value = this.toHexColor(color);
    }

    get value(): alt.RGBA {
        return this.toRgbaColor(this._value);
    }

    set active(active: boolean) {
        this._active = active;
    }

    get active(): boolean {
        return this._active;
    }

    set ValueHex(value: string) {
        this._value = value;
    }

    get ValueHex(): string {
        return this._value;
    }

    private toHexColor(color: alt.RGBA): string {
        return '#' + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
    }

    public toRgbaColor(color: string): alt.RGBA | null {
        if (color.charAt(0) !== '#' || (color.length !== 7 && color.length !== 9)) {
            return null;
        }

        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        let a = color.length === 9 ? parseInt(color.slice(7, 9), 16) : 255;

        return new alt.RGBA(r, g, b, a);
    }

    toJson(): object {
        return {
            ...super.toJson(),
            type: "color",
            value: this.ValueHex
        };
    }
}