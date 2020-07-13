class Layout {

  constructor() {
    this.replicant;
    this.replicantValues;
    this.runOrder = [];
    this.fields = {};
    this.locations = {};

    this.baseImageSrc;

    this.start();
  };

  getSearchParameters = () => {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? this.transformToAssocArray(prmstr) : {};
  };

  transformToAssocArray = ( prmstr ) => {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
  };

  start = () => {
    const gameName = this.getSearchParameters().gameName; // todo: explain this
    const runNumber = this.getSearchParameters().runNumber;
    const params = [gameName, runNumber].filter(x => x).length;
    this.replicant = nodecg.Replicant(params ? "runs" : "fieldValues");
    const { name, namespace } = this.replicant;
    const runOrder = nodecg.Replicant("oengusRunOrder");
    const { name: runOrderName, namespace: runOrderNamespace } = runOrder;


    nodecg.readReplicant(name, namespace, replicantValues => {
      nodecg.readReplicant(runOrderName, runOrderNamespace, runOrderReplicantValues => {
        this.runOrder = runOrderReplicantValues.filter(x => x.gameName);
        let gameInfo;
        if (params) {
          if (gameName) {
            gameInfo = replicantValues[sanitize(decodeURI(gameName))];
          } else if (runNumber) {
            // todo: store in replicant first, then ping here
          }
        } else {
          gameInfo = replicantValues;
        }

        this.setFields(gameInfo);

        this.setMarqueeText();
        this.setLocations();
        this.setLayoutName();

        this.setBorders();
        this.setBaseImage();
        this.setGameImage();
        this.setHashtag();
        this.setRunInfo();
        this.setGenres();

        this.setPlayerInfo();
        this.setChromaKeyColor(); // note: needs to be last

        // console.log(this)
      });
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

  setMarqueeText = () => { // todo: link up to this.createElement

    var lines = [
      "Fangame Marathon 2020 is brought to you by The Wannabes!",
      "Be sure to show your support for our runners by following them!",
      "Visit www.fangam.es for more IWBTG games!"
    ];

    const sanitizedGameName = sanitize(this.fields.gameName);

    this.runOrder.forEach(({gameName, runners}, i) => {
        if (sanitize(gameName) === sanitizedGameName) {
            // current = { gameName: gameName, runners: runners }
            if (this.runOrder[i-1]) lines.push( this.formatRunInfo(this.runOrder[i-1], "Previous") );
            if (this.runOrder[i+1]) lines.push( this.formatRunInfo(this.runOrder[i+1], "Next") );
        };
    });

    const textInfo = layouts.announcement[this.fields.numberOfPlayers + "P"];

    $("#container").append( $("<div>", {
      id: "announcement",
      class: "announcement primary",
      css: textInfo
    }));

    this.createTimeline(lines, 0);
  }

  formatRunInfo = ({gameName, runners}, type) => {
    const runnerText = runners.length ? ` by ${runners.map(x => x.username).join(", ")}` : "";
    return `${type} game: ${gameName}${runnerText}`;
  };

  createTimeline = (lines, line) => {
    var primaryOffset = 0;
    var textWrapper = document.querySelector("#announcement");
    textWrapper.innerText = lines[line];
    textWrapper.innerHTML = textWrapper.textContent.split(" ").map(word => "<span class='word nowrap'>" + word.replace(/\S/g, "<span class='letter'>$&</span>") + "</span>" ).join(" ")

    animate.timeline({ })
    .add({
      targets: "#announcement, .letter",
      translateX: [-170,0],
      translateY: [20,0],
      rotate: [-5,0],
      scale: [.8,1],
      opacity: [-.5,1],
      easing: "easeInOutBack",
      duration: 5000,
      delay: (el, i) => 40 * i,
      offset: primaryOffset
    })
    .add({
      targets: ".letter",
      translateY: [0,-2,0],
      scale: [1,.8,1],
      easing: "easeInSine",
      duration: 1000,
      delay: (el, i) => 100 + 25 * i,
      offset: primaryOffset + 8000

    })
    .add({
      targets: ".letter",
      translateZ: [0,-300],
      translateY: [0,10],
      opacity: [1,0],
      scale: [1,.5],
      easing: "easeInOutBack",
      duration: 2000,
      delay: (el, i) => 100 + 20 * i,
      offset: primaryOffset + 12000,
      complete: () => { this.createTimeline(lines, (line + 1) % lines.length) }
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
    const gameNameTitle = getGameNameTitle(this.fields.gameName);
    const pixelNames = ["600", "608"];
    const resolution = (pixelNames.indexOf(this.fields.resolution) >= 0 ? "800x" : "") + this.fields.resolution;
    document.title = this.fields.numberOfPlayers + "P " + resolution + " - " + gameNameTitle;
  };

  setChromaKeyColor = () => {
    const { chromaKeyColor } = this.fields || "green";
    const conversion = {
      "red": "#FF0000",
      "green": "#00FF00",
      "blue": "#0000FF",
      "pink": "#FF69B4",
      "orange": "#FF4500"
    };
    // console.log("conversion[chromaKeyColor]:", conversion[chromaKeyColor]);
    $(".fillGS").css({ "background-color": conversion[chromaKeyColor] });

  }

  setBaseImage = () => {
    // const output = "baseLayoutExamples/4P-600-example.png"; // todo: debugging tool as reference, change as needed, remove when done
    // const output = "baseLayouts/2P-base608.png"; // todo: debugging tool as reference, change as needed, remove when done
    const output = "baseLayoutLayers/background.png"; // primary, use after debugging
    const id = "baseImage";
    const className = "base";
    this.createElement(id, className, output, "", "img");
  };

  setGameImage = (locationInfo, gameName = this.fields.gameName) => {
    const id = "gameImage";
    const className = "gameImage";
    gameName = sanitizeFilename(gameName);
    const output = "gameBackgrounds/" + gameName + ".png";

    if (doesFileExist(output, true)) {
      if (locationInfo) {
        this.createElement(id, className + " primary", output, locationInfo, "img");
      } else {
        // console.log(this.fields)
        const backgroundCSS = { opacity: this.fields.backgroundOpacity };
        this.createElement(id + "BG", className + " fullSize dim", output, backgroundCSS, "img");
      };
    }

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
    const locationInfo = this.getLocationInfo(id);
    let text = gameName, text2, text3, locationInfo2, locationInfo3; // todo: turn into text = {}, locationInfo = {}

    const runInfoLines = this.getLocationInfo("runInfoLines");

    if (runInfoLines === 1) { // todo: clean up and make all have 1 2 or 3, with the tests be if > 1, if > 2, etc
      text = gameName + " " + category + " - estimate: " + estimate;
    } else if (runInfoLines === 3) {
      text2 = category;
      text3 =  "estimate: " + estimate
      locationInfo2 = this.getOffsetLocationInfo(locationInfo, layouts.offsets.runInfo2);
      locationInfo3 = this.getOffsetLocationInfo(locationInfo, layouts.offsets.runInfo3);
      if (locationInfo.textAlign) {
        const { width, textAlign } = locationInfo; // todo: double check if just textAlign: right and no width if this still works
        locationInfo2 = {...locationInfo2, width: width, textAlign: textAlign };
        locationInfo3 = {...locationInfo3, width: width, textAlign: textAlign };
      };
      this.createElement(id, className, text2, locationInfo2, "text");
      this.createElement(id, className, text3, locationInfo3, "text");
    } else {
      text2 = category + " - estimate: " + estimate;
      locationInfo2 = this.getOffsetLocationInfo(locationInfo, layouts.offsets.runInfo2);
      if (locationInfo.textAlign) {
        const { width, textAlign } = locationInfo; // todo: double check if just textAlign: right and no width if this still works
        locationInfo2 = {...locationInfo2, width: width, textAlign: textAlign };
      };
      this.createElement(id, className, text2, locationInfo2, "text");
    };
    this.createElement(id, className, text, locationInfo, "text");
  };

  setGenres = () => {
    var id = "genreBorder";
    var layoutLocation = "genre";
    var locationInfo = this.getLocationInfo(id, id);
    if (locationInfo.alt) {  // todo: have "alt" be a key in genres instead of a location property
      id += "Stacked";
      layoutLocation += "Stacked";
    }

    const className = "border";
    const src = "baseLayoutLayers/" + id + ".png";

    this.createElement(id, className, src, locationInfo, "img"); // future: lazy paste in over the existing border; works as is, in the future will create (BG dependent on the fills)

    var skipGenre = "";

    if (this.fields.otherGenres !== "N/A") {
      skipGenre = locationInfo.alt ? "needle" : "gimmick"; // future: choose where to replace (input in the dashboard)
      const otherId = sanitize(this.fields.otherGenres);
      const otherClassName = "genre bright";
      const otherSrc = "genreIcons/" + otherId + ".png";
      const otherGenreLocationInfo = this.getOffsetLocationInfo(locationInfo, layouts.offsets[layoutLocation][skipGenre]);
      this.createElement(otherId, otherClassName, otherSrc, otherGenreLocationInfo, "img");
    };

    const gameGenres = this.fields.genres.split("; ");
    fieldGroups.gameInfo.fields.find(field => field.fieldName === "Genres").options.forEach(field => {
      const id = sanitize(field);
      if (id !== skipGenre) {
        var className = "genre";
        const src = "genreIcons/" + id + ".png";

        const genreLocationInfo = this.getOffsetLocationInfo(locationInfo, layouts.offsets[layoutLocation][id]);
        if (gameGenres.includes(field)) {
          className += " bright";
        } else {
          className += " dim";
        };
        this.createElement(id, className, src, genreLocationInfo, "img");
      };
    });

  };

  getImage = () => { // future: see XMLHttpRequest in global

  }

  setBorders = () => {
    this.setBorder("titleCard");
    if (layouts[this.fields.numberOfPlayers + "P"][this.fields.resolution]["borders"]["titleCard2"]) this.setBorder("titleCard2");
    this.setBorder("timer");
    this.setBorder("genres");  // future: lazy creation in under the pasted border; works as is, in the future will create (BG dependent on the fills)
  };

  setBorder = (type, playerNumber = false) => {
    const { left: sL, top: sT, alt } = this.getLocationInfo("start", type, playerNumber);
    const { left: oL, top: oT } = this.getLocationInfo("offset", type, playerNumber);
    if (type === "genres" && alt) {
      this.setBorder("genresStacked");
    }

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
      let text = this.fields["player" + playerNumber + "_twitchHandle"];

      const tLocationInfo = this.getLocationInfo(tId, "player", playerNumber);
      const offsetInfo = this.getLocationInfo("offset", "player", playerNumber);
      const pLocationInfo = this.getOffsetLocationInfo(tLocationInfo, offsetInfo);

      pLocationInfo.fontSize = layouts.playerTextSizes[this.fields.numberOfPlayers + "P"];
      if (pLocationInfo.textAlign === "center") pLocationInfo.width = "100%";

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
      case "genreBorderStacked": // todo: cleanup
        console.log("location", layout["borders"]["genresStacked"])
        return layout["borders"]["genresStacked"]["start"];
        break;
      case "titleCard":
      case "titleCard2":
      case "timer":
      case "genres":
      case "genresStacked":
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

  createElement = (id, className, output, locationInfo = {}, type, appendLocation) => {
    if (id === "gameImageBG") {
      // todo: ugh, find a better way to do this entirely, maybe a toggle with hashmap, espcially for all the Marios with the same alt BG
      var altOutput = output.split("/");
      altOutput = ["gameBackgroundsAlt", ...altOutput.slice(1)].join("/");
      if (doesFileExist(altOutput, true)) output = altOutput;
    }

    var { left, top, right, bottom, width, height, display, margin, marginLeft, marginRight, backgroundColor, borderRadius, fontSize, textAlign, opacity } = locationInfo;
    const css = {
      left: left, top: top, right: right, bottom: bottom, width: width, height: height,
      display: display, margin: margin, marginLeft: marginLeft, marginRight: marginRight,
      backgroundColor: backgroundColor, borderRadius: borderRadius,
      fontSize: fontSize, textAlign: textAlign,
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
      case "container":
        element = "<div>";
        outputKey = "";
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
    if (appendLocation) {
      $(`#${appendLocation}`).append( div );
    } else {
      $("#container").append( div );
    }
  };

};
