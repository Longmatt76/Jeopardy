
// Hello Alexander, I tried my hardest here and I think it's 95% correct but there's a game breaking bug that I can't 
// fix as you will discover. There's also some issues (like text vertical centering on clues/answers) that I will fix 
// after I figure out the primary issue. 

let categories = [];
const numCategories = 6;
const numClues = 5;

// this function returns 6 random categories by making a Get request to the API for 100 categories,
// it uses a random number between 0-5000 to set the offset (which is the starting index of the returned categories),
// it then filters out the categories that have less than 5 clues and finally maps those to a new array
//  storing only thier category ID#.

async function getCategoryIds() {
  const randomOffset = Math.floor(Math.random() * 5000);
  const response = await axios.get("http://jservice.io/api/categories", {
    params: { count: 100, offset: randomOffset },
  });
  let notEnoughClues = [];
  notEnoughClues = response.data.filter((category) => {
    if (category.clues_count >= 5) return notEnoughClues;
  });
  let categoryIDs = notEnoughClues.map((category) => ({
    id: category.id,
  }));

  return _.sampleSize(categoryIDs, numCategories);
}

// this function takes the categoryIDs retrieved with getCategoryIds and makes a Get request to the API
// for additional information, and returns an object storing the category title and a clue array which holds
// the question and answer plus it's "showing" status.

async function getCategory(categoryID) {
  const response = await axios.get("http://jservice.io/api/category", {
    params: { id: categoryID },
  });
  const title = response.data.title;
  const allClues = response.data.clues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  return { title: title, clues: _.sampleSize(allClues, 5) };
}

// This function builds the html gameboard by building a table looping through the numCategories and numClues
//  variables (which in this case represents the width & height) and appends the created elements first together
//  and then to the html table itself.

async function fillTable() {
  const board = document.querySelector("table");
  const head = document.querySelector("thead");
  const body = document.querySelector("tbody");
  const top = document.createElement("tr");
  top.setAttribute("id", "cat-row");

  for (let x = 0; x < numCategories; x++) {
    const catCell = document.createElement("td");
    const textCell = document.createElement("p");
    catCell.setAttribute("id", `${x}`);
    textCell.classList.add("catText");
    textCell.innerText = categories[x].title;
    catCell.append(textCell);
    top.append(catCell);
  }
  head.append(top);
  board.append(head);

  for (let y = 0; y < numClues; y++) {
    const row = document.createElement("tr");
    row.setAttribute("id", "clue-row");
    for (let x = 0; x < numCategories; x++) {
      const questDiv = document.createElement("div");
      const clueCell = document.createElement("td");
      const clueText = document.createElement("p");
      clueText.classList.add("clueText");
      clueCell.addEventListener("click", handleClick);
      questDiv.classList.add("quest");
      questDiv.innerText = "?";
      clueCell.setAttribute("id", `${x}-${y}`);
      clueCell.append(questDiv);
      clueCell.append(clueText);
      row.append(clueCell);
    }
    body.append(row);
    board.append(body);
  }
}

// this function handles clicks on the indiviual clues, 1st click removes the placeholder question mark div and displays
// the question, 2nd click replaces the question with the answer and the 3rd and subsequest clicks are ignored.

function handleClick(evt) {
  let id = evt.target.id;
  let [x, y] = id.split("-");
  let info = categories[x].clues[y];
  let display = "";

  // I wrote this function to remove the divs that hold the initial ? but I'm not sure if it's needed and I'm
// also starting to think this approach may be messing up the handleClick function?

// $("#jeopardy").on("click", $(".quest"), function (e) {
//   if (e.target.firstChild) {
//     e.target.firstChild.remove();
//   }
// });

  // something is wrong here but I can't figure out the issue, if lines 116-118 are enabled it will show the answer on
    // the 1st click, if it's not enabled it will show the question on first click but I can never get it to show the 
    // question and answer even though I think that's what the logic it saying.
  if (!info.showing) {
    display = info.question;
    info.showing = "question";
    //  } else if (info.showing === "question") {
    //   display = info.answer;
    //   info.showing = "answer";
  } else {
    return;
  }

  $(`#${x}-${y}`).text(display);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("td").remove();
  $("#spin").css("display", " inline-block");
  $("#jeopardy").hide();
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#spin").css("display", "none");
  $("#jeopardy").show();
}

function playAudio() {
  $jeopardyTheme = $("audio");
  $jeopardyTheme[0].play();
  $jeopardyTheme[0].volume = 0.3;
}

async function setupAndStart() {
  showLoadingView();

  let categoryIDs = await getCategoryIds();

  categories = [];

  for (let cat of categoryIDs) {
    categoryID = cat.id;
    categories.push(await getCategory(categoryID));
  }

  fillTable();

  hideLoadingView();
  playAudio();
}

/** On click of start / restart button, set up game. */

$("#start").on("click", setupAndStart);
$("#jeopardy").on("click", "td", handleClick);
// TODO

/** On page load, add event handler for clicking clues */

// TODO
