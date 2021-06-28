#Fangame Marathon 2021 Layouts

This is a program to dynamically generate layouts for FM2021.

To get started:

1. Download the files above, either by downloading the ZIP or cloning the repo
2. In the command line, go to the root folder
  * Note: you must have node and npm installed on your computer
3. Type `npm i` to install all dependencies
4. Type `npm start` to start the dev server
5. In your web browser (preferably Chrome) go to `http://localhost:9090/`

Once there you will see a few tabs

* All Runs
  * This is where you can see all runs.
  * The run order is fetched from the official FM2021 run list on [Oengus' API](https://oengus.io/api/marathon/fm2021/schedule)
  * The rest of the information is stored in the program
  * On the left side you can click to either edit the info or load the run into its own URL
* Main
  * This is the primary dashboard for editing or adding information
  * You can temporarily save these fields
    * You can then open up a new window dedicated to whatever is saved on this screen
  * You can permanently save run info to the list shown on the first page
    * You can then open up a dedicated URL to that run
* Graphics
  * You can ignore this tab; the URLs loaded here are primarily handled in the prior tabs
* Mixer
  * Also ignore this, there are no SFX/music in this program
* Assets
  * This is a list of all images used in the program
  * **DO NOT DELETE ANYTHING HERE or things will break**
    * Ones of use to you
      * Base Layouts - just in case you need to save a blank template image to use, like old times
      * Avatars - If you ever need to add a user's image
        * As of right now the avatars aren't used, but will in a future version
        * Make sure the file name matches **EXACTLY** with the name of the game
        * If you go into the folder `assets/dashboard/avatars` you can manually drop them in here
        * *Beware all the anime you'll see here*
      * Game Backgrounds - If you ever need to add a new game in, add them here.
        * This sets the image for both the title card AND the background
        * Make sure the file name matches **EXACTLY** with the name of the game
        * Note there is some filename sanitizing that occurs, so ':' (colon) or '-' (dash) don't affect it
        * If you go into the folder `assets/dashboard/gameBackgrounds` you can manually drop them in here
      * Game Backgrounds Alt - if you like the title card, but want a different background
        * Follow the same rules as above for "Game Backgrounds"
        * If you have this, the title card will remain the same, but the background will turn into this. Useful if something doesn't look right normally when blown up to the entire BG
    * Ones to ignore
      * Base Layout Examples - primarily just for debugging, helping me set the x/y coordinates
      * Base Layout Layers - for dynamically generating the background and borders
      * Genre Icons - all the little genre images and their text



===============

# NodeCG

[![NodeCG](https://raw.githubusercontent.com/nodecg/nodecg/master/media/splash.png)](http://nodecg.com/)

[![Discord](https://img.shields.io/discord/423233465643827211.svg?logo=discord)](https://discord.gg/NNmVz4x)
[![Build Status](https://github.com/nodecg/nodecg/workflows/CI/badge.svg)](https://github.com/nodecg/nodecg/actions?query=workflow%3ACI)
[![Coverage Status](https://codecov.io/gh/nodecg/nodecg/branch/master/graph/badge.svg)](https://codecov.io/gh/nodecg/nodecg)
[![Docker Build Status](https://img.shields.io/docker/build/nodecg/nodecg.svg)](https://hub.docker.com/r/nodecg/nodecg/tags/)
[![Twitter](https://img.shields.io/twitter/url/https/twitter.com/fold_left.svg?style=social&label=Follow%20%40NodeCG)](https://twitter.com/NodeCG)

NodeCG is a broadcast graphics framework and application. It enables you to write complex, dynamic broadcast graphics
using the web platform. NodeCG has no graphics or drawing primitives of its own. Instead, NodeCG provides
a structure for your code and an API to facilitate moving data between the dashboard, the server, and your graphics.
It makes no assumptions about how to best code a graphic, and gives you complete freedom to use whatever libraries,
frameworks, tools, and methodologies you want. As such, NodeCG graphics can be rendered in any environment that
can render HTML, including:

- [OBS Studio](https://obsproject.com/)
- [vMix](http://www.vmix.com/)
- [XSplit](https://www.xsplit.com/)
- [CasparCG](https://github.com/CasparCG/server/releases) (v2.2.0+)

> Don't see your preferred streaming software on this list? NodeCG graphics require Chrome 49 or newer. If your streaming software's implementation of browser source uses a build of CEF that is based on at least Chrome 49, chances are that NodeCG graphics will work in it. You can check what version of Chrome your streaming software uses for its browser sources by opening [whatversion.net/chrome](http://www.whatversion.net/chrome) as a browser source.

Have questions about NodeCG, or just want to say 'hi'? [Join our Discord server](https://discord.gg/NNmVz4x)!

## Documentation & API Reference

Full docs and API reference are available at https://nodecg.com

## Goals

The NodeCG project exists to accomplish the following goals:

- Make broadcast graphics (also known as "character generation" or "CG") more accessible.
- Remain as close to the web platform as possible.
- Support broadcasts of any size and ambition.

Let's unpack what these statements mean:

### > Make broadcast graphics (also known as "character generation" or "CG") more accessible

Historically, broadcast graphics have been expensive. They either required expensive hardware, expensive software, or both. NodeCG was originally created to provide real-time broadcast graphics for Tip of the Hats, which is an all-volunteer charity fundraiser that had a budget of \$0 for its first several years.

Now, it is possible to create an ambitious broadcast using entirely free software and consumer hardware. The NodeCG project embraces this democratization of broadcast technology.

### > Remain as close to the web platform as possible

NodeCG graphics are just webpages. There is absolutely nothing special or unique about them. This is their greatest strength.

By building on the web platform, and not building too many abstractions on top of it, people developing broadcast graphics with NodeCG have access to the raw potential of the web. New APIs and capabilities are continually being added to the web platform, and NodeCG developers should have access to the entirety of what the web can offer.

### > Support broadcasts of any size and ambition

NodeCG's roots are in small broadcasts with no budget. More recently, NodeCG has begun seeing use in increasingly elaborate productions. We believe that one set of tools can and should be able to scale up from the smallest show all the way to the biggest fathomable show. Whether you're using OBS for everything, or a hardware switcher with a traditional key/fill workflow, NodeCG can be a part of any broadcast graphics system.

## Maintainers

- [Alex "Lange" Van Camp](https://alexvan.camp)
- [Matt "Bluee" McNamara](https://mattmcn.com/)
- [Keiichiro "Hoishin" Amemiya](https://hoish.in/)

## Designers

- [Chris Hanel](http://www.chrishanel.com)

## Acknowledgements

- [Atmo](https://github.com/atmosfar), original dashboard concept and code, the inspiration for toth-overlay
- [Alex "Lange" Van Camp](http://alexvan.camp), designer & developer of [toth-overlay](https://github.com/TipoftheHats/toth-overlay), the base on which NodeCG was built
