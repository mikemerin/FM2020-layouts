// Main Functions

// todo: for the inputs, make them their own classes
// todo: make helper hashmap for types (text/number vs. radio/checkbox vs. dropdown)

class DashboardForm {

  constructor(fieldGroup) {
    this.fieldGroup = fieldGroup,
    this.fields = fieldGroups[this.fieldGroup].fields,
    this.fieldActions = {},
    this.generateForm()
  }

  generateForm() {
    this.fields.forEach(({
      fieldName,
      type,
      optional,
      options,
      placeholder
    }) => {
      var input, inputId = "field_" + sanitize(fieldName);
      var div = $("<div>", { id: inputId + "Div" });
      var label = $("<label>", { text: fieldName });
      if (optional) label[0].innerHTML += "<i class='smallLabel'> (optional)</i>";
      var brClear = $("<br>", { clear: "all" });

      var field = new Field(type, inputId, options, placeholder);

      // console.log(label, inputId, input)
      div.append( label, "<br>", field.input, brClear );
      $("#" + this.fieldGroup + "Fields").append(div, "<br>");

      this.addFieldAction(inputId, type);
      this.addReplicantValue(inputId);
      this.addSubmitAction(inputId);
    })
    // this.addRadioUncheckListeners();
  };

  addFieldAction(inputId, type) {
    this.fieldActions[inputId] = {
      field: $("#" + inputId),
      type: type,
      replicant: nodecg.Replicant(this.fieldGroup + "_" + inputId)
    }
    // console.log("field", "#" + inputId + "Field", this.fieldActions[inputId].field);
  };

  addReplicantValue(inputId) {
    const { field, type, replicant } = this.fieldActions[inputId];
    replicant.on('change', (newValue, oldValue) => {
      // console.log("t.fieldActions[iid], field, replicant", this.fieldActions[inputId], field, replicant);
      // console.log("new val:", newValue, "old val:", oldValue)
      switch(type) {
        case "text":
          field.val(newValue);
          break;
        case "radio":
        case "checkbox":
          var choices = newValue ? newValue.split("; ") : "";
          $("input[name$='" + inputId + "']").each((i,x) => {
            if (choices.includes(x.value)) {
              $(x).prop("checked", true);
              if (type === "radio") $(x).addClass("radioCheck");
            }
          })
          break;
        default: ""; break;
      }
    });
  };

  addSubmitAction(inputId) {
    $("#" + this.fieldGroup + "SaveButton")[0].addEventListener('click', () => {
      const { field, type, replicant } = this.fieldActions[inputId];
      // console.log(field, type, replicant, "input: ", replicant.value)
      var output = "";
      switch(type) {
        case "text":
          output = field.val();
          break;
        case "radio":
        case "checkbox":
          var choices = [];
          $("input[name$='" + inputId + "']").filter((i,input) => $(input).is(":checked")).each((i,x) => choices.push(x.value));
          output = choices.join("; ");
          break;
        default: ""; break;
      }
      if (replicant.value != output) replicant.value = output;
      // console.log("after", output, "=>", replicant.value)
    })
  };

  // addRadioUncheckListeners() {
  //   $("input:radio").on("click", function(e) {
  //       var button = $(this);
  //       if (button.is(".radioCheck")) {
  //           button.prop("checked", false).removeClass("radioCheck");
  //       } else {
  //           $("buttonut:radio[name='" + button.prop("name") + "'].radioCheck").removeClass("radioCheck");
  //           button.addClass("radioCheck");
  //       }
  //   });
  // }


};

class Field {

  constructor(type, inputId, options, placeholder) {
    this.type = type;
    this.inputId = inputId;
    this.options = options;
    this.placeholder = placeholder;
    this.input;
    this.create();
  }

  create() {
    switch(this.type) {
      case "text":
      case "number":
        this.createTextBox();
        break;
      case "radio":
      case "checkbox":
        this.createSelectGroup();
        break;
      case "dropdown":
        this.createDropdown();
        break;
      default: ""; break;
    }
  }

  createTextBox() {
    this.input = $("<input>", {
      id: this.inputId,
      type: this.type,
      placeholder: this.placeholder || ""
    });
  };

  createSelectGroup() {
    var group = $("<div class='" + this.type + "-group'>", { id: this.inputId + "Group" });
    var maxLength = Math.max.apply(null, [...this.options.map(x => x.toString().length)]);
    var columns = Math.floor(31 / maxLength); // with Courier New, Courier, monospace, 32 max fits in 2 wide
    if (columns > 6) columns = 6;
    var width = (100 / columns) - 2 + "%";
    // console.log(options, maxLength, columns, width)

    this.options.forEach((text, i) => {
      // console.log(text)
      var id = sanitize(text);
      var select = $("<input>", {
        width: width,
        type: this.type,
        id: id,
        name: this.inputId,
        value: text,
      });
      var label = $("<label>", {
        width: width,
        for: id,
        text: text,
      });
      group.append(select, label);
    });
    this.input = group;
  };
// $(input).is(":checked"))
  // uncheckIfChecked() {

  // }

  createDropdown() {
    var dropdown = $("<select>", {
      id: this.inputId
    });

    this.options.forEach(text => {
      var option = $("<option>", {
        value: sanitize(text),
        text: text
      });
      dropdown.append(option);
    });

    this.input = dropdown;
  };

  getValue() {

  }

}

class Players {

  constructor() {

  }



}

function sanitize(str) {
  var replace = {
    "#": "number",
    "-": ""
  };
  str = str.toString().toLowerCase().replace(/[#-]/g, (matched) => replace[matched]);
  return str.replace(/\s(\w)/g, ($1) => $1[1].toUpperCase());
}


function setLayoutButton() {
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
}
