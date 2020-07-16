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
    const searchParameters = this.getSearchParameters();
    const params = ["gameName", "runNumber", "saveImage"].reduce((acc, param) => {
      if (searchParameters[param]) acc[param] = searchParameters[param];
      return acc;
    }, {});

    const hasParams = Object.keys(params).length;

    this.replicant = nodecg.Replicant(hasParams ? "runs" : "fieldValues");
    const runOrder = nodecg.Replicant("oengusRunOrder");

    const { name, namespace } = this.replicant;
    const { name: runOrderName, namespace: runOrderNamespace } = runOrder;

    nodecg.readReplicant(name, namespace, replicantValues => {
      nodecg.readReplicant(runOrderName, runOrderNamespace, runOrderReplicantValues => {
        this.runOrder = runOrderReplicantValues.filter(x => x.gameName);
        let gameInfo;
        if (hasParams) {
          if (params.gameName) {
            gameInfo = replicantValues[sanitize(decodeURI(params.gameName))];
          } else if (params.runNumber) {
            // todo: store in replicant first, then ping here
          }
        } else {
          gameInfo = replicantValues;
        }

        this.setFields(gameInfo);
        this.setLocations();

        this.setBaseImage();
        this.setBorders();
        this.setGameImage();
        this.setGenres();
        this.setHashtag();
        this.setLayoutName();
        this.setMarqueeText();
        this.setRunInfo();

        this.setPlayerInfo();
        this.setChromaKeyColor(); // note: needs to be last

        this.createSaveImageButton();

        if (params.saveImage) this.saveGameImage();
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

  // ------

  setMarqueeText = () => {

    const formatRunInfo = ({gameName, runners}, type) => {
      const runnerText = runners.length ? ` by ${runners.map(x => x.username).join(", ")}` : "";
      return `${type} game: ${gameName}${runnerText}`;
    };

    var lines = [
      // "Fangame Marathon 2020 is brought to you by The Wannabes! This is a very long line of text to test stuff out.",
      "Fangame Marathon 2020 is brought to you by The Wannabes!",
      "Be sure to show your support for our runners by following them!",
      "Visit www.fangam.es for more IWBTG games!"
    ];

    const sanitizedGameName = sanitize(this.fields.gameName);

    this.runOrder.forEach(({gameName, runners}, i) => {
        if (sanitize(gameName) === sanitizedGameName) {
            if (this.runOrder[i-1]) lines.push( formatRunInfo(this.runOrder[i-1], "Previous") );
            if (this.runOrder[i+1]) lines.push( formatRunInfo(this.runOrder[i+1], "Next") );
        };
    });

    const textInfo = this.locations.announcement;
    const animationInfo = {
      animationType: "flyIn",
      elementType: "text",
      direction: this.locations.announcementFlyIn || "left",
    };

    const id = "announcement";
    this.createElement(id, `${id} primary`, "", textInfo, "container", id);
    this.createTimeline(lines, 0, id, animationInfo);
  }

  createTimeline = (lines, line, id, animationInfo) => {
    const { animationType, elementType, direction } = animationInfo;
    var primaryOffset = 0;
    var wrapper = document.querySelector(`#${id}`);
    if (elementType === "text") wrapper.innerText = lines[line]; // todo: wrap the elementType in a function, link with complete
    if (elementType === "image") wrapper.src = "/assets/dashboard/" + lines[line];

    if (animationType === "flyIn") {
      const [flyInTranslateX, flyInTranslateY] = direction === "top" ? [[-90,0] , [-30,0]] : [[-170,0] , [20,0]];
      const letterClass = `${id}Letter`;
      if (elementType === "text") { // todo: wrap this in a function, link with complete
        wrapper.innerHTML = wrapper.textContent.split(" ").map(word => "<span class='word nowrap'>" + word.replace(/\S/g, `<span class='letter ${letterClass}'>$&</span>`) + "</span>" ).join(" ");
      };

      animate.timeline({ })
      .add({
        targets: `#${id}, .${letterClass}`,
        translateX: flyInTranslateX,
        translateY: flyInTranslateY,
        rotate: [-5,0],
        scale: [.8,1],
        opacity: [-.5,1],
        easing: "easeInOutBack",
        duration: 5000,
        delay: (el, i) => 40 * i,
        offset: primaryOffset
      })
      .add({
        targets: `.${letterClass}`,
        translateY: [0,-2,0],
        scale: [1,.8,1],
        easing: "easeInSine",
        duration: 1000,
        delay: (el, i) => 100 + 25 * i,
        offset: primaryOffset + 8000
      })
      .add({
        targets: `.${letterClass}`,
        translateZ: [0,-300],
        translateY: [0,10],
        opacity: [1,0],
        scale: [1,.8],
        easing: "easeInOutBack",
        duration: 2000,
        delay: (el, i) => 100 + 20 * i,
        offset: primaryOffset + 12000,
        complete: () => { this.createTimeline(lines, (line + 1) % lines.length, id, animationInfo) }
      });
    } else if (animationType === "swap") {
      let translateXY, translateA, translateB, scaleA = 1, scaleB;
      if (["top", "bottom"].includes(direction)) {
        translateXY = "translateY";
        [translateA,translateB] = (direction === "top" ? [-28,0] : [28,0]);
        scaleB = .5;
      } else {
        translateXY = "translateX";
        [translateA,translateB] = (direction === "left" ? [-28,0] : [28,0]);
        scaleB = 1;
      }

      animate.timeline({ })
      .add({
        targets: `#${id}`,
        translateZ: [0,-400],
        [translateXY]: [translateB, translateA],
        scale: [scaleA, scaleB],
        opacity: [1,0],
        easing: "easeInOutBack",
        duration: 2500,
        offset: primaryOffset + 3000,
        complete: () => {
          line = (line + 1) % lines.length;
          if (elementType === "text") wrapper.innerText = lines[line];
          if (elementType === "image") wrapper.src = "/assets/dashboard/" + lines[line];
        }
      })
      .add({
        targets: `#${id}`,
        translateZ: [-500,0],
        [translateXY]: [translateA, translateB],
        scale: [scaleB, scaleA],
        opacity: [0,1],
        easing: "easeInOutBack",
        duration: 2500,
        offset: primaryOffset + 5000,
        complete: () => { this.createTimeline(lines, line, id, animationInfo) }
      })
    } else if (animationType === "collapse") {
      let scaleXY = "scale" + (direction === "horizontal" ? "X" : "Y")
      // todo: work for text

      animate.timeline({ })
      .add({
        targets: `#${id}`,
        translateZ: [0,-500],
        [scaleXY]: [1,0],
        opacity: [1,.2],
        easing: "easeInOutBack",
        duration: 2500,
        offset: primaryOffset + 3000,
        complete: () => {
          line = (line + 1) % lines.length;
          if (elementType === "text") wrapper.innerText = lines[line];
          if (elementType === "image") wrapper.src = "/assets/dashboard/" + lines[line];
        }
      })
      .add({
        targets: `#${id}`,
        translateZ: [-500,0],
        [scaleXY]: [0,1],
        opacity: [.2,1],
        easing: "easeInOutBack",
        duration: 2500,
        offset: primaryOffset + 5000,
        complete: () => { this.createTimeline(lines, line, id, animationInfo) }
      })
    }
  };

  setLayoutName = () => {
    const gameNameTitle = getGameNameTitle(this.fields.gameName);
    const pixelNames = ["600", "608"];
    const resolution = (pixelNames.indexOf(this.fields.resolution) >= 0 ? "800x" : "") + this.fields.resolution;
    document.title = this.fields.numberOfPlayers + "P " + resolution + " - " + gameNameTitle;
  };

  setChromaKeyColor = () => {
    const chromaKeyColor = this.fields.chromaKeyColor || "green";
    const conversion = {
      "red": "#FF0000",
      "green": "#00FF00",
      "blue": "#0000FF",
      "pink": "#FF69B4",
      "orange": "#FF4500"
    };
    $(".fillChromaKey").css({ "background-color": conversion[chromaKeyColor] });
  }

  setBaseImage = () => {
    // const output = "baseLayoutExamples/4P-600-example.png"; // todo: debugging tool as reference, change as needed, remove when done
    // const output = "baseLayouts/2P-base608.png"; // todo: debugging tool as reference, change as needed, remove when done
    const output = "baseLayoutLayers/background.png"; // primary, use after debugging
    const id = "baseImage";
    const className = "BG";
    this.createElement(id, className, output, "", "img", className);
  };

  setGameImage = (locationInfo, gameName = this.fields.gameName) => {
    const id = "gameImage";
    const className = "gameImage";
    gameName = sanitizeFilename(gameName);
    const output = "gameBackgrounds/" + gameName + ".png";

    if (doesFileExist(output, true)) {
      if (locationInfo) {
        this.createElement(id, className + " primary", output, locationInfo, "img", "titleCard");
      } else {
        // console.log(this.fields)
        const backgroundCSS = { opacity: this.fields.backgroundOpacity };
        this.createElement(id + "BG", className + " fullSize dim", output, backgroundCSS, "img", "BG");
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

    this.createElement(hashtagId,     hashtagClass,     text, hashtagInfo,    "text", "hashtag");
    this.createElement(outlineBotId,  outlineBotClass,  "",   outlineBotInfo, "fill", "hashtag");
    this.createElement(outlineTopId,  outlineTopClass,  "",   outlineTopInfo, "fill", "hashtag");
  };

  setRunInfo = () => {
    const { category, createdBy, estimate, gameName, worldRecord, wrHolder } = this.fields; // todo: add checks here if no WR aka N/A
    const baseId = "runInfo"
    const className = `${baseId} primary`;
    const locationInfo = this.getLocationInfo(baseId);
    let text = gameName,
        textSwap = "Created By " + createdBy,
        text2, text2Swap, locationInfo2,
        text3, text3Swap, locationInfo3; // todo: turn into text = {}, locationInfo = {}

    const animationInfo = {
      animationType: "collapse",
      elementType: "text",
      direction: "vertical",
    };

    const runInfoLines = this.getLocationInfo("runInfoLines");

    if (runInfoLines === 1) { // todo: clean up and make all have 1 2 or 3, with the tests be if > 1, if > 2, etc
      text = gameName + " (" + category + ") - estimate: " + estimate;
      textSwap = "Created By " + createdBy + " - " + category + " WR " + worldRecord + " by " + wrHolder;
    } else if (runInfoLines === 3) {
      text2 = category;
      text2Swap = category;
      text3 =  "estimate: " + estimate
      text3Swap = "WR " + worldRecord + " by " + wrHolder;
      locationInfo2 = this.getOffsetLocationInfo(locationInfo, layouts.offsets.runInfo2);
      locationInfo3 = this.getOffsetLocationInfo(locationInfo, layouts.offsets.runInfo3);
      if (locationInfo.textAlign) {
        const { width, textAlign } = locationInfo; // todo: double check if just textAlign: right and no width if this still works
        locationInfo2 = {...locationInfo2, width: width, textAlign: textAlign };
        locationInfo3 = {...locationInfo3, width: width, textAlign: textAlign };
      };
      this.createElement(baseId + 2, className, text2, locationInfo2, "text", baseId);
      this.createTimeline([text2, text2Swap], 0, baseId + 2, animationInfo)
      this.createElement(baseId + 3, className, text3, locationInfo3, "text", baseId);
      this.createTimeline([text3, text3Swap], 0, baseId + 3, animationInfo)
    } else {
      text2 = category + " - estimate: " + estimate;
      text2Swap = category + " WR " + worldRecord + " by " + wrHolder;
      locationInfo2 = this.getOffsetLocationInfo(locationInfo, layouts.offsets.runInfo2);
      if (locationInfo.textAlign) {
        const { width, textAlign } = locationInfo; // todo: double check if just textAlign: right and no width if this still works
        locationInfo2 = {...locationInfo2, width: width, textAlign: textAlign };
      };
      this.createElement(baseId + 2, className, text2, locationInfo2, "text", baseId);
      this.createTimeline([text2, text2Swap], 0, baseId + 2, animationInfo)
    };
    this.createElement(baseId + 1, className, text, locationInfo, "text", baseId);
    this.createTimeline([text, textSwap], 0, baseId + 1, animationInfo)
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

    this.createElement(id, className, src, locationInfo, "img", "genres"); // future: lazy paste in over the existing border; works as is, in the future will create (BG dependent on the fills)

    var skipGenre = "";

    if (this.fields.otherGenres !== "N/A") {
      skipGenre = locationInfo.alt ? "needle" : "gimmick"; // future: choose where to replace (input in the dashboard)
      const otherId = sanitize(this.fields.otherGenres);
      const otherClassName = "genre bright";
      const otherSrc = "genreIcons/" + otherId + ".png";
      const otherGenreLocationInfo = this.getOffsetLocationInfo(locationInfo, layouts.offsets[layoutLocation][skipGenre]);
      this.createElement(otherId, otherClassName, otherSrc, otherGenreLocationInfo, "img", "genres");
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
        this.createElement(id, className, src, genreLocationInfo, "img", "genres");
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
      this.createElement(borderId, className, src, locationInfo[id], "img", type);
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
      this.createElement(type + "Fill", "fill fill" + fillClass, "fill", fillLocationInfo, "fill", type);
    }
  }

  setPlayerInfo = () => {
    var players = parseInt(this.fields.numberOfPlayers, 10);
    const tId = "twitchIcon";
    const tClassName = "primary twitchIcon";
    const twitchSrc = "baseLayoutLayers/" + tId + ".png";

    for (let playerNumber = 1; playerNumber <= players; playerNumber++) {
      const pIdIcon = tId + playerNumber;
      const pIdText = "player" + playerNumber;
      const pClassName = "primary";
      let twitchHandle = this.fields["player" + playerNumber + "_twitchHandle"];
      let displayName = this.fields["player" + playerNumber + "_displayName"] || twitchHandle;
      const avatarSrc = "avatars/" + twitchHandle + ".png";

      const tLocationInfo = this.getLocationInfo(tId, "player", playerNumber);
      const offsetInfo = this.getLocationInfo("offset", "player", playerNumber);
      const pLocationInfo = this.getOffsetLocationInfo(tLocationInfo, offsetInfo);
      let direction;

      const animationInfo = {
        animationType: "swap",
        elementType: "text",
        direction: tLocationInfo.flyIn || (pLocationInfo.left ? "left" : "right"),
      };

      const iconAnimationInfo = {
        animationType: "collapse",
        elementType: "image",
        direction: tLocationInfo.flyIn || "horizontal"
      };

      pLocationInfo.fontSize = layouts.playerTextSizes[this.fields.numberOfPlayers + "P"];
      if (pLocationInfo.textAlign === "center") pLocationInfo.width = "100%";

      this.setBorder("gameBorder", playerNumber);

      this.createElement(pIdIcon, tClassName, twitchSrc,  tLocationInfo, "img", "player");
      this.createElement(pIdText, pClassName, twitchHandle, pLocationInfo, "text", "player");
      this.createTimeline([twitchHandle, displayName], 0, pIdText, animationInfo);
      this.createTimeline([twitchSrc, avatarSrc], 0, pIdIcon, iconAnimationInfo);
    };
  };

  createSaveImageButton = () => {
    $("#saveImage").append( $("<button>", {
      id: "saveImageButton",
      text: "Save Image",
      class: "saveButton",
      click: (e) => {
        e.preventDefault();
        this.saveGameImage();
      }
    }));
  }

  saveGameImage = () => {
    html2canvas(document.querySelector("#graphics")).then(canvas => {
        canvas.id = "canvasImage";
        const link = $("#saveImageLink")[0];
        $("#saveImage").append(canvas);

        link.setAttribute("download", `${sanitizeFilename(this.fields.gameName)}.png`);
        link.setAttribute("href", canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
        link.click();

        $("#canvasImage").remove();
        document.addEventListener('finished', null)
    });
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
        outputKey = "container";
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

    if (appendLocation) {
      const containerName = `container_${appendLocation}`;
      const loc = $(`#${containerName}`);
      if (!loc.length) this.createElement(containerName, "", "", locationInfo = {}, "container");
      $(`#${containerName}`).append( div );
    } else {
      $("#graphics").append( div );
    }
  };

};
