/*
  MTG Mana Wizard
  Forrest Henry
*/

function simulateManaBase(deck) {
  var numSimulations = 5, // 10000
      numTurns = 10;

  for (var simulationNum = 0; simulationNum < numSimulations; simulationNum++) {
    console.log("Running simulation " + (simulationNum + 1) + " of " + numSimulations + "...")

    var currentDeck = JSON.parse(JSON.stringify(deck)),
        battlefield = [],
        hand = [];
    
    // Draw two cards
    hand.push(deck.splice(Math.floor(Math.random() * currentDeck.length), 1)[0])
    hand.push(deck.splice(Math.floor(Math.random() * currentDeck.length), 1)[0])

    for (var turnNum = 1; turnNum <= numTurns; turnNum++) {
      // Draw a card
      hand.push(deck.splice(Math.floor(Math.random() * currentDeck.length), 1)[0])
    }
  }

  console.log("Simulation finished");
}

// Format:
// colors=ub behavior=basic fetchable count=7
//    colors (required): The colors the land taps for: can be any number in any combination of the following letters for each color
//            w: white, u: blue, b: black, r: red, g: green
//    behavior (optional): Adds special logic for how this land behaves. Valid values:
//                         basic, fetchland, (more to come)
//    count (optional): Indicates the number of this card in the deck, default is 1
//    fetchable: If present, indicates that the land can be fetched by a fetchland that includes one of this card's colors
//    enterTapped: If present, indicates that the land enters the battlefield tapped (cannot be used until the following turn)
function manaBaseTextToDeck(text) {
  var deck = [],
      cardId = 0,
      cardTexts = text.split("\n");

  // Iterate lines in text
  cardTexts.forEach(cardText => {
    var valueStrings = cardText.split(" "),
        count = 1,
        card = {
          colors: [],
          enterTapped: false,
          fetchable: false
        };

    // Iterate values for each line
    valueStrings.forEach(valueString => {
      if (valueString.includes("=")) {
        // Process complex values
        var kv_pair = valueString.split("="),
            key = kv_pair[0],
            value = kv_pair[1];
        switch (key) {
          case "colors":
            for (var i = 0; i < value.length; i++) {
              card.colors.push(value[i]);
            }
            break;
          case "behavior":
            card.behavior = value;
            break;
          case "count":
            count = parseInt(value);
            break;
        }
      } else {
        // Process boolean values
        switch (valueString) {
          case "enterTapped":
            card.enterTapped = true;
            break;
          case "fetchable":
            card.fetchable = true;
            break;
        }
      }
    })

    // Add the card(s)
    for (var i = 0; i < count; i++) {
      var cardClone = JSON.parse(JSON.stringify(card));
      cardId++;
      cardClone.id = cardId;

      deck.push(cardClone);
    }
    console.log(cardText);
  });
  return deck;
}
