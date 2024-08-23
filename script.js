document.addEventListener("DOMContentLoaded", () => {
  //-----------------VARIABLES AND ELEMENTS-----------------
  const addJobBtn = document.getElementById("add-btn"); // Button to open the job modal
  const jobModal = document.getElementById("jobModal"); // Modal element for adding a job
  const closeModal = document.getElementById("closeModal"); // Button to close the modal
  const jobForm = document.getElementById("jobForm"); // Form element for submitting job details
  const jobCardsContainer = document.querySelector(".jobcards-container"); // Container to hold job cards
  const jobCardTemplate = document.getElementById("job-card-template").content; // Template for job cards

  // Load jobs from localStorage or initialize as an empty array if none exist
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  //-----------------MODAL OPEN AND CLOSE-----------------

  // Function to open the job modal
  const openJobModal = () => {
    jobModal.style.display = "flex";
  };

  // Function to close the job modal
  const closeJobModal = () => {
    jobModal.style.display = "none";
    jobForm.reset();
  };

  // Event listeners for opening and closing the job modal
  addJobBtn.addEventListener("click", openJobModal);
  closeModal.addEventListener("click", closeJobModal);

  //-----------------JOB FORM SUBMISSION AND CARD RENDERING-----------------

  // Function to save a new job to localStorage
  const saveJobToLocalStorage = (job) => {
    jobs.push(job); // Add the new job to the jobs array
    localStorage.setItem("jobs", JSON.stringify(jobs)); // Save the updated jobs array to localStorage
  };

  // Function to create a job card element from a job object
  const createJobCardElement = (job) => {
    const jobCard = jobCardTemplate.cloneNode(true); // Clone the job card template
    const jobCardElement = jobCard.querySelector(".job-card"); // Find the job card element in the template

    if (!jobCardElement) {
      console.error("Job card element not found in template");
      return null; // Exit if the job card element is not found
    }

    // Set the data attributes and text content for the job card
    jobCardElement.dataset.jobId = job.id;
    jobCard.querySelector(".job-company").textContent = job.company || "N/A";
    jobCard.querySelector(".job-title").textContent = job.jobTitle || "N/A";
    jobCard.querySelector("[data-date-applied]").textContent =
      job.dateApplied || "N/A";
    jobCard.querySelector("[data-date-deadline]").textContent =
      job.applicationDeadline || "N/A";
    jobCard.querySelector("[data-description]").textContent =
      job.description || "N/A";
    jobCard.querySelector("[data-status]").textContent = job.status || "N/A";
    jobCard.querySelector("[data-location]").textContent =
      job.location || "N/A";
    jobCard.querySelector("[data-pay]").textContent = job.pay || "N/A";
    jobCard.querySelector(".openLink-btn").dataset.jobLink = job.jobLink || "#";

    return jobCard; // Return the populated job card
  };

  // Function to render all job cards in the container
  const renderJobCards = () => {
    jobCardsContainer.innerHTML = ""; // Clear existing job cards
    jobs.forEach((job) => {
      const jobCard = createJobCardElement(job);

      if (jobCard) {
        // Add event listener to open the job link in a new tab
        jobCard
          .querySelector(".openLink-btn")
          .addEventListener("click", function () {
            window.open(this.dataset.jobLink, "_blank");
          });

        // Add event listener to remove the job card
        jobCard
          .querySelector(".remove-btn")
          .addEventListener("click", function () {
            const jobId = this.closest(".job-card").dataset.jobId;
            removeJob(jobId);
          });

        jobCardsContainer.appendChild(jobCard); // Append the job card to the container
      }
    });
  };

  // Function to remove a job by ID
  const removeJob = (jobId) => {
    jobs = jobs.filter((job) => job.id !== Number(jobId)); // Filter out the job with the given ID
    localStorage.setItem("jobs", JSON.stringify(jobs)); // Update localStorage with the new jobs array
    renderJobCards(); // Re-render the job cards
  };

  //-----------------JOB FORM SUBMISSION HANDLING-----------------
  // Event listener for form submission
  jobForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Create a new job object from the form values
    const newJob = {
      id: Date.now(), // Unique ID based on current timestamp
      company: jobForm.company.value.trim() || "N/A",
      jobTitle: jobForm["job-position"].value.trim() || "N/A",
      dateApplied: jobForm["date-applied"].value.trim() || "N/A",
      applicationDeadline:
        jobForm["application-deadline"].value.trim() || "N/A",
      description: jobForm["job-description"].value.trim() || "N/A",
      location: jobForm.location.value.trim() || "N/A",
      pay: jobForm.pay.value.trim() || "N/A",
      status: jobForm.status.value.trim() || "N/A",
      jobLink: jobForm["job-link"].value.trim() || "https://www.linkedin.com/",
    };

    // Save the new job and update the UI
    saveJobToLocalStorage(newJob);
    jobForm.reset();
    closeJobModal();
    renderJobCards();
  });

  //-----------------INITIAL JOB CARDS RENDERING-----------------
  // Render job cards when the page loads
  renderJobCards();
});
