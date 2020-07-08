

  // part of DashboardForm class. not using, css overlaps are causing more of a headache
  // inside DashboardForm:
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


  // class GlobalFunctions {
  //
  //   sanitize = (str) => {
  //     var replace = {
  //       "#": "number",
  //       "-": ""
  //     };
  //     str = str.toString().toLowerCase().replace(/[#-]/g, (matched) => replace[matched]);
  //     return str.replace(/\s(\w)/g, ($1) => $1[1].toUpperCase());
  //   }
  //
  // }

/*

  replace regex
  (.*)
  "\1",

  */

  arr.map(x => x.split("\t")).forEach((el,i) => {

    if (el.length > 10) {
      var [numberOfPlayers, resolution, gameName, createdBy, estimate, category, runType, commentators, one00F, Adventure, Avoidance, Gimmick, Medley, Needle, Trap, otherGenres, otherGames, runner, camera, pb, WR] = el;

      resolution = resolution
      .replace("800 x ", "")
      .replace(" (800x600 1024x768 etc)", "")
      .replace(" (256x224 800x700 etc)", "")
      .replace(" (1920x1080 1280x720 etc)", "");

      const gameNameTitle = gameName.replace(/(I Wanna |Be the )/gi, "");

      var playerInfo = {
        numberOfPlayers: numberOfPlayers,
        player1_twitchHandle: "",
        player1_displayName: "",
        player1_camera: camera,
        player1_pb: pb,
        player2_twitchHandle: "",
        player2_displayName: "",
        player2_camera: "",
        player2_pb: "",
        player3_twitchHandle: "",
        player3_displayName: "",
        player3_camera: "",
        player3_pb: "",
        player4_twitchHandle: "",
        player4_displayName: "",
        player4_camera: "",
        player4_pb: "",
        commentators: commentators || ""
      };

      const players = parseInt(numberOfPlayers,10);

      for (let player = 1; player <= players; player++) {
        const prefix = `player${player}_`;
        if (player > 1) {
          [runner, camera, pb] = arr[i + player-1].split("\t");
          playerInfo[prefix+"camera"] = camera;
          playerInfo[prefix+"pb"] = pb;
        }

        var [name, handle] = runner.split(" / ");
        playerInfo[prefix+"displayName"] = name.trim();
        playerInfo[prefix+"twitchHandle"] = handle || "";
      }

      var worldRecord, wrHolder;

      if (WR === "" || WR === "N/A") {
        worldRecord = "";
        wrHolder = "";
      } else {
        var str = WR.split(" by ");
        worldRecord = str[0];
        wrHolder = str[1];
      }

      otherGenres = (otherGenres !== "" || otherGames !== "" ? otherGenres + otherGames : "");


      const genreNames = ["100F", "Adventure", "Avoidance", "Gimmick", "Medley", "Needle", "Trap"];
      const genres = [one00F, Adventure, Avoidance, Gimmick, Medley, Needle, Trap].filter(x => x).map((genre,i) => genreNames[i]).join("; ");
console.log(genres)
      runs[gameName] = {
        gameInfo: {
          gameName: gameName,
          resolution: resolution,
          createdBy: createdBy,
          genres: genres,
          otherGenres: otherGenres
        },
        playerInfo: playerInfo,
        runInfo: {
          category: category,
          estimate: estimate,
          runType: runType,
          worldRecord: worldRecord,
          wrHolder: wrHolder
        }
      };
    }
  });
  copy(runs)
