import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {
  getFirestore,
  onSnapshot,
  query,
  orderBy ,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5shJ_ux1eyCb1H7LA0qXm6kmj5o5QA1E",
  authDomain: "task5-68c0c.firebaseapp.com",
  projectId: "task5-68c0c",
  storageBucket: "task5-68c0c.appspot.com",
  messagingSenderId: "973610349513",
  appId: "1:973610349513:web:ba20749a2c79508c472e18",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionRef = collection(db, "MovieReview");

function addMovie() {
  // Get the modal element
  const modal = document.getElementById("mymd");

  // Get the close button element inside the modal
  const closeBtn = document.getElementsByClassName("addclose")[0];

  // Get the form fields
  const movieNameInput = document.getElementById("moviename1");
  const directorInput = document.getElementById("directer");
  const releaseDateInput = document.getElementById("relese");
  const ratingInput = document.getElementById("rate");

  // Show the modal
  modal.style.display = "block";

  // Handle the close button click event
  closeBtn.onclick = function () {
    // Hide the modal
    modal.style.display = "none";
  };

  // Handle the form submission event
  const form = document.getElementById("myaddForm");
  form.onsubmit = function (event) {
    event.preventDefault();

    // Get the data from the form fields
    const movieName = movieNameInput.value;
    const director = directorInput.value;
    const releaseDate = releaseDateInput.value;
    const rating = ratingInput.value;

    // Create an object with the movie data
    const movieData = {
      movie_name: movieName,
      movie_director: director,
      Release_date: releaseDate,
      Rating: rating,
    };

    // Add a new document to Firestore
    addDoc(collectionRef, movieData)
      .then(() => {
        console.log("Document successfully added!");
        // Hide the modal
        modal.style.display = "none";
        location.reload();
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };
}

function deleteMovie(id) {
  console.log("Delete button clicked for ID:", id);
  const docRef = doc(collectionRef, id);
  deleteDoc(docRef)
    .then(() => {
      console.log("Document successfully deleted!");
      location.reload();
    })
    .catch((error) => {
      console.error("Error removing document: ", error);
    });
}

function editMovie(id) {
  console.log("Edit button clicked for ID:", id);

  // Get the modal element
  const modal = document.getElementById("myModal");

  // Get the close button element inside the modal
  const closeBtn = document.getElementsByClassName("close")[0];

  // Get the form fields
  const movieNameInput = document.getElementById("movieName");
  const directorInput = document.getElementById("director");
  const releaseDateInput = document.getElementById("releaseDate");
  const ratingInput = document.getElementById("rating");

  // Show the modal
  modal.style.display = "block";

  // Handle the close button click event
  closeBtn.onclick = function () {
    // Hide the modal
    modal.style.display = "none";
  };

  // Handle the form submission event
  const form = document.getElementById("myForm");
  form.onsubmit = function (event) {
    event.preventDefault();

    // Get the updated data from the form fields
    const movieName = movieNameInput.value;
    const director = directorInput.value;
    const releaseDate = releaseDateInput.value;
    const rating = ratingInput.value;

    // Create an object with the updated data
    const updatedData = {
      movie_name: movieName,
      movie_director: director,
      Release_date: releaseDate,
      Rating: rating,
    };

    // Update the document in Firestore
    const docRef = doc(collectionRef, id);
    updateDoc(docRef, updatedData)
      .then(() => {
        console.log("Document successfully updated!");
        // Hide the modal
        modal.style.display = "none";
        location.reload();
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  };

  // Retrieve the document data and fill the form fields
  const docRef = doc(collectionRef, id);
  getDoc(docRef)
    .then((doc) => {
      if (doc.exists()) {
        const data = doc.data();
        movieNameInput.value = data.movie_name;
        directorInput.value = data.movie_director;
        releaseDateInput.value = data.Release_date;
        ratingInput.value = data.Rating;
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.error("Error getting document: ", error);
    });
}

getDocs(query(collectionRef, orderBy("movie_name")))
  .then((querySnapshot) => {
    let tableRows = "";
    querySnapshot.forEach((doc) => {
      const documentId = doc.id;
      const data = doc.data();
      console.log("Document ID:", documentId);
      console.log("Data:", data);

      tableRows += "<tr>";
      tableRows += "<td>" + doc.data().movie_name + "</td>";
      tableRows += "<td>" + doc.data().movie_director + "</td>";
      tableRows += "<td>" + doc.data().Release_date + "</td>";
      tableRows += "<td>" + doc.data().Rating + "/5</td>";
      tableRows += `<td><button class="addbtn"><i class="fa-solid fa-square-plus"></i></button><button class="editbtn" data-id="${documentId}"><i class='fas fa-edit edit-icon'></i></button><button class="deletebtn" data-id="${documentId}"><i class='fas fa-trash delete-icon'></i></button></td>`;
      tableRows += "</tr>";
    });
    $("#MovieList").append(tableRows);

    // Display review count
    $("#Movienum").html(querySnapshot.size + " Movie in the list");

    // Add buttons and event listeners dynamically
    const deleteButtons = document.querySelectorAll(".deletebtn");
    const editButtons = document.querySelectorAll(".editbtn");
    const addButtons = document.querySelectorAll(".addbtn");

    addButtons.forEach((button) => {
      button.addEventListener("click", addMovie);
    });

    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const documentId = button.getAttribute("data-id");
        deleteMovie(documentId);
      });
    });

    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const documentId = button.getAttribute("data-id");
        editMovie(documentId);
      });
    });
  })
  .catch((error) => {
    console.error("Error getting documents: ", error);
  });