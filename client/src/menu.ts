import alt from 'alt-client';
import { playSoundFrontend, getSoundId, releaseSoundId } from 'natives';

import { Item } from "./items/item.js";
import { MenuItem } from "./items/menuitem.js";
import { WEBVIEW_EVENTS } from './events.js';

const webview = new alt.WebView('http://assets/cef-menu/dist/index.html');

type MenuSelectCallback = (item: Item, index: number) => void;
type MenuCloseCallback = () => void;
type CheckboxChangeCallback = (item: Item, checked: boolean) => void;
type InputChangeCallback = (item: Item, newValue: string) => void;
type ListChangeHandler = (item: Item, newSelected: Item, oldSelected: Item) => void;

export class Menu {
    private static instance: Menu | null;

    private _title: string;
    private _description: string;
    private _isVisible: boolean;
    private _position: Point;
    
    private _items: { [id: string]: Item };
    private _parent: Menu | null;

    private _selectHandler: MenuSelectCallback[] = [];
    private _closeHandler: MenuCloseCallback[] = [];
    private _checkboxChangeHandler: CheckboxChangeCallback[] = [];
    private _inputChangeHandler: InputChangeCallback[] = [];
    private _listChangeHandler: ListChangeHandler[] = [];

    static getInstance() : Menu | null {
        return Menu.instance;
    }

    constructor(title: string, description: string, position: Point = null) {
        this._title = title;
        this._description = description;
        this._position = position;
        this._items = {};
        this._parent = null;
        this._isVisible = false;
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

    getItem(id: string) {
        return this._items[id];
    }

    open() {
        this._isVisible = true;

        webview.emit(WEBVIEW_EVENTS.OPEN_MENU);
    }

    close() {
        this._isVisible = false;

        webview.emit(WEBVIEW_EVENTS.CLOSE_MENU);
    }

    get visible() {
        return this._isVisible;
    }

    addSubMenu(menu: Menu, itemToBind: MenuItem) {
        if(!this._items[itemToBind.id]) return;
        
        menu._parent = this;
        itemToBind.menu = menu;
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
            webview.emit(WEBVIEW_EVENTS.SET_POSITION, [position.x, position.y]);
        }
    }

    get position() {
        return this._position;
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

    onListChange(callback: ListChangeHandler) {
        this._listChangeHandler.push(callback);
    }

    get listChangeCallbacks() {
        return this._listChangeHandler;
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
    switch(key) {
        //Backspace, Enter, LeftArrow, RightArrow, UpArrow, DownArrow
        case 13: //Enter
            webview.emit(WEBVIEW_EVENTS.SELECT);
            playSound("SELECT");
            break;

        
        case 8: //Backspace
            if(Menu.getInstance()?.parent) {
                Menu.getInstance()?.close();
                Menu.getInstance()?.parent.open();
            }
            playSound("BACK");
            break;

        case 27: //Escape
            Menu.getInstance()?.close();
            playSound("BACK");
            break;
            
        case 37: //LeftArrow
        case 65: //A
            webview.emit(WEBVIEW_EVENTS.MOVE_LEFT);
            playSound("NAV_LEFT_RIGHT");
            break;

        case 39: //RightArrow
        case 68: //D
            webview.emit(WEBVIEW_EVENTS.MOVE_RIGHT);
            playSound("NAV_LEFT_RIGHT");
            break;

        case 38: //UpArrow
        case 87: //W
            webview.emit(WEBVIEW_EVENTS.MOVE_UP);
            playSound("NAV_UP_DOWN");
            break;

        case 40: //DownArrow
        case 83: //S
            webview.emit(WEBVIEW_EVENTS.MOVE_DOWN);
            playSound("NAV_UP_DOWN");
            break;
    }
});

function playSound(audioName: string) {
    const id = getSoundId();
    playSoundFrontend(id, audioName, "HUD_FRONTEND_DEFAULT_SOUNDSET", true);
    releaseSoundId(id);
}