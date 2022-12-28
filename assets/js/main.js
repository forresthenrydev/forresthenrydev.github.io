(function($) {
  $(document).on("click", "#simulate_button", function() {
    $("#loading_indicator").css("display", "flex");

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
      var height = (results[i] / maxResult) * 80;
      $("#bar_graph_column_" + i).css("height", height + "%");
    }
    $("#loading_indicator").css("display", "none");
  })
})(jQuery);