document.addEventListener("DOMContentLoaded", () => {
  //-----------------VARIABLES AND ELEMENTS-----------------
  const addJobBtn = document.getElementById("add-btn"); // Button to open the job modal
  const jobModal = document.getElementById("jobModal"); // Modal element for adding a job
  const closeModal = document.getElementById("closeModal"); // Button to close the modal
  const jobForm = document.getElementById("jobForm"); // Form element for submitting job details
  const jobCardsContainer = document.querySelector(".jobcards-container"); // Container to hold job cards
  const jobCardTemplate = document.getElementById("job-card-template").content; // Template for job cards
  const jobCountElement = document.querySelector(".job-count"); // Element to display job count

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Offered":
        return "#28a745"; // Green
      case "Ghosted":
        return "#6c757d"; // Grey
      case "Rejected":
        return "#dc3545"; // Red
      case "Applied":
        return "#007bff"; // Blue
      case "Interviewed":
        return "#ffc107"; // Yellow
      default:
        return "#ddd"; // Default color
    }
  };

  // Function to create a job card element from a job object
  const createJobCardElement = (job) => {
    const jobCard = jobCardTemplate.cloneNode(true);
    const jobCardElement = jobCard.querySelector(".job-card");

    if (!jobCardElement) {
      console.error("Job card element not found in template");
      return null;
    }

    // Set the job details
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

    // Set the color of the status circle and border-right
    const statusColor = getStatusColor(job.status || "N/A");
    const statusCircle = jobCard.querySelector(".status-circle");

    if (statusCircle) {
      statusCircle.style.backgroundColor = statusColor;
    }

    // Apply status color to border-right
    jobCardElement.style.borderRight = `10px solid ${statusColor}`;

    // Add event listener to edit button
    jobCard.querySelector(".edit-btn").addEventListener("click", () => {
      // Populate the form with current job details
      jobForm.company.value = job.company || "";
      jobForm["job-position"].value = job.jobTitle || "";
      jobForm["date-applied"].value = job.dateApplied || "";
      jobForm["application-deadline"].value = job.applicationDeadline || "";
      jobForm["job-description"].value = job.description || "";
      jobForm.location.value = job.location || "";
      jobForm.pay.value = job.pay || "";
      jobForm.status.value = job.status || "";
      jobForm["job-link"].value = job.jobLink || "";

      // Set the color of the status circle and border-right when editing
      let statusString = jobForm.status.value;
      let statusColor = getStatusColor(statusString);

      // Get the status circle element
      if (statusCircle) {
        statusCircle.style.backgroundColor = statusColor;
      }

      // Apply status color to border-right
      jobCardElement.style.borderRight = `10px solid ${statusColor}`;

      // Add a hidden field to store the job ID for updating
      jobForm.dataset.editingJobId = job.id;
      openJobModal();
    });

    return jobCard;
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

    updateJobCount(); // Update job count after rendering cards
  };

  // Function to update the job count display
  const updateJobCount = () => {
    if (jobCountElement) {
      jobCountElement.textContent = `Jobs: (${jobs.length})`;
    }
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

    const isEditing = jobForm.dataset.editingJobId; // Check if we're editing an existing job

    const newJob = {
      id: isEditing ? Number(isEditing) : Date.now(), // Use existing ID if editing
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

    if (isEditing) {
      // Update existing job
      jobs = jobs.map((job) => (job.id === Number(isEditing) ? newJob : job));
      jobForm.removeAttribute("data-editing-job-id"); // Clear editing ID
    } else {
      // Add new job
      saveJobToLocalStorage(newJob);
    }

    localStorage.setItem("jobs", JSON.stringify(jobs)); // Save the updated jobs array
    jobForm.reset();
    closeJobModal();
    renderJobCards(); // Re-render the job cards to reflect changes
  });

  //-----------------INITIAL JOB CARDS RENDERING-----------------
  // Render job cards when the page loads
  renderJobCards();
});
