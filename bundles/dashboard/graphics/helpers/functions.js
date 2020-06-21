class Layout {

  constructor() {
    this.replicant;
    this.replicantValues;
    this.fields = {};
    this.locations = {};

    this.baseImageSrc;

    this.start();
  };

  start = () => {
    this.replicant = nodecg.Replicant("fieldValues");
    const { name, namespace } = this.replicant;

    nodecg.readReplicant(name, namespace, replicantValues => {
      this.setFields(replicantValues);

      this.setLocations();
      this.setLayoutName();

      this.setBorders();
      this.setBaseImage();
      this.setGameImage();
      this.setHashtag();
      this.setRunInfo();
      this.setGenres();

      this.setPlayerInfo();
      // console.log(this)
    });
  };

  setFields = (replicantValues) => {
    this.replicantValues = replicantValues;
    // future: will have "adminPanel"
    ["gameInfo", "runInfo", "playerInfo", "adminPanel"].forEach(fieldGroup => {
      const fields = this.replicantValues[fieldGroup];
      Object.keys(fields).forEach(field => {
        this.fields[field] = fields[field];
      });
    });
  };

  setLocations = () => {
    var layoutFields = {};
    const resolutions = layouts[this.fields.numberOfPlayers + "P"];
    this.locations = resolutions[this.fields.resolution];

    // if there's shared location info like (600|800) this will merge them
    Object.keys(resolutions).forEach(resolution => {
      var split = resolution.split("|");
      if (split.length > 1 && split.includes(this.fields.resolution)) {
        this.locations = deepMerge(
          this.locations,
          resolutions[resolution]
        );
      };
    });
  };

  setLayoutName = () => {
    const gameName = this.fields.gameNameTitle;
    const pixelNames = ["600", "608"];
    const resolution = (pixelNames.indexOf(this.fields.resolution) >= 0 ? "800x" : "") + this.fields.resolution;
    document.title = this.fields.numberOfPlayers + "P " + resolution + " - " + gameName;
  };

  setBaseImage = () => {
    // const output = "baseLayouts" + this.fields.numberOfPlayers + "P/base" + this.fields.resolution + ".png"; // todo: debugging tool as reference, change as needed, remove when done
    // const output = "baseLayoutsOther/1P 16by9 example.png"; // todo: debugging tool as reference, change as needed, remove when done
    const output = "baseLayoutLayers/background.png"; // primary, use after debugging
    const id = "baseImage";
    const className = "base";
    this.createElement(id, className, output, "", "img");
  };

  setGameImage = (locationInfo, gameName = this.fields.gameName) => {
    const id = "gameImage";
    const className = "gameImage";
    const output = "gameBackgrounds/" + gameName + ".png";

    if (locationInfo) {
      this.createElement(id, className + " primary", output, locationInfo, "img");
    } else {
      // console.log(this.fields)
      const backgroundCSS = { opacity: this.fields.backgroundOpacity };
      this.createElement(id + "BG", className + " fullSize dim", output, backgroundCSS, "img");
    };
  };

  setHashtag = () => {
    // 255 to 70
    const hashtagId = "hashtag";
    const outlineTopId = hashtagId + "OutlineTop";
    const outlineBotId = hashtagId + "OutlineBot";
    const hashtagClass = "primary";
    const outlineTopClass = "primary fillBWGradient moveRight";
    const outlineBotClass = "primary fillBWGradient moveLeft";
    const text = "#FangameMarathon";

    const { outline, position, text: textPosition } = this.getLocationInfo(hashtagId);
    outline.height = "1px";
    // debugger
    const hashtagInfo = { ...position, ...textPosition };
    const outlineTopInfo = { ...position, ...outline };
    const outlineBotInfo = { ...position, ...outline };

    const width = parseInt(outline.width, 10);
    const offsetLeft = Math.round(width / 93.5);
    const offsetTop = Math.round(width / 41.5);
    const offsetBot = Math.round(width / 5.8);

    outlineTopInfo.left += offsetLeft; outlineTopInfo.top -= offsetTop;
    outlineBotInfo.left += offsetLeft; outlineBotInfo.top += offsetBot;

    // debugger
    changeCSSRule("name", "gradientMovementRight", "100%", "{ background-position: " + outline.width + " 0 }");
    changeCSSRule("name", "gradientMovementLeft", "0%", "{ background-position: " + outline.width + " 0 }");

    this.createElement(hashtagId,     hashtagClass,     text, hashtagInfo,    "text");
    this.createElement(outlineBotId,  outlineBotClass,  "",   outlineBotInfo, "fill");
    this.createElement(outlineTopId,  outlineTopClass,  "",   outlineTopInfo, "fill");
  };

  setRunInfo = () => {
    const { gameName, category, estimate } = this.fields;
    const id = "runInfo";
    const className = "primary";
    const text = gameName;
    const text2 = category + " - estimate: " + estimate;

    const locationInfo = this.getLocationInfo(id);
    const locationInfo2 = this.getOffsetLocationInfo(locationInfo, layouts.offsets.runInfo2);

    this.createElement(id, className, text, locationInfo, "text");
    this.createElement(id, className, text2, locationInfo2, "text");
  };

  setGenres = () => {
    const id = "genreBorder";
    const className = "border";
    const src = "baseLayoutLayers/" + id + ".png";
    var locationInfo = this.getLocationInfo(id, id);
    this.createElement(id, className, src, locationInfo, "img"); // future: lazy paste in over the existing border; works as is, in the future will create (BG dependent on the fills)

    var skipGenre = "";

    if (this.fields.otherGenres !== "N/A") {
      skipGenre = "gimmick"; // future: choose where to replace (input in the dashboard)
      const otherId = sanitize(this.fields.otherGenres);
      const otherClassName = "genre bright";
      const otherSrc = "genreIcons/" + otherId + ".png";
      const otherGenreLocationInfo = this.getOffsetLocationInfo(locationInfo, layouts.offsets.genre[skipGenre]);
      this.createElement(otherId, otherClassName, otherSrc, otherGenreLocationInfo, "img");
    };

    const gameGenres = this.fields.genres.split("; ");
    fieldGroups.gameInfo.fields.find(field => field.fieldName === "Genres").options.forEach(field => {
      const id = sanitize(field);
      if (id !== skipGenre) {
        var className = "genre";
        const src = "genreIcons/" + id + ".png";
        const genreLocationInfo = this.getOffsetLocationInfo(locationInfo, layouts.offsets.genre[id]);
        if (gameGenres.includes(field)) {
          className += " bright";
        } else {
          className += " dim";
        };
        this.createElement(id, className, src, genreLocationInfo, "img");
      };
    });

  };

  getImage = () => {

  }

  setBorders = () => {
    this.setBorder("titleCard");
    if (layouts[this.fields.numberOfPlayers + "P"][this.fields.resolution]["borders"]["titleCard2"]) this.setBorder("titleCard2");
    this.setBorder("timer");
    this.setBorder("genres");  // future: lazy creation in under the pasted border; works as is, in the future will create (BG dependent on the fills)
  };

  setBorder = (type, playerNumber = false) => {
    const { left: sL, top: sT } = this.getLocationInfo("start", type, playerNumber);
    const { left: oL, top: oT } = this.getLocationInfo("offset", type, playerNumber);

    // console.log(type, playerNumber, sL, sT, oL, oT)

    const size = layouts.border[type].cornerSize;
    const fillClass = layouts.border[type].fill;
    const cornerSize = layouts.border.cornerSize[size];
    const sideOffset = cornerSize - 3;
    const sideWidth  = oL - cornerSize;
    const sideHeight = oT - cornerSize;

    // console.log(size, cornerSize, sideOffset, sideWidth, sideHeight)

    var locationInfo = {
      "TL": { left: 0,  top: 0  },
      "TR": { left: oL, top: 0  },
      "BR": { left: oL, top: oT },
      "BL": { left: 0,  top: oT },
      "T":  { left: cornerSize,       top: 0,               height: 3,  width:  sideWidth  },
      "R":  { left: oL + sideOffset,  top: cornerSize,      width: 3,   height: sideHeight },
      "B":  { left: cornerSize,       top: oT + sideOffset, height: 3,  width:  sideWidth  },
      "L":  { left: 0,                top: cornerSize,      width: 3,   height: sideHeight }
    };

    const gameEdge = cornerSize - 6;
    var fillLocationInfo = { left: sL + 3, top: sT + 3, width: oL + gameEdge, height: oT + gameEdge };

    Object.keys(locationInfo).forEach(id => {
      locationInfo[id].left += sL;
      locationInfo[id].top += sT;
      const borderId = type + id;
      const className = "border";
      var sizeName = (id.length > 1 ? size : "");
      const src = "baseLayoutLayers/border" + sizeName + id + ".png";
      this.createElement(borderId, className, src, locationInfo[id], "img");
    });

    // console.log(locationInfo, fillLocationInfo)
    // console.log("type, this.locations.camera, this.fields.player1_camera:", type, this.locations.camera, this.fields.player1_camera);
    const showCamera = this.locations.camera && this.fields.player1_camera; // todo: fix for more than 1 player
    const secondCard = this.locations.borders.titleCard2;
    if (type === "titleCard2" && !showCamera) {
      this.setGameImage(fillLocationInfo, "FM Logo");
    } else if (type === "titleCard" && (!showCamera || secondCard)) {
      this.setGameImage(fillLocationInfo);
    } else {
      this.createElement(type + "Fill", "fill fill" + fillClass, "fill", fillLocationInfo, "fill");
    }
  }

  setPlayerInfo = () => {
    var players = parseInt(this.fields.numberOfPlayers, 10);
    const tId = "twitchIcon";
    const tClassName = "primary";
    const src = "baseLayoutLayers/" + tId + ".png";

    for (let playerNumber = 1; playerNumber <= players; playerNumber++) {
      const pId = "player" + playerNumber;
      const pClassName = "primary";
      const text = this.fields["player" + playerNumber + "_twitchHandle"];

      const tLocationInfo = this.getLocationInfo(tId, "player", playerNumber);
      const offsetInfo = this.getLocationInfo("offset", "player", playerNumber);
      const pLocationInfo = this.getOffsetLocationInfo(tLocationInfo, offsetInfo);

      this.setBorder("gameBorder", playerNumber);

      this.createElement(tId, tClassName, src,  tLocationInfo, "img");
      this.createElement(pId, pClassName, text, pLocationInfo, "text");
    };
  };

  // helpers

  getLocationInfo = (id, type = false, playerNumber = false) => {
    const layout = this.locations;
    switch(type) {
      case "player":
        return layout["player" + playerNumber][id];
        break;
      case "gameBorder":
        return layout["player" + playerNumber][type][id];
        break;
      case "genreBorder":
        return layout["borders"]["genres"]["start"];
        break;
      case "titleCard":
      case "titleCard2":
      case "timer":
      case "genres":
        return layout["borders"][type][id];
        break;
      default:
        return layout[id]
        break;
    }
    return (playerNumber ? layout["player" + playerNumber][id] : layout[id]);
  };

  getOffsetLocationInfo = (locationInfo, offsets) => {
    return Object.keys(offsets).reduce((hashmap, direction) => {
      hashmap[direction] = offsets[direction];
      if (locationInfo[direction] !== undefined) { // for numerals, may have to check for strings like 32px in the future
        hashmap[direction] += locationInfo[direction];
      };
      return hashmap;
    }, {});
  };

  createElement = (id, className, output, locationInfo = {}, type) => {
    // if (locationInfo.fontSize) debugger
    var { left, top, right, bottom, width, height, backgroundColor, borderRadius, fontSize, opacity } = locationInfo;
    const css = {
      left: left, top: top, right: right, bottom: bottom, width: width, height: height,
      backgroundColor: backgroundColor, borderRadius: borderRadius, fontSize: fontSize,
      opacity: opacity || this.backgroundOpacity
    };

    // console.log("id:", id);
    // console.log("className:", className);
    // console.log("output:", output);
    // console.log("locationInfo:", locationInfo);
    // console.log("type:", type);

    var element, outputKey;
    switch(type) {
      case "img":
        element = "<img>";
        outputKey = "src";
        output = "/assets/dashboard/" + output;
        break;
      case "fill":
        element = "<div>";
        outputKey = "fill";
        break;
      case "text":
      default:
        element = "<div>";
        outputKey = "text";
        break;
    };

    var div = $(element, {
      id: id,
      class: className,
      [outputKey]: output,
      css: css
    });

    // console.log("div[0]:", div[0]);
    // console.log("-------------------------------------------------------------")
    $("#container").append( div );
  };

};
