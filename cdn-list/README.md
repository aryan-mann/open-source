# CDN-LIST README

Add Javascript and CSS libraries easily through an extensive and editable list of CDN links. 

## Features

![feature Add](https://i.imgur.com/j7chLM8.gif)

List of items can be manipulated by editing a .JSON file that can be opened using the command **CDN: Configure**.  

Each item has 4 properties:-
  
* **name** - Name of the library.
* **version** - Libraries with the same name but different versions show up as different items.
* **url** - Url linking to the a CDN hosting the library.
* **lang** - Setting it as **JS** or **CSS** will put the url inside their respective valid tags upon insertion, otherwise it'll just insert the url.

![feature Jason](https://i.imgur.com/uD2CTQ9.png)

> ***Tip***: Setting lang as JS will insert the url inside a <script src="{url}"></script> tag.     
Setting lang as CSS will insert the url inside a <link rel="stylesheet" href="{url} > tag.     
Otherwise, the {url} will be directly inserted

## Extension Settings

Add or remove items by adding them to the CDNs.json file which can be opened through the **CDN: Configure** command.

## Known Issues

* No known issues      
[Found a bug?](mailto:aryan@aryanmann.com)

## Release Notes

### 1.0.1

Some minor bug fixes.

### 1.0.0

Initial release of cdn-list
