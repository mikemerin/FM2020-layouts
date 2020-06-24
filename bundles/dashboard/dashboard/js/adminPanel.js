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
