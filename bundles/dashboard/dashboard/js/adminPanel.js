class AdminPanel {

  setRunSearch = () => {

  };

  gameChecks = () => {
    // debugger
  };

  setAvatarCheck = () => {

  };

  setFieldsInfo = () => {

  };

  setRunSaveLoadButtons = () => {
    const label = $("<label>", { text: "Default run info for" });

    const loadButton = $("<button>", {
      id: "adminPanelLoadRunInfoButton",
      class: "halfButton",
      text: "Load",
      click: () => {
        const gameName = $("#gameNameAdmin").val();
        setReplicant.loadRunIntoDashboard(gameName);
      }
    });

    const saveButton = $("<button>", {
      id: "adminPanelSaveRunInfoButton",
      class: "halfButton",
      text: "Save",
      click: () => {
        const gameName = $("#gameNameAdmin").val();
        setReplicant.saveRunFromDashboard(gameName);
      }
    });

    var input = this.createDropdown("gameInfo", "gameName");

    $("#adminPanelInsertGameInfo").append(label, input, loadButton, saveButton);
  }

  createDropdown = (fieldGroup, field) => {
    const runsReplicant = nodecg.Replicant('runs');
    const fieldValuesReplicant = nodecg.Replicant('fieldValues');
    const { name, namespace } = runsReplicant;

    var dropdown = $("<select>", {
      id: field + "Admin",
      class: "inputSelect"
    });

    nodecg.readReplicant(name, namespace, replicantValues => {
      var options = Object.keys(replicantValues).map(game => {
        return replicantValues[game][fieldGroup][field];
      }).sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()) );

      options.forEach(value => {
          dropdown.append($("<option>", { text: value, value: value }));
      })
    });

    return dropdown;
  };

  setStagingSendButton = () => {

  };

  setPreviewButton = () => {

  };

  setLoadLayoutInfo = () => {
    const text = "Layout window for";
    const newId = "Open New Window";

    $("#loadLayout").append( //todo: next
      $("<label>", {
        id: sanitize(text),
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

};
