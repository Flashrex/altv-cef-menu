
# alt:V CEF Menu

This resource is a menu builder written in Typescript using Vue 3.
It is inspired by [NativeUI by DurtyFree](https://github.com/DurtyFree/alt-V-NativeUI) and [alt:V Open Source Menu by LeonMrBonnie](https://github.com/LeonMrBonnie/altv-os-menu). Go check them out.

# 1. How to use

There are two ways to use this resource.
You can either use the provided `latest release` files and start using this menu builder directly 
or `download this repo` and edit/compile the files yourself.

## 1.1 Install Menu-Builder from latest release

1. Download the latest release directly here on github.
2. Copy everything from the `cef-menu` directory to your `resources` in your altv-server directory
3. Include the resource in your `server.toml` file

### 1.1.1 Continue here if you are using Javascript as your clientside language
4. Copy all files in `client/dist` directory somewhere in your resource client directory.
5. Continue with `2. Example` down below

### 1.1.2 Continue here if you are using Typescript as your clientside language
5. Copy all files in `client/src` directory somewhere in your resource client directory.
6. Make sure the files get compiled together with your other files.
7. Continue with `2. Example` down below

## 1.2 Edit Menu-Builder and make it your own

This Menu Builder is open source. You can download and edit the files however you like.
You are NOT allowed to sell this code!

To start developing on this repo you need to install Node.js.
Please make sure you are running atleast Node.js v21.
I did not test older version and do not provide support for it!

### 1.2.1

1. Clone this Repository.
2. Open `client/` and run `npm i` and then `npm run dev`
3. Open `web/` and run `npm i` and then `npm run dev` or `npm run build-only`
4. To install the script on your server continue with `1.1`

# 2. Example Script

```
import { MenuItem } from "./items/menuitem.js";
import { Menu, Point } from "./menu.js";
import { CheckboxItem } from './items/checkboxitem.js';
import { InputItem } from './items/inputitem.js';
import { ListItem } from './items/listitem.js';
import { SliderItem } from './items/slideritem.js';
import { ColorItem } from './items/coloritem.js';

const menu = new Menu("Main Menu", "This is the main menu", new alt.RGBA(45, 122, 97, 255), new Point(0.05, 0.2));

const submenuItem = new MenuItem("MenuItem", "MenuItem to Submenu")
menu.addItem(submenuItem);
menu.addItem(new CheckboxItem("CheckboxItem", "This is item 2", false));
menu.addItem(new InputItem("InputItem", "This is item 3", "", "Enter text..."));
menu.addItem(new ListItem("ListItem", "This is item 4", ["Item 1", "Item 2", "Item 3"]));
menu.addItem(new SliderItem("SliderItem", "This is item 5", 0.25));
menu.addItem(new ColorItem("ColorItem", "This is item 6", new alt.RGBA(255, 0, 0, 255)));

const submenu = new Menu("Submenu", "This is a submenu", new alt.RGBA(45, 122, 97, 255), new Point(0.05, 0.2));
menu.addSubMenu(submenu, submenuItem)

menu.onSelect((item: MenuItem, index: number) => {
    if(item instanceof MenuItem) {
        alt.log(`Selected item: ${item.title}(${index})`);
    }
});

menu.onCheckboxChange((item : CheckboxItem, checked: boolean) => {
    if(item instanceof CheckboxItem) {
        alt.log(`Checkbox changed: ${item.title}(${checked})`);
    }
});

menu.onInputChange((item: InputItem, newValue: string) => {
    if(item instanceof InputItem) {
        alt.log(`Input changed: ${item.title}(${newValue})`);
    }
});

menu.onListChange((item : ListItem, newSelected: string, oldSelected: string) => {
    if(item instanceof ListItem) {
        alt.log(`List changed: ${item.title}(${oldSelected} -> ${newSelected})`);
    }
});

menu.onSliderChange((item, newValue) => {
    if(item instanceof SliderItem) {
        alt.log(`Slider changed: ${item.title}(${newValue})`);
    }
});

menu.onColorChange((item, newColor) => {
    if(item instanceof ColorItem) {
        alt.log(`Color changed: ${item.title}(${newColor.r}, ${newColor.g}, ${newColor.b}, ${newColor.a})`);
    }
});

menu.onClose(() => {
    alt.log(`Menu closed`);
});

menu.open();
```

# Functions

`new Menu(title: string, description: string, bgColor: alt.RGBA = null, position: Point = null)`

- Variables
  - `visible {get;} : boolean`
  - `parent {get;} : Menu | null`
  - `title {get; set;} : string`
  - `description {get; set;} : string`
  - `position {get; set;} : Point`
  - `bgColor {get; set;} : alt.RGBA`

- Functions
  - `addItem(item: Item)`
  - `removeItem(item: Item)`
  - `clearItems()`
  - `hasItems()`
  - `open()`
  - `close()`
  - `addSubMenu(menu: Menu, itemToBind: MenuItem)`

- Events
  - `onSelect : (item: MenuItem, index: number)`
  - `onCheckboxChange : (item: CheckboxItem, checked: boolean)`
  - `onInputChange : (item: InputItem, newValue: string)`
  - `onListChange : (item: ListItem, newSelected: string, oldSelected: string)`
  - `onSliderChange : (item: SliderItem, newValue: string)`
  - `onColorChange : (item: ColorItem, newColor: alt.RGBA)`
  - `onClose : ()`

`new MenuItem(text: string, description: string = "", icon: string = undefined)`

`icon` takes any Material Design Icon Name as string.
You can search them for example on [MDISearch](https://mdisearch.com/).
There are standard icons set for each MenuItem. 
If you dont want to use icons just call the contructor using an empty string as icon.

- Variables
  - `id {get;} : string`
  - `title {get; set;}`
  - `description {get; set;}`
  - `icon {get; set;}`

`new CheckboxItem(text: string, description: string = "", checked: boolean = false, icon: string = undefined)` extends `MenuItem`

- Variables
  - `checked {get; set;} : boolean`

`new ListItem(text: string, description: string = "", items: string[] = [], icon: string = undefined)` extends `MenuItem`

- Variables
  - `items {get; set;} : string[]`
  - `value {get; set;} : string`


`new SliderItem(text: string, description: string = "", value: number = 0.5, icon: string = undefined)` extends `MenuItem`

Value ranges between 0 and 1. Steps are 0.05.

- Variables
  - `value {get; set;} : number`

`new InputItem(text: string, description: string = "", value: string = "", placeholder: string = "", icon: string = undefined)` extends `MenuItem`

- Variables
  - `value {get; set;} : string`
  - `placeholder {get; set;} : string`

`new ColorItem(text: string, description: string = "", value: alt.RGBA = new alt.RGBA(0, 0, 0, 255), icon: string = undefined)` extends `MenuItem`

- Variables
  - `value {get; set;} : alt.RGBA`
  - `valueHex {get; set;} : string //Color as hex-string -> #ffffff`

`new Point(x: number, y: number)`

Values range between 0 and 1 where 0 is left/top of the screen and 1 is right/bottom of the screen.