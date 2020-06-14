// Main Functions

// todo: for the inputs, make them their own classes
// todo: make helper hashmap for types (text/number vs. radio/checkbox vs. dropdown)

class DashboardForm {

  constructor(fieldGroup) {
    this.name = fieldGroup;
    this.fieldGroup = fieldGroups[fieldGroup].fields;
    this.saveButton;
    this.dashboardFields = [];

    this.element = $("#" + fieldGroup + "Fields");
    this.createDashboardForm();
    // this.loadValues(); //used on init or if loading in from sheet, not here
  };

  createDashboardForm = () => {
    this.fieldGroup.forEach(field => {
      if (!field.disabled) {
        const dashboardField = this.getDashboardField({field});
        const brClear = $("<br>", { clear: "all" });
        this.element.append(dashboardField.element, brClear);
      };
    });

    if (this.name === "playerInfo") this.createPlayerTable();
    this.createSaveButton();
  };

  loadValues = (fromReplicant = false) => {
    if (fromReplicant && NodeCG.dashboardPanels.replicantValues) {
      this.dashboardFields.forEach(field => {
        const fieldReplicantSection = NodeCG.dashboardPanels.replicantValues[this.name];
        if (fieldReplicantSection !== undefined) {
          const fieldReplicantValue = fieldReplicantSection[field.id];
          if (fieldReplicantValue !== undefined) field.updateValue(fieldReplicantValue);
        }
      });
    } else {
      // todo: from dropdown
    };
  };

  getDashboardField = ({
    field,
    playerField = false,
    playerNumber
  }) => {
    const sanitizedFieldName = (!!playerField ? "player" + playerNumber + "_" : "") + sanitize(field.fieldName);
    const parent = this;
    const dashboardField = new DashboardField({parent, playerField, sanitizedFieldName, ...field});
    this.dashboardFields.push(dashboardField);
    return dashboardField;
  };

  createPlayerTable = () => {
    var maxPlayers = Math.max.apply(null, fieldGroups.playerInfo.fields.find(field => field.fieldName === "# of Players").options);
    var players = new Array(maxPlayers + 1).fill(x => x).map((x,i) => i);
    var playerTable = $("<table>", { id: "playerTable" });

    players.forEach(playerNumber => {
      var row = $("<tr>", { class: "playerRow row" + playerNumber }).append(
        !playerNumber ? $("<th>", { text: "P#" }) : $("<td>", { text: playerNumber })
      );

      fieldGroups.individualPlayerInfo.fields.forEach(field => {
        const { fieldName } = field;
        if (!playerNumber) {
          row.append( $("<th>", { text: fieldName }) );
        } else {
          const playerField = true;
          var dashboardField = this.getDashboardField({field, playerField, playerNumber});
          row.append(dashboardField.element);
        };
      });
      if (!!playerNumber) this.generatePlayerMoveButtons(playerNumber, maxPlayers).forEach(button => row.append(button));
      playerTable.append(row);
    });
    $("#playerFields").append(playerTable); // todo: next
    $("input[name$=numberOfPlayers]").each((i,x) => {
        $(x).click(() => this.updatePlayerFields(x.id));
    });
    this.updatePlayerFields();
  };

  generatePlayerMoveButtons = (playerNumber, maxPlayers) => {
    var up = $("<td>");
    var down = $("<td>");
    var clear = $("<td>", {
      text: "X",
      class: "moveButton",
      click: () => { this.changePlayerValues(playerNumber, "off") }
    });

    playerNumber = parseInt(playerNumber, 10);
    maxPlayers = parseInt(maxPlayers, 10);

    if (playerNumber > 1) {
      up = $("<td>", {
        text: "↑",
        class: "moveButton",
        click: () => { this.changePlayerValues(playerNumber, "up") }
      });
    };
    if (playerNumber < maxPlayers) {
      down = $("<td>", {
        text: "↓",
        class: "moveButton",
        click: () => { this.changePlayerValues(playerNumber, "down") }
      });
    };
    return [up, down, clear];
  };

  changePlayerValues = (playerNumber, changeType) => {
    var operator = (changeType === "up" ? -1 : 1);
    if (changeType === "off") {
      const confirm = window.confirm("Are you sure you want to clear out player " + playerNumber + "'s info?");
      if (!confirm) return;
    };

    fieldGroups.individualPlayerInfo.fields.forEach(({fieldName, type}) => {
      var sanitizedFieldName = sanitize(fieldName);
      var field1 = $("#player" + playerNumber + "_" + sanitizedFieldName); //todo: next
      if (changeType === "off") {
        if (type === "text") {
          field1.val("");
          field1.blur();
        } else if (type === "slider") {
          if (field1.is(":checked")) field1.click();
        };
      } else {
        var field2 = $("#player" + (playerNumber + 1*operator) + "_" + sanitizedFieldName); //todo: next

        if (type === "text") {
          var tmpValue = field1.val();
          field1.val( field2.val() );
          field2.val(tmpValue);
          field1.blur();
          field2.blur();
        } else if (type === "slider") {
          if (field1.is(":checked") !== field2.is(":checked")) {
            field1.click();
            field2.click();
          };
        };
      };
    });
  };

