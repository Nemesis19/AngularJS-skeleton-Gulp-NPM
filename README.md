# AngularJS Skeleton with Gulp-NPM support

Simple starting project skeleton for an AngularJS app.

Supports Gulp and NPM.

**This skeleton is intended to be used with an AngularJS app based on a component approach, although it may work also with the classic approach (not tested).**

## Setup and Install
Fork this repo from inside GitHub, or simply download the .zip bundle with the contents inside.

1. Download and install [Node.js here](https://nodejs.org/en/download/) for Windows or for Mac.
2. Install Gulp CLI on the command-line with `npm install -g gulp`
3. Open the project folder in Terminal and run: `npm install`

Please consider using this basic folder structure:
```
- app
|___ fonts
|___ imgs
|___ js
|___ sass
- cache
- dist
```
*if you don't create dist and cache folder, they will be created on startup*

## Using Gulp

Adjust the Gulp file in case you want to adjust the folder structure.

Inside the Gulp file you can change basic settings editing the "variable definitions" area.

The terminal commands to start using the project
#### to start the local server
```
npm start
```
#### to compile the production version with all the minified files
```
npm run deploy 
```
#### to delete the cache on local system created by gulp-cache on images and html templates
```
npm clear:cache
```
----
Please consider this starting project as it is. No support is given and improvements are always welcome.

----
## Credits
Thanks to these repos for inspiring this project:
- <a href="https://github.com/UltimateAngular/ultimate-angular-master-seed" target="_blank">Ultimate Angular: Pro App</a>
- <a href="https://github.com/gdi2290/NG6-starter" target="_blank">NG6</a>