class Layout {

  constructor() {
    this.replicant;
    this.replicantValues;

    this.baseImageSrc;
    this.players;
    this.resolutions;

    this.start();
  }

  start = () => {
    this.replicant = nodecg.Replicant("fieldValues");
    const { name, namespace } = this.replicant;

    nodecg.readReplicant(name, namespace, replicantValues => {
      this.replicantValues = replicantValues;
      this.setLayoutName();
      this.setBaseImage();
      this.setFields();
    })
  }

  setLayoutName = () => {
    this.players = this.replicantValues.playerInfo.numberOfPlayers;
    var { gameName, resolution } = this.replicantValues.mainInfo;
    this.resolution = resolution;
    this.baseImageSrc = "/assets/dashboard/baseLayouts" + this.players + "P/base" + this.resolution + ".png";

    gameName = gameName.replace(/I Wanna /i, "");
    if (resolution === "600" || resolution === "608") resolution = "800x" + resolution;
    document.title = this.players + "P " + resolution + " - " + gameName;

    // var asset = nodecg.Replicant("assets:baseLayouts" + players + "P");
    // const { name, namespace } = asset;
    //
    // nodecg.readReplicant(name, namespace, replicantValues => {
    //   console.log(name, namespace, replicantValues)
    // })
  }

  setBaseImage = () => {
    const baseImage = $("<img>", {
      id: "baseImage",
      src: this.baseImageSrc
    });
    baseImage.css({ "z-index": layouts["z-index"]["base"] });
    $("body").append(baseImage);
  }

  setFields = () => {


    this.setGenres();
    // debugger
    // ["mainInfo", "playerInfo"].forEach(fieldGroup => {
    //     fieldGroups[fieldGroup].fields.forEach(field => {
    //       // console.log(field)
    //       var fieldSanitized = sanitize(field.fieldName);
    //       console.log(fieldSanitized)
    //       var replicant = nodecg.Replicant(fieldGroup + "_field_" + fieldSanitized);
    //       this.fields[fieldSanitized] = {
    //         replicant: replicant
    //       }
    //       this.replicants.push(replicant);
    //     })
    // })
    // console.log(this.fields)
  }

  setGenres = () => {
    // debugger

    var id = className = "genreBorder";
    var src = "baseLayoutsOther/" + id + ".png";
    var layoutInfo = layouts[this.players + "P"][this.resolution][id];
    this.createImage({id, className, src, layoutInfo});

    var id = "gimmick";
    var className = "genre";
    var src = "genreIcons/" + id + ".png";
    var layoutInfo = layouts[this.players + "P"][this.resolution][className][id];

    this.createImage({id, className, src, layoutInfo});
  }

  // helpers

  createImage = ({ id, className, src, layoutInfo }) => {
    console.log(id)
    console.log(className)
    console.log(src)
    console.log(layoutInfo)
    var { left, top } = layoutInfo;
    var img = $("<img>", {
      id: id,
      class: className,
      src: "/assets/dashboard/" + src,
      css: {
        left: left,
        top: top,
        "z-index": this.getZindex(className)
      }
    })
    $("body").append( img );
  }

  getZindex = (name) => {
    return layouts["z-index"][name];
  }

}
