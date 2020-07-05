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

  insertGameInfoButton = () => {
    const text = "Load default run info for:";

    const button = $("<button>", {
      id: "adminPanelInsertGameInfoButton",
      class: "loadButton",
      text: text,
      click: () => {
        const gameName = $("#gameNameAdmin").val();
        setReplicant.loadRunIntoDashboard(gameName);
      }
    });

    var input = this.createDropdown("gameInfo", "gameName");

    $("#adminPanelInsertGameInfo").append(button, "<br>", input);
  }

  createDropdown = (fieldGroup, field) => {
    const runsReplicant = nodecg.Replicant('runs');
    const { name, namespace } = runsReplicant;

    var dropdown = $("<select>", {
      id: field + "Admin"
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

};
