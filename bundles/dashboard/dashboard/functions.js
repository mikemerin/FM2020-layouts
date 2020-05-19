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
      optional,
      options,
      placeholder
    }) => {
      var input, inputId = sanitize(fieldName) + "Field";
      var div = $("<div>", { id: inputId + "Div" });
      var label = $("<label>", { text: fieldName });
      if (optional) label[0].innerHTML += "<i class='smallLabel'> (optional)</i>";
      var brClear = $("<br>", { clear: "all" });

      switch(type) {
        case "text":
        case "number":
          input = createTextBox(inputId, type, placeholder);
          break;
        case "radio":
        case "checkbox":
          input = createSelectGroup(inputId, type, "", options);
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
      this.addReplicantValue(inputId);
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

}

// Helpers, move into class or have an external helper class

function createTextBox(inputId, type, placeholder) {
  return $("<input>", {
    id: inputId,
    type: type,
    placeholder: placeholder || ""
  });
}

function createSelectGroup(inputId, type, selected, options) {
  var group = $("<div class='" + type + "-group'>", { id: inputId + "Group" });
  var objects = [];
  var maxLength = Math.max.apply(null, [...options.map(x => x.toString().length)]);
  var columns = Math.floor(31 / maxLength);
  if (columns > 6) columns = 6;
  var width = (100 / columns) - 2 + "%";
  console.log(options, maxLength, columns, width)
  // with Courier New, Courier, monospace, 32 max fits

  options.forEach((text, i) => {
    // console.log(text)
    var id = sanitize(text);
    var select = $("<input>", {
      width: width,
      type: type,
      id: id,
      name: inputId,
      value: text,
      checked: text === selected
    });
    var label = $("<label>", {
      width: width,
      for: id,
      text: text,
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
