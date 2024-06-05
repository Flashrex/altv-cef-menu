import alt from 'alt-client';
import native from 'natives';
import { playSoundFrontend, getSoundId, releaseSoundId } from 'natives';

import { Item } from "./items/item.js";
import { MenuItem } from "./items/menuitem.js";
import { WEBVIEW_EVENTS } from './events.js';
import { CheckboxItem } from './items/checkboxitem.js';
import { InputItem } from './items/inputitem.js';
import { SliderItem } from './items/slideritem.js';
import { ColorItem } from './items/coloritem.js';
import { ListItem } from './items/listitem.js';

const webview = new alt.WebView('http://assets/cef-menu/dist/index.html');

type MenuSelectCallback = (item: Item, index: number) => void;
type MenuCloseCallback = () => void;
type CheckboxChangeCallback = (item: CheckboxItem, checked: boolean) => void;
type InputChangeCallback = (item: InputItem, newValue: string) => void;
type ListChangeCallback = (item: ListItem, newSelected: string, oldSelected: string) => void;
type SliderChangeCallback = (item: SliderItem, newValue: string) => void;
type ColorChangeCallback = (item: ColorItem, newColor: alt.RGBA) => void;

export class Menu {
    private static instance: Menu | null;

    private _title: string;
    private _description: string;
    private _isVisible: boolean;
    private _position: Point;
    private _bgColor: alt.RGBA;
    
    private _items: { [id: string]: Item };
    private _parent: Menu | null;
    private _subMenus: { [id: string]: Menu } = {};

    private _selectHandler: MenuSelectCallback[] = [];
    private _closeHandler: MenuCloseCallback[] = [];
    private _checkboxChangeHandler: CheckboxChangeCallback[] = [];
    private _inputChangeHandler: InputChangeCallback[] = [];
    private _listChangeHandler: ListChangeCallback[] = [];
    private _sliderChangeHandler: SliderChangeCallback[] = [];
    private _colorChangeHandler: ColorChangeCallback[] = [];

    static getInstance() : Menu | null {
        return Menu.instance;
    }

    static onSelect(item_id: string, index: number) {
        const menu = Menu.getInstance();
        if(!menu) return;

        const item = menu.getItem(item_id)
        if(!item) return;

        if(menu._subMenus[item_id]) {
            menu._subMenus[item_id].open();
            return;
        }

        if(item instanceof MenuItem) {
            menu.selectCallbacks.forEach(callback => {
                callback(item, index);
            });
        }
    }

    static onCheckboxChanged(item_id: string, checked: boolean) {
        const menu = Menu.getInstance();
        if(!menu) return;

        const item = menu.getItem(item_id);
        if(!item) return;

        if(item instanceof CheckboxItem) {
            item.checked = checked;
            menu.checkboxChangeCallbacks.forEach(callback => {
                callback(item, checked);
            });
        }
    }

    static onInputChanged(item_id: string, newValue: string) {
        const menu = Menu.getInstance();
        if(!menu) return;

        const item = menu.getItem(item_id);
        if(!item) return;

        if(item instanceof InputItem) {
            menu.inputChangeCallbacks.forEach(callback => {
                callback(item, newValue);
            });
        }
    }

    static onListChanged(item_id: string, newSelected: string, oldSelected: string) {
        const menu = Menu.getInstance();
        if(!menu) return;

        const item = menu.getItem(item_id);
        if(!item) return;

        if(item instanceof ListItem) {
            menu.listChangeCallbacks.forEach(callback => {
                callback(item, newSelected, oldSelected);
            });
        }
    }

    static onSliderChanged(item_id: string, newValue: string) {
        const menu = Menu.getInstance();
        if(!menu) return;

        const item = menu.getItem(item_id);
        if(!item) return;

        if(item instanceof SliderItem) {
                menu.sliderChangeCallbacks.forEach(callback => {
                callback(item, newValue);
            });
        }
    }

    static onColorChanged(item_id: string, color: string) {
        const menu = Menu.getInstance();
        if(!menu) return;

        const item = menu.getItem(item_id);
        if(!item) return;

        if(item instanceof ColorItem) {
            menu.colorChangeCallbacks.forEach(callback => {
                callback(item, item.toRgbaColor(color));
            });
        }
    }

