class Layout {

  constructor() {
    this.replicant;
    this.replicantValues;
    this.fields = {};

    this.baseImageSrc;

    this.start();
  };

  start = () => {
    this.replicant = nodecg.Replicant("fieldValues");
    const { name, namespace } = this.replicant;

    nodecg.readReplicant(name, namespace, replicantValues => {
      this.setFields(replicantValues);
      this.setLayoutResolutionIfShared();
      this.setLayoutName();

      this.setBaseImage();
      this.setHashtag();
      this.setRunInfo();
      this.setGenres();
      this.setTitleCard();

      this.setPlayerInfo();
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

  setLayoutResolutionIfShared = () => {
    const resolutions = layouts[this.fields.numberOfPlayers + "P"];
    Object.keys(resolutions).forEach(resolution => {
      var split = resolution.split("|");
      if (split.length > 1 && split.includes(this.fields.resolution)) {
          layouts[this.fields.numberOfPlayers + "P"][this.fields.resolution] = resolutions[resolution];
          return;
      };
    });
  };

  setLayoutName = () => {
    this.baseImageSrc = "/assets/dashboard/baseLayouts" + this.fields.numberOfPlayers + "P/base" + this.fields.resolution + ".png";
    // this.baseImageSrc = "/assets/dashboard/baseLayoutsOther/10 608 example.png"; // todo: debugging tool as reference, change as needed, remove when done

    const gameName = this.fields.gameName.replace(/I Wanna /i, "");
    const pixelNames = ["600", "608"];
    const resolution = (pixelNames.indexOf(this.fields.resolution) >= 0 ? "800x" : "") + this.fields.resolution;
    document.title = this.fields.numberOfPlayers + "P " + resolution + " - " + gameName;
  };


  setBaseImage = () => {
    const baseImage = $("<img>", {
      id: "baseImage",
      class: "base",
      src: this.baseImageSrc
    });
    $("#container").append(baseImage);
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

  setTitleCard = () => {

  };


  setPlayerInfo = () => {
    var players = parseInt(this.fields.numberOfPlayers, 10);
    const tId = "twitchIcon";
    const tClassName = "primary";
    const src = "baseLayoutLayers/" + tId + ".png";

    for (let playerNumber = 1; playerNumber <= players; playerNumber++) {
      const pId = "player" + playerNumber;
      const pClassName = "primary";
      const text = this.fields["player" + playerNumber + "_twitchHandle"];

      const tLocationInfo = this.getLocationInfo(tId, playerNumber);
      const offsetInfo = this.getLocationInfo("offset", playerNumber);
      const pLocationInfo = this.getOffsetLocationInfo(tLocationInfo, offsetInfo);

      this.createElement(tId, tClassName, src,  tLocationInfo, "img");
      this.createElement(pId, pClassName, text, pLocationInfo, "text");
    };
  };


  // helpers

  getLocationInfo = (id, playerNumber = false) => {
    const layout = layouts[this.fields.numberOfPlayers + "P"][this.fields.resolution];
    return (playerNumber ? layout["player" + playerNumber][id] : layout[id]);
  };

  getOffsetLocationInfo = (locationInfo, offsets) => {
    return Object.keys(offsets).reduce((hashmap, direction) => {
      hashmap[direction] = locationInfo[direction] + offsets[direction];
      return hashmap;
    }, {});
  };

  createElement = (id, className, output, locationInfo, type) => {
    var { left, top, right, bottom } = locationInfo;

    var element, outputKey;
    switch(type) {
      case "img":
        element = "<img>";
        outputKey = "src";
        output = "/assets/dashboard/" + output;
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
      css: { left: left, top: top, right: right, bottom: bottom }
    });

    $("#container").append( div );
  };

};
