(function($) {
  $(document).on("click", "#simulate_button", function() {
    var deckInputString = $("#deck_input").val();

    var deck = manaBaseTextToDeck(deckInputString);

    console.log(deck);
    var results = simulateManaBase(deck);
  })
})(jQuery);