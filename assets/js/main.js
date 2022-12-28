(function($) {
  $(document).on("click", "#fake_simulate_button", function() {
    $("#loading_indicator").css("display", "flex");
    setTimeout(function() {
      $("#simulate_button").click();
    }, 1);
  });

  $(document).on("click", "#simulate_button", function() {
    var deckInputString = $("#deck_input").val();

    var deck = manaBaseTextToDeck(deckInputString);

    console.log(deck);
    var targetManaCost = parseManaCost($("#mana_cost").val());
    var results = simulateManaBase(deck, targetManaCost);

    var maxResult = 1;
    for (var i = 0; i < results.length; i++) {
      if (results[i] > maxResult) { maxResult = results[i] }
    }
    // Render results
    for (var i = 0; i < results.length; i++) {
      var height = (results[i] / 10000) * 100;
      $("#bar_graph_column_" + i).css("height", height + "%");
      $("#bar_graph_column_labels_" + i).html(results[i]);
    }
    $("#loading_indicator").css("display", "none");
  });
})(jQuery);