    static onInputSetActive(item_id: string, active: boolean) {
        const menu = Menu.getInstance();
        if(!menu) return;

        const item = menu.getItem(item_id);
        if(!item) return;

        if(item instanceof InputItem) {
            item.active = active;

            alt.toggleGameControls(!active);
            if(active) {
                webview.focus();
            } else {
                webview.unfocus();
            }
        }
    }

    static onColorSetActive(item_id: string, active: boolean) {
        const menu = Menu.getInstance();
        if(!menu) return;

        const item = menu.getItem(item_id);
        if(!item) return;

        if(item instanceof ColorItem) {
            if(item.active === active) return;
            item.active = active;

            alt.toggleGameControls(!active);
            alt.showCursor(active);
            if(active) {
                webview.focus();
            } else {
                webview.unfocus();
            }
        }
    }

    constructor(title: string, description: string, bgColor: alt.RGBA = null, position: Point = null) {
        this._title = title;
        this._description = description;
        this._position = position ? position : new Point(0.01, 0.05);
        this._bgColor = bgColor ? bgColor : new alt.RGBA(12, 122, 55, 255);
        this._items = {};
        this._parent = null;
        this._isVisible = false;
        this.registerEvents();
    }

    private registerEvents() {
        webview.on(WEBVIEW_EVENTS.SELECT, Menu.onSelect);
        webview.on(WEBVIEW_EVENTS.CHECKBOX_CHANGE, Menu.onCheckboxChanged);
        webview.on(WEBVIEW_EVENTS.INPUT_CHANGE, Menu.onInputChanged);
        webview.on(WEBVIEW_EVENTS.LIST_CHANGE, Menu.onListChanged);
        webview.on(WEBVIEW_EVENTS.SLIDER_CHANGE, Menu.onSliderChanged);
        webview.on(WEBVIEW_EVENTS.COLOR_CHANGE, Menu.onColorChanged);
        webview.on(WEBVIEW_EVENTS.INPUT_SET_ACTIVE, Menu.onInputSetActive);
        webview.on(WEBVIEW_EVENTS.COLOR_SET_ACTIVE, Menu.onColorSetActive);
    }

    addItem(item: Item) {
        this._items[item.id] = item;

        if(this._isVisible) {
            webview.emit(WEBVIEW_EVENTS.ADD_ITEM, item.toJson());
        }
    }

    removeItem(item: Item) {
        delete this._items[item.id];

        if(this._isVisible) {
            webview.emit(WEBVIEW_EVENTS.REMOVE_ITEM, item.id);
        }
    }

    clearItems(onlyView = false) {
        if(!onlyView) this._items = {};

        if(this._isVisible) {
            webview.emit(WEBVIEW_EVENTS.CLEAR_ITEMS);
        }
    }

    getItem(id: string) {
        return this._items[id];
    }

    hasItems() {
        return Object.keys(this._items).length > 0;
    }

    open() {
        if(Menu.instance) Menu.instance.close();
        Menu.instance = this;
        this._isVisible = true;

        webview.emit(WEBVIEW_EVENTS.SET_TITLE, this._title);
        webview.emit(WEBVIEW_EVENTS.SET_DESCRIPTION, this._description);
        webview.emit(WEBVIEW_EVENTS.SET_POSITION, this._position.x, this._position.y);
        webview.emit(WEBVIEW_EVENTS.SET_COLOR, this._bgColor.r, this._bgColor.g, this._bgColor.b, this._bgColor.a);

        for(const item in this._items) {
            webview.emit(WEBVIEW_EVENTS.ADD_ITEM, this._items[item].toJson());
        }

        webview.emit(WEBVIEW_EVENTS.OPEN_MENU);
    }

    close() {
        this.clearItems(true);
        this._isVisible = false;

        webview.emit(WEBVIEW_EVENTS.CLOSE_MENU);

        this.closeCallbacks.forEach(callback => {
            callback();
        });
    }

    get visible() {
        return this._isVisible;
    }

    addSubMenu(menu: Menu, itemToBind: MenuItem) {
        if(!this._items[itemToBind.id]) return;
        
        menu._parent = this;
        this._subMenus[itemToBind.id] = menu;
    }

    get parent() {
        return this._parent;
    }

