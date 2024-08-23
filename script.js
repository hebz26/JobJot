//-----------------IMPORT STATEMENTS-----------------
import { getStatusColor } from "./statusColor.js";
import { openJobModal, closeJobModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
  //-----------------VARIABLES AND ELEMENTS-----------------
  const elements = {
    addJobBtn: document.getElementById("add-btn"),
    closeModal: document.getElementById("closeModal"),
    jobForm: document.getElementById("jobForm"),
    jobCardsContainer: document.querySelector(".jobcards-container"),
    jobCardTemplate: document.getElementById("job-card-template").content,
    jobCountElement: document.querySelector(".job-count"),
    sortBtn: document.getElementById("sort-btn"),
    sortMenu: document.getElementById("sort-menu"),
    filterBtn: document.getElementById("filter-btn"),
    filterMenu: document.getElementById("filter-menu"),
  };

  // Load jobs from local storage, or initialize an empty array if none exist
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  //-----------------MODAL HANDLERS-----------------
  const initializeModalHandlers = () => {
    elements.addJobBtn.addEventListener("click", openJobModal);
    elements.closeModal.addEventListener("click", closeJobModal);
  };

  //-----------------SORTING-----------------
  const sortCriteria = {
    company: (a, b) => a.company.localeCompare(b.company), // Sort by company name alphabetically
    date: (a, b) => new Date(a.dateApplied) - new Date(b.dateApplied), // Sort by date applied (oldest to newest)
    status: (a, b) => statusOrder[a.status] - statusOrder[b.status], // Sort by status in custom order
  };

  // Custom order for job statuses sorting
  const statusOrder = {
    Applied: 1,
    Interviewed: 2,
    Offered: 3,
    Ghosted: 4,
    Rejected: 5,
  };

  // Functions to initialize sorting functionality
  const initializeSortHandlers = () => {
    elements.sortBtn.addEventListener("click", toggleSortMenu);
    elements.sortMenu.addEventListener("click", handleSortSelection);
    document.addEventListener("click", handleClickOutsideSortMenu);
  };

  // Toggle the visibility of the sort menu
  const toggleSortMenu = () => {
    elements.sortMenu.style.display =
      elements.sortMenu.style.display === "block" ? "none" : "block";
  };

  // Handle the sorting of jobs based on the selected criterion
  const handleSortSelection = (e) => {
    if (e.target.tagName === "BUTTON") {
      sortJobs(e.target.getAttribute("data-sort"));
      toggleSortMenu();
    }
  };

  // Hide the sort menu if a click occurs outside of the sort button and menu
  const handleClickOutsideSortMenu = (e) => {
    if (
      !elements.sortBtn.contains(e.target) &&
      !elements.sortMenu.contains(e.target)
    ) {
      elements.sortMenu.style.display = "none";
    }
  };

  // Sort jobs based on the selected criteria and re-render the job cards
  const sortJobs = (criteria) => {
    jobs.sort(sortCriteria[criteria]);
    renderJobCards();
  };

  //-----------------FILTERING-----------------
  const initializeFilterHandlers = () => {
    elements.filterBtn.addEventListener("click", toggleFilterMenu);
    elements.filterMenu.addEventListener("click", handleFilterChange);
    document.addEventListener("click", handleClickOutsideFilterMenu);
  };

  // Toggle the visibility of the filter menu
  const toggleFilterMenu = () => {
    elements.filterMenu.style.display =
      elements.filterMenu.style.display === "block" ? "none" : "block";
  };

  // Handle changes in the filter menu and re-render job cards
  const handleFilterChange = (e) => {
    if (e.target.classList.contains("status-filter")) {
      renderJobCards();
    }
  };

  // Hide the filter menu if a click occurs outside of the filter button and menu
  const handleClickOutsideFilterMenu = (e) => {
    if (
      !elements.filterBtn.contains(e.target) &&
      !elements.filterMenu.contains(e.target)
    ) {
      elements.filterMenu.style.display = "none";
    }
  };

  // Get selected filter values (checked checkboxes)
  const getSelectedFilters = () => {
    return Array.from(document.querySelectorAll(".status-filter:checked")).map(
      (checkbox) => checkbox.value
    );
  };

  // Filter jobs based on selected filters
  const filterJobs = (jobs) => {
    const selectedFilters = getSelectedFilters();
    return selectedFilters.length === 0
      ? jobs // If no filters are selected, return all jobs
      : jobs.filter((job) => selectedFilters.includes(job.status));
  };

  //-----------------JOB FORM SUBMISSION AND CARD RENDERING-----------------

  const initializeFormHandlers = () => {
    elements.jobForm.addEventListener("submit", handleJobFormSubmit);
  };

  // Handle form submission for adding/editing jobs
  const handleJobFormSubmit = (e) => {
    e.preventDefault();
    const isEditing = elements.jobForm.dataset.editingJobId; // Check if editing an existing job
    const newJob = createJobObject(isEditing); // Create a job object from form data

    if (isEditing) {
      updateJobInLocalStorage(newJob); // Update existing job
      elements.jobForm.removeAttribute("data-editing-job-id"); // Clear editing flag
    } else {
      saveJobToLocalStorage(newJob); // Save new job
    }

    elements.jobForm.reset();
    closeJobModal();
    renderJobCards();
  };

  // Create a job object from form data
  const createJobObject = (isEditing) => {
    return {
      id: isEditing ? Number(isEditing) : Date.now(), // Use existing ID if editing, otherwise generate a new one
      company: elements.jobForm.company.value.trim() || "N/A",
      jobTitle: elements.jobForm["job-position"].value.trim() || "N/A",
      dateApplied: elements.jobForm["date-applied"].value.trim() || "N/A",
      applicationDeadline:
        elements.jobForm["application-deadline"].value.trim() || "N/A",
      description: elements.jobForm["job-description"].value.trim() || "N/A",
      location: elements.jobForm.location.value.trim() || "N/A",
      pay: elements.jobForm.pay.value.trim() || "N/A",
      status: elements.jobForm.status.value.trim() || "N/A",
      jobLink:
        elements.jobForm["job-link"].value.trim() ||
        "https://www.linkedin.com/",
    };
  };

  // Save a new job to local storage
  const saveJobToLocalStorage = (job) => {
    jobs.push(job);
    localStorage.setItem("jobs", JSON.stringify(jobs));
  };

  // Update an existing job in local storage
  const updateJobInLocalStorage = (updatedJob) => {
    jobs = jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)); // Find the job by ID and update it
    localStorage.setItem("jobs", JSON.stringify(jobs)); // Save the updated jobs array to local storage
  };

  // Render all job cards on the page
  const renderJobCards = () => {
    elements.jobCardsContainer.innerHTML = ""; // Clear existing job cards
    const filteredJobs = filterJobs(jobs); // Get filtered jobs

    // Create and append job cards for each job
    filteredJobs.forEach((job) => {
      const jobCard = createJobCardElement(job);
      if (jobCard) {
        elements.jobCardsContainer.appendChild(jobCard);
      }
    });

    updateJobCount(filteredJobs.length); // Update the job count display
  };

  // Create a job card element from a job object
  const createJobCardElement = (job) => {
    const jobCard = elements.jobCardTemplate.cloneNode(true); // Clone the job card template
    const jobCardElement = jobCard.querySelector(".job-card");

    if (!jobCardElement) {
      console.error("Job card element not found in template");
      return null; // If the template is missing, return null
    }

    jobCardElement.dataset.jobId = job.id; // Set the job ID on the card element
    setJobCardContent(jobCard, job); // Set the content of the job card
    setJobCardHandlers(jobCardElement, job); // Set the event handlers for the job card

    return jobCard;
  };

  // Set the content of a job card
  const setJobCardContent = (jobCard, job) => {
    jobCard.querySelector(".job-company").textContent = job.company;
    jobCard.querySelector(".job-title").textContent = job.jobTitle;
    jobCard.querySelector("[data-date-applied]").textContent =
      job.dateApplied || "N/A";
    jobCard.querySelector("[data-date-deadline]").textContent =
      job.applicationDeadline || "N/A";
    jobCard.querySelector("[data-description]").textContent =
      job.description || "N/A";
    jobCard.querySelector("[data-status]").textContent = job.status;
    jobCard.querySelector("[data-location]").textContent =
      job.location || "N/A";
    jobCard.querySelector("[data-pay]").textContent = job.pay || "N/A";
    jobCard.querySelector(".openLink-btn").dataset.jobLink = job.jobLink;

    //setting status and border color
    const statusColor = getStatusColor(job.status);
    const statusCircle = jobCard.querySelector(".status-circle");
    if (statusCircle) {
      statusCircle.style.backgroundColor = statusColor;
    }
    jobCard.querySelector(
      ".job-card"
    ).style.borderRight = `10px solid ${statusColor}`;
  };

  // Set event handlers for a job card (edit, open link, remove)
  const setJobCardHandlers = (jobCardElement, job) => {
    jobCardElement.querySelector(".edit-btn").addEventListener("click", () => {
      populateFormForEditing(job); // Populate the form with the job data for editing
      openJobModal(); // Open the job modal
    });

    // Open job link button
    jobCardElement
      .querySelector(".openLink-btn")
      .addEventListener("click", function () {
        window.open(this.dataset.jobLink, "_blank");
      });

    // Remove job button
    jobCardElement
      .querySelector(".remove-btn")
      .addEventListener("click", () => removeJob(job.id));
  };

  // Populate the form with job data for editing
  const populateFormForEditing = (job) => {
    elements.jobForm.company.value = job.company;
    elements.jobForm["job-position"].value = job.jobTitle;
    elements.jobForm["date-applied"].value = job.dateApplied;
    elements.jobForm["application-deadline"].value = job.applicationDeadline;
    elements.jobForm["job-description"].value = job.description;
    elements.jobForm.location.value = job.location;
    elements.jobForm.pay.value = job.pay;
    elements.jobForm.status.value = job.status;
    elements.jobForm["job-link"].value = job.jobLink;
    elements.jobForm.dataset.editingJobId = job.id;
  };

  // Update the job count displayed on the page
  const updateJobCount = (count) => {
    elements.jobCountElement.textContent = `Jobs: (${count})`;
  };

  // Remove a job from local storage and re-render job cards
  const removeJob = (jobId) => {
    jobs = jobs.filter((job) => job.id !== jobId); // Remove the job with the matching ID
    localStorage.setItem("jobs", JSON.stringify(jobs)); // Save the updated jobs array to local storage
    renderJobCards();
  };

  //-----------------INITIALIZATION-----------------
  // Initialize the application by setting up event handlers and rendering the job cards
  const initialize = () => {
    initializeModalHandlers();
    initializeSortHandlers();
    initializeFilterHandlers();
    initializeFormHandlers();
    renderJobCards();
  };

  // Call initialize function to start the application
  initialize();
});
