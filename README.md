Baasic AngularJS Media Gallery Starter Kit
============

## Starter Kit Functionality

This Starter Kit provides a bare-bones media gallery functionality. There are various themes available which demonstrate the capability of media gallery module, to keep things simple we implemented a theme which demonstrates photo capabilities, a theme for video capabilities and a theme for all types of documents. We deliberately removed advanced features so the baasic functionality is not obscured by them: however, future samples will include a complete media gallery management functionality.

More information about the Starter Kit can be found in the series of blog posts [here](http://www.baasic.com/posts/AngularJS-Blog-Starter-Kit-part-1/).


## Working with the Starter kit

As a client-side prerequisite, you should install the basic tools for your operating system: Node.js (4.x and above), Bower and Gulp. Start by cloning the [AngularJS Media Gallery Starter Kit repository](https://github.com/Baasic/baasic-starterkit-angularjs-media-gallery/). After that, go into the root folder of the started Kit you just cloned and type

    npm install

npm (Node Package Manager) will go through its configuration file (package.json) and install all dependencies. It may take a couple of minutes to download and install everything; when it is finished, just type

    gulp serve

this will serve you the default theme, to serve a different theme please use the _--theme_ switch

    gulp serve --theme default

and you are *almost* ready to go.

In its default state, this Kit points to the [main demo site](http://demo.baasic.com/angularjs/starterkit-media-gallery/) and pulls its content from it. As it would not be a nice thing to have thousands of users editing it, you will need to point your Kit to your own application. It is easy - just go to the root folder and find *app.conf.json* and enter your Baasic application unique identifier (API Key) here:

    {
        "apiRootUrl": "api.baasic.com",
        "apiVersion": "beta",
        "apiKey": "your-unique-identifier"
    }

As your application may be empty and there are no files in it, and the demo page will be blank after this switch. However, you can now log in and start entering your own content.

## Production ready build

To make the app ready for deploy to production run:

```bash
gulp dist
```
or
```bash
gulp dist --theme default
```

## Base url option

You can also add a `--baseUrl` command if your blog destination is not in root of your website

For example:
`--baseUrl "/angularjs/starterkit-media-gallery-showcase/"`

Now there's a `./dist` folder with all scripts and stylesheets concatenated and minified, also third party libraries installed with bower will be concatenated and minified into `vendors.min.js` and `vendors.min.css` respectively.

## Get in touch

Get in touch using one of the community channels

* GitHub: [Baasic](https://github.com/Baasic)
* Google Groups: [Baasic Support](https://groups.google.com/forum/#!forum/baasic-baas)
* Twitter: [@baasical](https://twitter.com/baasical)
