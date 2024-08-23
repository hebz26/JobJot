//-----------------MODAL OPEN AND CLOSE-----------------

const addJobBtn = document.getElementById("add-btn");
const jobModal = document.getElementById("jobModal");
const closeModal = document.getElementById("closeModal");
const jobForm = document.getElementById("jobForm");

// Function to open the modal
addJobBtn.addEventListener("click", () => {
  jobModal.style.display = "flex";
});

// Function to close the modal
closeModal.addEventListener("click", () => {
  jobModal.style.display = "none";
});

//-----------------RESUME UPLOAD CUSTOM BUTTON-----------------

const resumeUpload = document.getElementById("resume-upload");
const customButton = document.getElementById("customButton");
const fileName = document.getElementById("fileName");

customButton.addEventListener("click", function () {
  resumeUpload.click();
});

resumeUpload.addEventListener("change", function () {
  fileName.textContent =
    resumeUpload.files.length > 0
      ? resumeUpload.files[0].name
      : "No file chosen";
});