  updatePlayerFields = (numberOfPlayers) => {
    if (!numberOfPlayers) {
      numberOfPlayers = 1;
      const replicant = nodecg.Replicant("fieldValues");

      replicant.on("change", (newValue, oldValue) => {
        if (newValue && newValue.playerInfo) this.updatePlayerFields(newValue.playerInfo.numberOfPlayers);
      })
    };

    if (!numberOfPlayers) numberOfPlayers = 1;
    var playersChosen = parseInt(numberOfPlayers, 10);

    $(".playerRow").each((i,playerRow) => {
        var player = parseInt( playerRow.className.match(/\d+/)[0] );
        if (playersChosen < player) {
          $(playerRow).children().slice(1).each((j, field) => {
              $(field).addClass("disabled");
          });
        } else {
          $(playerRow).children().slice(1).each((j, field) => {
              $(field).removeClass("disabled");
          });
        };
    });
  };

  createSaveButton = () => {
    // todo: make "all panels" type (if can be done, seems like nodecg panels can't share info, which seems to be confirmed by the official docs)
    var text = "Save " + (this.name === "adminPanel" ? "All Fields" : fieldGroups[this.name].name);
    this.saveButton = $("<button>", {
      text: text,
      class: "saveButton",
      click: (e) => {
        e.preventDefault();
        var panels = (this.name === "adminPanel" ? Object.keys(NodeCG.dashboardPanels.panels) : [this.name]);

        panels.forEach(panel => {
          NodeCG.dashboardPanels.panels[panel].dashboardFields.forEach(({id, value}) => {
            if (!NodeCG.dashboardPanels.replicantValues[panel]) NodeCG.dashboardPanels.replicantValues[panel] = {};
            NodeCG.dashboardPanels.replicantValues[panel][id] = value;
          });
        });

        const { name, namespace } = NodeCG.dashboardPanels.replicant;

        // todo: make a replicant cleanup, aka if a field in fieldGroups.json doesn't exist, remove it from the replicant
        // example from before: delete(this.replicantValues.playerInfo[1])
        nodecg.readReplicant(name, namespace, replicantValues => {
          var newValues = {...replicantValues};

          panels.forEach(panel => {
            newValues = {...newValues, ...{[panel]: NodeCG.dashboardPanels.replicantValues[panel]}};
            if (panel === "gameInfo") {
              NodeCG.dashboardPanels.replicantValues[panel].gameNameTitle = NodeCG.dashboardPanels.replicantValues[panel].gameName.replace(/\bI Wanna |\bBe the /gi, "");
            }
            NodeCG.dashboardPanels.panels[panel].saveButton.removeClass("saveChanges");
          });
          NodeCG.dashboardPanels.replicant.value = newValues;
        });
      }
    });

    $("#" + this.name + "Save").append("<br>", this.saveButton); //todo: next
  };

};

class DashboardField {

  constructor({
    parent,
    dataOff,
    dataOn,
    defaultValue,
    fieldName,
    options,
    optional,
    placeholder,
    playerField,
    replicantValues,
    sanitizedFieldName,
    type
  }) {
    this.parent = parent;
    this.dataOff = dataOff || "No";
    this.dataOn = dataOn || "Yes";
    this.defaultValue = (defaultValue !== undefined ? defaultValue : "");
    this.id = sanitizedFieldName;
    this.fieldName = fieldName;
    this.options = options;
    this.optional = optional;
    this.placeholder = placeholder;
    this.playerField = playerField;
    this.type = type;
    this.value = "";

    this.element;
    this.input;
    this.createDashboardField();
  };

  createDashboardField = () => {
    const fieldTag = ( this.playerField ? "Td" : "Div" );
    this.element = $("<" + fieldTag + ">", { id: this.id + fieldTag });
    var label = $("<label>", { text: this.fieldName });
    if (this.optional) label[0].innerHTML += "<i class='smallLabel'> (optional)</i>";

    switch(this.type) {
      case "text":
      case "number":
        this.input = this.createTextBox();
        break;
      case "radio":
      case "checkbox":
        this.input = this.createSelectGroup();
        break;
      case "slider":
        this.input = this.createSlider();
        break;
      case "dropdown":
        this.input = this.createDropdown();
        break;
      default: ""; break;
    };

    if (this.playerField) {
      this.element.append( this.input );
    } else {
      this.element.append(label, "<br>", this.input);
    };
  };

