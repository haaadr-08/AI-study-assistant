const subjectInput = document.getElementById("subject");
const topicInput = document.getElementById("topic");
const notesInput = document.getElementById("notes");
const taskInput = document.getElementById("task");
const generateBtn = document.getElementById("generate-btn");
const outputBox = document.getElementById("output-box");
const savedNotesBox = document.getElementById("saved-notes");
const notesCount = document.getElementById("notes-count");
const clearAllBtn = document.getElementById("clear-all-btn");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const searchNotesInput = document.getElementById("search-notes");
const sortNotesInput = document.getElementById("sort-notes");

let savedNotes = JSON.parse(localStorage.getItem("savedNotes")) || [];

generateBtn.addEventListener("click", function () {
    const subject = subjectInput.value;
    const topic = topicInput.value;
    const notes = notesInput.value.trim();
    const task = taskInput.value;

    if (subject === "" || topic === "" || notes === "") {
        outputBox.innerHTML = "<p>Please fill out all fields before generating.</p>";
        return;
    }

    outputBox.innerHTML = "<p>Generating...</p>";

    setTimeout(function () {

        if (task === "summary") {
            generateSummary(subject, topic, notes);
        } else if (task === "quiz") {
            generateQuiz(subject, topic, notes);
        } else if (task === "flashcards") {
            generateFlashcards(subject, topic, notes);
        }

        saveNote(subject, topic, notes);

    }, 1000);

    subjectInput.value = "";
    topicInput.value = "";
    notesInput.value = "";
    taskInput.value = "summary";

    updateCounters();

    generateBtn.textContent = "Generate";
});

searchNotesInput.addEventListener("input", function () {
    displaySavedNotes();
});

sortNotesInput.addEventListener("change", function () {
    displaySavedNotes();
});

function updateCounters() {
    charCount.textContent = "Characters: " + notesInput.value.length;

    const words =
        notesInput.value.trim() === ""
            ? 0
            : notesInput.value.trim().split(/\s+/).length;

    wordCount.textContent = "Words: " + words;
}

notesInput.addEventListener("input", updateCounters);
notesInput.addEventListener("keyup", updateCounters);

function generateSummary(subject, topic, notes) {
    const sentences = notes.split(".").filter(function (sentence) {
        return sentence.trim() !== "";
    });

    const shortSummary = sentences.slice(0, 3);

    outputBox.innerHTML = `
    <h3>Summary</h3>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Topic:</strong> ${topic}</p>
    <ul>
      ${shortSummary.map(function (sentence) {
        return `<li>${sentence.trim()}.</li>`;
    }).join("")}
    </ul>
  `;
}

function generateQuiz(subject, topic, notes) {
    outputBox.innerHTML = `
    <h3>Quiz</h3>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Topic:</strong> ${topic}</p>

    <div class="quiz-card">
      <p><strong>Question:</strong> What is the main idea of this topic?</p>
      <p>A) A random unrelated topic</p>
      <p>B) ${topic}</p>
      <p>C) Website styling only</p>
      <p>D) Image editing</p>
      <p><strong>Answer:</strong> B) ${topic}</p>
    </div>
  `;
}

function generateFlashcards(subject, topic, notes) {
    const firstSentence = notes.split(".")[0];

    outputBox.innerHTML = `
    <h3>Flashcards</h3>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Topic:</strong> ${topic}</p>

    <div class="flashcard">
      <p><strong>Front:</strong> What is ${topic}?</p>
      <p><strong>Back:</strong> ${firstSentence}.</p>
    </div>
  `;
}

function saveNote(subject, topic, notes) {

    const alreadyExists = savedNotes.some(function (note) {
        return note.topic.toLowerCase() === topic.toLowerCase();
    });

    if (alreadyExists) {
        alert("This topic already exists!");
        return;
    }

    const note = {
        subject: subject,
        topic: topic,
        notes: notes,
        date: new Date().toLocaleDateString()
    };

    savedNotes.push(note);

    localStorage.setItem("savedNotes", JSON.stringify(savedNotes));

    displaySavedNotes();
}

function displaySavedNotes() {
    notesCount.textContent = savedNotes.length;
    if (savedNotes.length === 0) {
        savedNotesBox.innerHTML = "<p>No saved notes yet.</p>";
        return;
    }

    savedNotesBox.innerHTML = "";

    const searchText = searchNotesInput.value.toLowerCase();

    const sortType = sortNotesInput.value;

    let filteredNotes = [...savedNotes];

    filteredNotes = filteredNotes.filter(function (note) {
        return (
            note.topic.toLowerCase().includes(searchText) ||
            note.subject.toLowerCase().includes(searchText)
        );
    });

    if (sortType === "az") {
        filteredNotes.sort(function (a, b) {
            return a.topic.localeCompare(b.topic);
        });
    } else if (sortType === "za") {
        filteredNotes.sort(function (a, b) {
            return b.topic.localeCompare(a.topic);
        });
    } else if (sortType === "oldest") {
        filteredNotes.reverse();
    }

    filteredNotes.forEach(function (note, index) {
        savedNotesBox.innerHTML += `
      <div class="note-card">
        <h3>${note.topic}</h3>
        <p><strong>Saved:</strong> ${note.date}</p>
        <p><strong>Subject:</strong> ${note.subject}</p>
        <p>${note.notes}</p>

        <button class="edit-btn" onclick="editNote(${index})">
            <i class="fa-solid fa-pen"></i>
        </button>

        <button class="delete-btn" onclick="deleteNote(${index})">
            <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    });
}

function editNote(index) {
    const note = savedNotes[index];

    subjectInput.value = note.subject;
    topicInput.value = note.topic;
    notesInput.value = note.notes;

    savedNotes.splice(index, 1);
    localStorage.setItem("savedNotes", JSON.stringify(savedNotes));

    displaySavedNotes();
    updateCounters();

    generateBtn.textContent = "Update Note";
}

function deleteNote(index) {

    const confirmDelete = confirm("Are you sure you want to delete this note?");

    if (!confirmDelete) {
        return;
    }

    savedNotes.splice(index, 1);

    localStorage.setItem("savedNotes", JSON.stringify(savedNotes));

    displaySavedNotes();

    outputBox.innerHTML =
        "<p>Your generated summary, quiz, or flashcards will appear here.</p>";
}

displaySavedNotes();

clearAllBtn.addEventListener("click", function () {
    if (savedNotes.length === 0) {
        alert("No notes to clear.");
        return;
    }

    const confirmClear = confirm("Are you sure you want to delete all saved notes?");

    if (!confirmClear) {
        return;
    }

    savedNotes = [];
    localStorage.setItem("savedNotes", JSON.stringify(savedNotes));
    displaySavedNotes();

    outputBox.innerHTML =
        "<p>Your generated summary, quiz, or flashcards will appear here.</p>";
});