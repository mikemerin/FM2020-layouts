

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
