## BEM with HAML
Also with SCSS and CoffeeScript.

### How to use?

#### Get top level dependencies
* [NodeJS](http://nodejs.org/#download)
* [NPM](http://npmjs.org/)
* [HAML](http://haml-lang.com/download.html)
* [SASS](http://sass-lang.com/download.html)
* [BEM Tools](https://github.com/bem/bem-tools/)

#### Copy files
Copy `.bem/`, `GNUmakefile`, `package.json`, `blocks/`, `pages/` to your project root.

#### Install npm-dependencies
Run `npm install` for install all dependencies from `package.json`.

#### Build
Just run `make` and it builds only whats needed.

### What can you do?

### Create new files
Run `bem create block -l blocks <blockname>` for create new block, with HAML, SCSS, and CoffeeScript techs by default.
Run `bem create block -l pages <pagename>` for create new page, with only HAML tech by default.

#### Declare BEM-items in HAML
Declare new BEM-items by `DECL` func:

```haml
- DECL :link do |content, href|
  %a.link(href=href)
    = DO content
```

Use them in pages and in other blocks with `DO`:

```haml
- DO :link, "http://yandex.com" do
  %strong
    Yandex.com
```

#### Build pages HTML/CSS/JS
Run `make` and you get:
* `pages/<pagename>/<pagename>.haml.html` -- HTML result for HAML templates.
* `blocks/ALL.css` and `blocks/ALL.js` -- CSS and JS for all blocks in project, you can use them at any page.

### Development

#### Tune templates
All templates for create new files defined in `.bem/techs/*.js`.