  toggleSaveChangesOn = () => {
    $("#" + this.parent.name + "Save > button").addClass("saveChanges"); //todo: next
    // debugger
    // $("#adminPanelSave > button").addClass("saveChanges");
    $("#loadLayoutButton").addClass("disabled"); //todo: fix
    //todo: add to adminPanelSave
  }

  // create fields below

  createTextBox = () => {
    return $("<input>", {
      id: this.id,
      value: this.defaultValue,
      type: this.type,
      placeholder: this.placeholder || "",
      blur: () => { this.updateValue(); }
    });
  };

  createSelectGroup = () => {
    var group = $("<div>", {
      class: this.type + "-group",
      id: this.id + "Group"
    });

    const maxLength = Math.max.apply(null, [...this.options.map(x => x.toString().length)]);
    const panelWidth = this.parent.element.width() / 8;
    var columns = Math.floor(panelWidth / maxLength); // with Courier New, Courier, monospace, 32 max fits in 2 wide
    if (columns > 6) columns = 6;
    const width = (100 / columns) - 2 + "%";

    this.options.forEach(text => {
      var select, label;
      if (Array.isArray(text)) {
        group.append(
          "<br clear='all'>",
          $("<span>", { class: "selectGroup", text: text[0] }),
          "<br>"
        );
      } else {
        var id = sanitize(text);

        select = $("<input>", {
          width: width,
          type: this.type,
          id: id,
          name: this.id,
          value: text,
          checked: this.defaultValue.split("; ").includes(text),
          click: () => { this.updateValue(); }
        });
        label = $("<label>", {
          width: width,
          for: id,
          text: text,
        });
      };
      group.append(select, label);
    });
    return group;
  };

  createSlider = () => {
    const slider = $("<label>", { class: "switch" })
      .append(
        $("<input>", {
          type: "checkbox",
          id: this.id,
          checked: this.defaultValue,
          change: () => { this.updateValue(); }
        })
      );

    const onOff = $("<div>", { class: "slider round" })
      .append( $("<span>", { class: "on",  text: this.dataOn  }) )
      .append( $("<span>", { class: "off", text: this.dataOff }) );

    slider.append(onOff);
    return slider;
  };

  createDropdown = () => { // note: untested
    var dropdown = $("<select>", {
      id: this.id
    });
    // this.toggleSaveChangesOn();
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

  updateValue = (value) => {
    switch(this.type) {
      case "text":
      case "number":
        if (value !== undefined) this.input.val(value);
        this.value = this.input.val();
        break;
      case "radio":
      case "checkbox":
        if (value !== undefined) {
          const choices = value.split("; ");
          $("input[name$='" + this.id + "']").each((i,x) => $(x).prop("checked", choices.includes(x.value)) );
        };
        var choices = [];
        $("input[name$='" + this.id + "']").filter((i,input) => $(input).is(":checked")).each((i,x) => choices.push(x.value));
        this.value = choices.join("; ");
        break;
      case "slider":
        if (value !== undefined) this.input.children("input").prop("checked", value);
        this.value = this.input.children("input").is(":checked");
        break;
      case "dropdown":
        // note: untested
        break;
      default: ""; break;
    };
    if (value === undefined) this.toggleSaveChangesOn();
  };

};

const setFieldsInfo = () => {

};

const setLoadLayoutInfo = () => {
  const text = "Layout window for";
  const newId = "Open New Window";

  $("#loadLayout").append( //todo: next
    $("<div>", {
      id: sanitize(text),
      class: "loadButton",
      text: text
    })
  );

  $("#loadLayout").append( //todo: next
    $("<button>", {
      id: sanitize(newId) + "Window",
      class: "loadButton",
      text: newId
    })
  );

  const replicant = nodecg.Replicant("fieldValues");

  replicant.on("change", (newValue, oldValue) => {
    const loadButton = $("#" + sanitize(newId) + "Window"); //todo: next
    loadButton.off();

    var labelText = "Cannot load layout until more info is chosen";

    if (newValue && newValue["playerInfo"] && newValue["gameInfo"] ) {
      const numberOfPlayers = newValue["playerInfo"]["numberOfPlayers"];
      const { resolution, gameNameTitle } = newValue["gameInfo"];
      labelText = text + "<br>" + numberOfPlayers + "P " + resolution + " - " + gameNameTitle;

      loadButton.on("click", (e) => {
        e.preventDefault();
        if (!!numberOfPlayers && numberOfPlayers !== "N/A" && !!resolution && resolution !== "N/A") {
          var url = "http://localhost:9090/bundles/dashboard/graphics/layout.html";
          window.open(url);
        };
      });
    } else {
      loadButton.off();
    }

    $("#" + sanitize(text)).html(labelText); //todo: next
  });
};
