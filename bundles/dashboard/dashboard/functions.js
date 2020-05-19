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
      inputType,
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

      switch(inputType) {
        case "text":
        case "number":
          input = createTextBox(inputId, inputType, placeholder);
          break;
        case "radio":
        case "checkbox":
          input = createSelectGroup(inputId, inputType, "", options, orientation);
          break;
        case "dropdown":
          input = createDropdown(inputId, "", options);
          break;
        default: ""; break;
      }
      // console.log(label, inputId, input)
      div.append( label, "<br>", input, brClear );
      $("#" + this.fieldGroup + "Fields").append(div, "<br>");

      this.addFieldAction(inputId, inputType);
      this.addReplicantValue(inputId);
      this.addSubmitAction(inputId);
    })
  };

  addFieldAction(inputId, inputType) {
    this.fieldActions[inputId] = {
      field: $("#" + inputId),
      inputType: inputType,
      replicant: nodecg.Replicant(inputId)
    }
    // console.log("field", "#" + inputId + "Field", this.fieldActions[inputId].field);
  };

  addReplicantValue(inputId) {
    const { field, inputType, replicant } = this.fieldActions[inputId];
    replicant.on('change', (newValue, oldValue) => {
      // console.log("t.fieldActions[iid], field, replicant", this.fieldActions[inputId], field, replicant);
      // console.log("new val:", newValue, "old val:", oldValue)
      switch(inputType) {
        case "text":
          field.val(newValue);
          break;
        case "radio":
        case "checkbox":
          var choices = newValue.split("; ");
          $("input[name$='" + inputId + "']").each((i,x) => {
            if (choices.includes(x.value)) $(x).prop("checked", true);
          })
          break;
        default: ""; break;
      }
    });
  };

  addSubmitAction(inputId) {
    $("#" + this.fieldGroup + "SaveButton")[0].addEventListener('click', () => {
      const { field, inputType, replicant } = this.fieldActions[inputId];
      // console.log(field, inputType, replicant, "input: ", replicant.value)
      var output = "";
      switch(inputType) {
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
      replicant.value = output
      // console.log("after", output, "=>", replicant.value)
    })
  };

}

// Helpers, move into class or have an external helper class

function createTextBox(inputId, inputType, placeholder) {
  return $("<input>", {
    id: inputId,
    inputType: inputType,
    placeholder: placeholder || ""
  });
}

function createSelectGroup(inputId, inputType, selected, options, orientation) {
  var group = $("<div class='" + inputType + "-group " + orientation + "'>", { id: inputId + "Group" });
  options.forEach((text, i) => {
    // console.log(text)
    var id = sanitize(text);
    var select = $("<input>", {
      type: inputType,
      id: id,
      name: inputId,
      value: text,
      checked: text === selected
    });
    var label = $("<label>", {
      for: id,
      text: text
    });
    group.append(select, label);
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