    set title(title: string) {
        this._title = title;

        if(this._isVisible) {
            webview.emit(WEBVIEW_EVENTS.SET_TITLE, title);
        }
    }

    get title() {
        return this._title;
    }

    set description(description: string) {
        this._description = description;

        if(this._isVisible) {
            webview.emit(WEBVIEW_EVENTS.SET_DESCRIPTION, description);
        }
    }

    get description() {
        return this._description;
    }

    set position(position: Point) {
        this._position = position;

        if(this._isVisible) {
            webview.emit(WEBVIEW_EVENTS.SET_POSITION, position.x, position.y);
        }
    }

    get position() {
        return this._position;
    }

    set bgColor(color: alt.RGBA) {
        this._bgColor = color;

        if(this._isVisible) {
            webview.emit(WEBVIEW_EVENTS.SET_COLOR, color.r, color.g, color.b, color.a);
        }
    }

    get bgColor() {
        return this._bgColor;
    }
    
    onSelect(callback: MenuSelectCallback) {
        this._selectHandler.push(callback);
    }

    get selectCallbacks() {
        return this._selectHandler;
    }

    onClose(callback: MenuCloseCallback) {
        this._closeHandler.push(callback);
    }

    get closeCallbacks() {
        return this._closeHandler;
    }

    onCheckboxChange(callback: CheckboxChangeCallback) {
        this._checkboxChangeHandler.push(callback);
    }

    get checkboxChangeCallbacks() {
        return this._checkboxChangeHandler;
    }

    onInputChange(callback: InputChangeCallback) {
        this._inputChangeHandler.push(callback);
    }

    get inputChangeCallbacks() {
        return this._inputChangeHandler;
    }

    onListChange(callback: ListChangeCallback) {
        this._listChangeHandler.push(callback);
    }

    get listChangeCallbacks() {
        return this._listChangeHandler;
    }

    onSliderChange(callback: SliderChangeCallback) {
        this._sliderChangeHandler.push(callback);
    }

    get sliderChangeCallbacks() {
        return this._sliderChangeHandler;
    }

    onColorChange(callback: ColorChangeCallback) {
        this._colorChangeHandler.push(callback);
    }

    get colorChangeCallbacks() {
        return this._colorChangeHandler;
    }
}

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = this.clamp(x);
        this.y = this.clamp(y);
    }

    private clamp(value: number) : number {
        return Math.max(0, Math.min(1, value));
    }
}

alt.on('keydown', (key) => {
    if(!Menu.getInstance()?.visible || !Menu.getInstance()?.hasItems() || native.isPauseMenuActive()) return;
    switch(key) {
        //Backspace, Enter, LeftArrow, RightArrow, UpArrow, DownArrow
        case 13: //Enter
            webview.emit(WEBVIEW_EVENTS.SELECT);
            playSound("SELECT");
            break;

        
        case 8: //Backspace
            if(Menu.getInstance()?.parent) Menu.getInstance()?.parent.open();
            else Menu.getInstance()?.close();
            playSound("BACK");
            break;

        case 38: //UpArrow
        case 87: //W
            if(!alt.gameControlsEnabled()) return;
            webview.emit(WEBVIEW_EVENTS.MOVE_UP);
            playSound("NAV_UP_DOWN");
            break;

        case 40: //DownArrow
        case 83: //S
            if(!alt.gameControlsEnabled()) return;
            webview.emit(WEBVIEW_EVENTS.MOVE_DOWN);
            playSound("NAV_UP_DOWN");
            break;

        case 37: //LeftArrow
        case 65: //A
            if(!alt.gameControlsEnabled()) return;
            webview.emit(WEBVIEW_EVENTS.MOVE_LEFT);
            playSound("NAV_LEFT_RIGHT");
            break;

        case 39: //RightArrow
        case 68: //D
            if(!alt.gameControlsEnabled()) return;
            webview.emit(WEBVIEW_EVENTS.MOVE_RIGHT);
            playSound("NAV_LEFT_RIGHT");
            break;
    }
});

function playSound(audioName: string) {
    const id = getSoundId();
    playSoundFrontend(id, audioName, "HUD_FRONTEND_DEFAULT_SOUNDSET", true);
    releaseSoundId(id);
}


