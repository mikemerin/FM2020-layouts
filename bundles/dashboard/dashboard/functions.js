// Main Functions

class DashboardForm {

  constructor(fieldGroup) {
    this.fieldGroup = fieldGroup,
    this.fields = fieldGroups[this.fieldGroup].fields,
    this.fieldActions = {}
  }

  generateForm() {
    this.fields.forEach(({
      fieldName,
      type,
      min,
      max,
      options,
      orientation,
      placeholder
    }) => {
      var input, inputId = sanitize(fieldName) + "Field";
      var div = $("<div>", { id: inputId + "Div" });
      var label = $("<label>", { text: fieldName });
      var brClear = $("<br>", { clear: "all" });

      switch(type) {
        case "text":
        case "number":
          input = createTextBox(inputId, type, placeholder);
          break;
        case "radio":
        case "checkbox":
          input = createSelectGroup(inputId, type, "", options, orientation);
          break;
        case "dropdown":
          input = createDropdown(inputId, "", options);
          break;
        default: ""; break;
      }
      // console.log(label, inputId, input)
      div.append( label, "<br>", input, brClear );
      $("#" + this.fieldGroup + "Fields").append(div, "<br>");

      this.addFieldAction(inputId, type);
      this.attachReplicant(inputId);
      this.addSubmitAction(inputId);
    })
  };

  addFieldAction(inputId, type) {
    this.fieldActions[inputId] = {
      field: $("#" + inputId),
      type: type,
      replicant: nodecg.Replicant(inputId)
    }
    // console.log("field", "#" + inputId + "Field", this.fieldActions[inputId].field);
  };

  attachReplicant(inputId) {
    const { field, replicant } = this.fieldActions[inputId];
    console.log(this.fieldActions[inputId]);
    replicant.on('change', (newValue, oldValue) => {
      console.log(newValue, oldValue)
      field.val(newValue);
    });
  };

  addSubmitAction(inputId) {
    $("#" + this.fieldGroup + "SaveButton")[0].addEventListener('click', () => {
      const { field, replicant } = this.fieldActions[inputId];
      console.log(field, replicant)
      console.log("before", replicant.value)
      replicant.value = field.val();
      console.log("after", field.val(), replicant.value)
    })
  };

}

// Helpers, move into class or have an external helper class

function createTextBox(inputId, type, placeholder) {
  return $("<input>", {
    id: inputId,
    type: type,
    placeholder: placeholder || ""
  });
}

function createSelectGroup(inputId, type, selected, options, orientation) {
  var group = $("<div class='" + type + "-group " + orientation + "'>", { id: inputId + "Group" });
  options.forEach((text, i) => {
    // console.log(text)
    var id = sanitize(text);
    var radio = $("<input>", {
      type: type,
      id: id,
      name: inputId,
      value: text,
      checked: text === selected
    });
    var label = $("<label>", {
      for: id,
      text: text
    });
    group.append(radio, label);
  });
  return group;
}

function createDropdown(inputId, selected, options) {
  var dropdown = $("<select>", {
    id: inputId
  });

  options.forEach(text => {
    var option = $("<option>", {
      value: sanitize(text),
      selected: text === selected,
      text: text
    });
    dropdown.append(option);
  });

  return dropdown;
}

function sanitize(str) {
  var replace = {
    "#": "number",
    "-": ""
  };
  str = str.toString().toLowerCase().replace(/[#-]/g, (matched) => replace[matched]);
  return str.replace(/\s(\w)/g, ($1) => $1[1].toUpperCase());
}
