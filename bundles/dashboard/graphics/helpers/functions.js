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

      this.setBaseImage();
      this.setGameImage();
      this.setHashtag();
      this.setRunInfo();
      this.setGenres();
      this.setBorders();

      this.setPlayerInfo();
      console.log(this)
    });
  };

  setFields = (replicantValues) => {
    this.replicantValues = replicantValues;
    // future: will have "adminPanel"
    ["mainInfo", "playerInfo"].forEach(fieldGroup => {
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
    const gameName = this.fields.gameName.replace(/I Wanna /i, "");
    const pixelNames = ["600", "608"];
    const resolution = (pixelNames.indexOf(this.fields.resolution) >= 0 ? "800x" : "") + this.fields.resolution;
    document.title = this.fields.numberOfPlayers + "P " + resolution + " - " + gameName;
  };

  setBaseImage = () => {
    // const output = "/assets/dashboard/baseLayoutsOther/10 608 example.png"; // todo: debugging tool as reference, change as needed, remove when done
    // const output = "/assets/dashboard/baseLayoutLayers/background.png"; // todo: debugging tool as reference, change as needed, remove when done
    const id = "baseImage";
    const className = "base";
    const output = "baseLayouts" + this.fields.numberOfPlayers + "P/base" + this.fields.resolution + ".png";
    this.createElement(id, className, output, "", "img");
  };

  setGameImage = (type = "BG") => {
    var id = "gameImage";
    var className = "gameImage";
    var bgInfo;
    const output = "gameBackgrounds/" + this.fields.gameName + ".png";

    if (type === "BG") {
      id += "BG";
      className += " fullSize";
      bgInfo = { opacity: "0.1" }; //todo: this.fields.backgroundOpacity min.1 max.4
    }

    // full size
    this.createElement(id, className, output, bgInfo, "img");

    // if (layout  camera && player's camera on) //titleCard
  };

  setHashtag = () => {
    const id = "hashtag";
    const className = "primary";
    const text = "#FangameMarathon";
    const locationInfo = this.getLocationInfo(id);
    this.createElement(id, className, text, locationInfo, "text");
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
    var locationInfo = this.getLocationInfo(id);
    this.createElement(id, className, src, locationInfo, "img");

    const gameGenres = this.fields.genres.split("; ");
    fieldGroups.mainInfo.fields.find(field => field.fieldName === "Genres").options.forEach(field => {
      if (gameGenres.includes(field)) {
        const id = sanitize(field);
        const className = "genre";
        const src = "genreIcons/" + id + ".png";
        const genreLocationInfo = this.getOffsetLocationInfo(locationInfo, layouts.offsets.genre[id]);
        this.createElement(id, className, src, genreLocationInfo, "img");
      };
    });
  };

  setBorders = () => {
    this.setBorder("titleCard");
    this.setBorder("timer");
    this.setBorder("genres");
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

    const gameEdge = cornerSize - 2;
    var fillLocationInfo = { left: sL + 1, top: sT + 1, width: oL + gameEdge, height: oT + gameEdge, borderRadius: cornerSize + "px" };

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
    this.createElement(type + "Fill", "fill fill" + fillClass, "fill", fillLocationInfo, "fill");
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
      case "titleCard":
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
      hashmap[direction] = locationInfo[direction] + offsets[direction];
      return hashmap;
    }, {});
  };

  createElement = (id, className, output, locationInfo = {}, type) => {
    var { left, top, right, bottom, width, height, backgroundColor, borderRadius, opacity } = locationInfo;

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
      css: {
        left: left, top: top, right: right, bottom: bottom, width: width, height: height,
        "background-color": backgroundColor, "border-radius": borderRadius, opacity: opacity
      }
    });

    // console.log("div[0]:", div[0]);
    // console.log("-------------------------------------------------------------")
    $("#container").append( div );
  };

};
