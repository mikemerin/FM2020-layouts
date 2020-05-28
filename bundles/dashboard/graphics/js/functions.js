class Layout {

  constructor() {
    this.replicant;
    this.replicantValues;
    this.url = "";
    // this.start();
  }

  start = () => {
    this.replicant = nodecg.Replicant("fieldValues");
    const { name, namespace } = this.replicant;

    nodecg.readReplicant(name, namespace, replicantValues => {
      this.replicantValues = replicantValues;
      this.setLayoutName();
      this.setBaseImage();
    })
  }

  setLayoutName = () => {
    const players = this.replicantValues.playerInfo.numberOfPlayers;
    const resolution = this.replicantValues.mainInfo.resolution;
    this.url = "/assets/dashboard/baseLayouts" + players + "P/base" + resolution + ".png";
    // var asset = nodecg.Replicant("assets:baseLayouts" + players + "P");
    // const { name, namespace } = asset;
    //
    // nodecg.readReplicant(name, namespace, replicantValues => {
    //   console.log(name, namespace, replicantValues)
    // })
  }

  setBaseImage = () => {
    const baseImage = $("<img>", {
      src: this.url
    })
    console.log(this)
    console.log(baseImage)
    $("body").append(baseImage);
  }

  setFields = () => {
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

}
