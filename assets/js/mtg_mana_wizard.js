/*
  MTG Mana Wizard
  Forrest Henry
*/
/*
colors=b behavior=basic fetchable count=9
colors=r behavior=basic fetchable count=9
colors=g behavior=basic fetchable count=9
colors=br count=1
colors=rg count=1
colors=bg count=1
*/

function parseManaCost(manaCostString) {
  manaCostString = manaCostString.toLowerCase();

  var manaCost = {};

  manaCost.c = parseInt(manaCostString);
  if (isNaN(manaCost.c)) manaCost.c = 0;

  ['w', 'u', 'b', 'r', 'g'].forEach(color => {
    var regex = new RegExp(color, "g");
    manaCost[color] = (manaCostString.match(regex) || []).length
  });

  console.log(manaCost);

  return manaCost;
}

function simulateManaBase(deck, targetManaCost) {
  var numSimulations = 10000,
      numTurns = 10,
      turnsToCasts = [];
  
  // Make an array of zeros, one more than turn length (final value represents a sim that couldn't cast)
  for (var i = 0; i <= numTurns; i++) {
    turnsToCasts[i] = 0;
  }

  for (var simulationNum = 0; simulationNum < numSimulations; simulationNum++) {
    console.log("Running simulation " + (simulationNum + 1) + " of " + numSimulations + "...")

    var currentDeck = JSON.parse(JSON.stringify(deck)),
        battlefield = [],
        hand = [];
    
    // Draw two cards
    hand.push(currentDeck.splice(Math.floor(Math.random() * currentDeck.length), 1)[0])
    hand.push(currentDeck.splice(Math.floor(Math.random() * currentDeck.length), 1)[0])

    for (var turnNum = 0; turnNum < numTurns; turnNum++) {
      // Draw a card
      hand.push(currentDeck.splice(Math.floor(Math.random() * currentDeck.length), 1)[0])

      // Find a card with the best castability
      var bestIndex = -1,
          bestScore = 10000;
      for (var i = 0; i < hand.length; i++) {
        var landInHand = hand[i],
            virtualBattlefield = JSON.parse(JSON.stringify(battlefield));
        virtualBattlefield.push(landInHand);

        var scoreForThisLand = castabilityScore(targetManaCost, virtualBattlefield);

        if (scoreForThisLand < bestScore) {
          bestScore = scoreForThisLand;
          bestIndex = i;
        }
      }

      // Play that land
      var landToPlay = hand.splice(bestIndex, 1)[0];
      if (!landToPlay.enterTapped) {
        battlefield.push(landToPlay);
      }

      // Check if we met our castability score
      //if (castabilityScore(targetManaCost, battlefield) === 0 && battlefield.length === 2) { debugger }
      if (castabilityScore(targetManaCost, battlefield) === 0) {
        turnsToCasts[turnNum]++;
        break;
      } else if (turnNum === numTurns - 1) {
        // If it's the last turn and we haven't been able to cast, report in the final slot
        turnsToCasts[numTurns]++;
      }

      // Play the land "late" if it enters tapped
      if (landToPlay.enterTapped) {
        battlefield.push(landToPlay);
      }
    }
  }

  console.log("Simulation finished");
  console.log(turnsToCasts);
  return turnsToCasts;
}

// Calculate the "castability" of a given mana cost. If the cost can be payed, the score is zero.
// Points are added for each missing mana.
function castabilityScore(manaCost, battlefield) {
  var score = 0,
      cmc = manaCost.c + manaCost.w + manaCost.u + manaCost.b + manaCost.r + manaCost.g;
  if (cmc > battlefield.length) {
    // 1 point for each missing mana
    score += cmc - battlefield.length;
  }

  // Check that we have enough of each color
  var baseAvailability = colorAvailablity(battlefield),
      baseDifference = costToAvailabilityDifference(manaCost, baseAvailability);

  score += baseDifference;

  if (baseDifference === 0) {
    // Check that removing a land doesn't affect difference too much
    for (var i = 0; i < battlefield.length; i++) {
      // Copy to a new battlefield, then remove a land from it 
      var virtualBattlefield = JSON.parse(JSON.stringify(battlefield));
      virtualBattlefield.splice(i, 1);

      var virtualAvailability = colorAvailablity(virtualBattlefield),
          virtualDifference = costToAvailabilityDifference(manaCost, virtualAvailability);

      if (virtualDifference > 1) {
        score += virtualDifference - 1;
      }
    }
  }

  return score;
}

function colorAvailablity(battlefield) {
  sums = { w: 0, u: 0, b: 0, r: 0, g: 0 }

  battlefield.forEach(land => {
    land.colors.forEach(color => {
      sums[color]++;
    });
  });

  return sums;
}

function costToAvailabilityDifference(manaCost, colorAvailablity) {
  var difference = 0;
  ['w', 'u', 'b', 'r', 'g'].forEach(color => {
    if (manaCost[color] > colorAvailablity[color]) {
      difference += manaCost[color] - colorAvailablity[color];
    }
  });

  return difference;
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
