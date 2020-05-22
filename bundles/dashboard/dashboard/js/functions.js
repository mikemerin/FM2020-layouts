// Main Functions

// todo: for the inputs, make them their own classes
// todo: make helper hashmap for types (text/number vs. radio/checkbox vs. dropdown)

class DashboardForm {

  constructor(fieldGroup) {
    this.name = fieldGroup;
    this.fields = fieldGroups[fieldGroup].fields;
    this.replicant;
    this.replicantValues;
    this.dashboardFields = [];
    this.generateForm();
  }

  generateForm = () => {
    this.replicant = nodecg.Replicant("fieldValues");
    var { name, namespace } = this.replicant;

    nodecg.readReplicant(name, namespace, replicantValues => {
      this.replicantValues = replicantValues;
      this.fields.forEach(fieldGroupField => {
        const sanitizedFieldName = sanitize(fieldGroupField.fieldName);
        const value = (this.replicantValues[this.name] ? this.replicantValues[this.name][sanitizedFieldName] : "");

        var dashboardField = new DashboardField({sanitizedFieldName, value, ...fieldGroupField});

        var brClear = $("<br>", { clear: "all" });
        $("#" + this.name + "Fields").append(dashboardField.dashboardField, brClear, "<br>");
        this.dashboardFields.push(dashboardField);
      })
    })
    this.createSaveButton();
  };

  createSaveButton() {
    var button = $("<button>", {
      text: "Save " + fieldGroups[this.name].name,
      class: "saveButton",
      click: (e) => {
        e.preventDefault();
        this.dashboardFields.forEach(({sanitizedFieldName, value}) => {
          this.replicantValues[this.name][sanitizedFieldName] = value;
        })
        var { name, namespace } = this.replicant;
        // todo: cleanup of this replicant, aka if a field in fieldGroups.json doesn't exist, remove it from the replicant
        nodecg.readReplicant(name, namespace, replicantValues => {
          var newValues = {...replicantValues, ...{[this.name]: this.replicantValues[this.name]}}
          this.replicantValues = newValues;
          this.replicant.value = this.replicantValues;
        })
      }
    });
    $("#" + this.name + "Save").append(button);
  }

};

class DashboardField {

  constructor({
    defaultValue,
    fieldName,
    options,
    optional,
    placeholder,
    replicantValues,
    sanitizedFieldName,
    type,
    value
  }) {
    this.defaultValue = defaultValue;
    this.fieldName = fieldName;
    this.options = options;
    this.optional = optional;
    this.placeholder = placeholder;
    this.sanitizedFieldName = sanitizedFieldName;
    this.type = type;
    this.value = value;
    this.dashboardField;
    this.createDashboardField();
  }

  createDashboardField = () => {
    this.dashboardField = $("<div>", { id: this.sanitizedFieldName + "Div" });
    var label = $("<label>", { text: this.fieldName });
    if (this.optional) label[0].innerHTML += "<i class='smallLabel'> (optional)</i>";
    var input;

    switch(this.type) {
      case "text":
      case "number":
        input = this.createTextBox();
        break;
      case "radio":
      case "checkbox":
        input = this.createSelectGroup();
        break;
      case "dropdown":
        input = this.createDropdown();
        break;
      default: ""; break;
    }
    this.dashboardField.append(label, "<br>", input);
  }

  createTextBox = () => {
    // console.log(this.replicantValues)
    return $("<input>", {
      id: this.sanitizedFieldName,
      value: this.value,
      type: this.type,
      placeholder: this.placeholder || "",
      blur: () => { this.value = $("#" + this.sanitizedFieldName).val() }
    });
  };

  createSelectGroup = () => {
    var group = $("<div class='" + this.type + "-group'>", { id: this.sanitizedFieldName + "Group" });

    var maxLength = Math.max.apply(null, [...this.options.map(x => x.toString().length)]);
    var columns = Math.floor(31 / maxLength); // with Courier New, Courier, monospace, 32 max fits in 2 wide
    if (columns > 6) columns = 6;
    var width = (100 / columns) - 2 + "%";
    // console.log(options, maxLength, columns, width)

    var values = this.value.split("; ");
    if (values === "" && this.defaultValue) values = this.defaultValue;

    this.options.forEach((text, i) => {
      // console.log(text)
      var id = sanitize(text);

      var select = $("<input>", {
        width: width,
        type: this.type,
        id: id,
        name: this.sanitizedFieldName,
        value: text,
        checked: values.includes(text),
        click: () => {
          var choices = [];
          $("input[name$='" + this.sanitizedFieldName + "']").filter((i,input) => $(input).is(":checked")).each((i,x) => choices.push(x.value));
          this.value = choices.join("; ");

        }
      });
      var label = $("<label>", {
        width: width,
        for: id,
        text: text,
      });
      group.append(select, label);
    });
    return group;
  };

  createDropdown = () => { // note: untested
    var dropdown = $("<select>", {
      id: this.sanitizedFieldName
    });

    this.options.forEach(text => {
      var option = $("<option>", {
        value: sanitize(text),
        text: text,
        // click: () => {  } // todo: implement this
      });
      dropdown.append(option);
    });

    return dropdown;
  };

  // todo: implement this, extracting the switch cases above
  getValue = () => {

  }

}

class Players {

  constructor() {

  }



}


const setLayoutButton = () => {
  var layoutButton = $("#createLayoutButton");
  var layoutInfo = {
    "prefix": "layout",
    "numberOfPlayers": "N/A",
    "resolution": "N/A"
  }

  var numberOfPlayers = nodecg.Replicant("playerInfo_field_numberOfPlayers");
  var resolution = nodecg.Replicant("mainInfo_field_resolution");

  [numberOfPlayers, resolution].forEach(replicant => {
    replicant.on('change', (newValue, oldValue) => {
      const replicantName = replicant.name.split("_")[2]
      layoutInfo[replicantName] = newValue || "N/A";

      var { prefix, numberOfPlayers, resolution } = layoutInfo;
      const layoutName = [prefix, numberOfPlayers, resolution].join("_");

      layoutButton.text( "Load " + layoutName );
      layoutButton.off();
      layoutButton.on("click", (e) => {
        e.preventDefault();
        if (numberOfPlayers !== "N/A" && resolution !== "N/A") {
          var url = "http://localhost:9090/bundles/dashboard/graphics/" + layoutName + ".html";
          window.open(url);
        };
      });
    });
  })
};
