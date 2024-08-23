document.addEventListener("DOMContentLoaded", () => {
  //-----------------VARIABLES AND ELEMENTS-----------------
  const addJobBtn = document.getElementById("add-btn");
  const jobModal = document.getElementById("jobModal");
  const closeModal = document.getElementById("closeModal");
  const jobForm = document.getElementById("jobForm");
  const jobCardsContainer = document.querySelector(".jobcards-container");
  const jobCardTemplate = document.getElementById("job-card-template").content;
  const jobCountElement = document.querySelector(".job-count");
  const sortBtn = document.getElementById("sort-btn");
  const sortMenu = document.getElementById("sort-menu");

  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  //-----------------MODAL OPEN AND CLOSE-----------------

  const openJobModal = () => {
    jobModal.style.display = "flex";
  };

  const closeJobModal = () => {
    jobModal.style.display = "none";
    jobForm.reset();
  };

  addJobBtn.addEventListener("click", openJobModal);
  closeModal.addEventListener("click", closeJobModal);

  //-----------------SORTING-----------------

  const statusOrder = {
    Applied: 1,
    Interviewed: 2,
    Offered: 3,
    Ghosted: 4,
    Rejected: 5,
  };

  const sortJobs = (criteria) => {
    if (criteria === "company") {
      jobs.sort((a, b) => a.company.localeCompare(b.company));
    } else if (criteria === "date") {
      jobs.sort((a, b) => new Date(a.dateApplied) - new Date(b.dateApplied));
    } else if (criteria === "status") {
      jobs.sort(
        (a, b) => (statusOrder[a.status] || 6) - (statusOrder[b.status] || 6)
      );
    }
    renderJobCards();
  };

  sortBtn.addEventListener("click", () => {
    sortMenu.style.display =
      sortMenu.style.display === "block" ? "none" : "block";
  });

  sortMenu.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const sortCriteria = e.target.getAttribute("data-sort");
      sortJobs(sortCriteria);
      sortMenu.style.display = "none"; // Hide the menu after selection
    }
  });

  // Click event handler to hide the menu if clicked outside
  document.addEventListener("click", (e) => {
    if (!sortBtn.contains(e.target) && !sortMenu.contains(e.target)) {
      sortMenu.style.display = "none";
    }
  });

  //-----------------JOB FORM SUBMISSION AND CARD RENDERING-----------------

  const saveJobToLocalStorage = (job) => {
    jobs.push(job);
    localStorage.setItem("jobs", JSON.stringify(jobs));
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

  const createJobCardElement = (job) => {
    const jobCard = jobCardTemplate.cloneNode(true);
    const jobCardElement = jobCard.querySelector(".job-card");

    if (!jobCardElement) {
      console.error("Job card element not found in template");
      return null;
    }

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

    const statusColor = getStatusColor(job.status || "N/A");
    const statusCircle = jobCard.querySelector(".status-circle");

    if (statusCircle) {
      statusCircle.style.backgroundColor = statusColor;
    }

    jobCardElement.style.borderRight = `10px solid ${statusColor}`;

    jobCard.querySelector(".edit-btn").addEventListener("click", () => {
      jobForm.company.value = job.company || "";
      jobForm["job-position"].value = job.jobTitle || "";
      jobForm["date-applied"].value = job.dateApplied || "";
      jobForm["application-deadline"].value = job.applicationDeadline || "";
      jobForm["job-description"].value = job.description || "";
      jobForm.location.value = job.location || "";
      jobForm.pay.value = job.pay || "";
      jobForm.status.value = job.status || "";
      jobForm["job-link"].value = job.jobLink || "";

      let statusString = jobForm.status.value;
      let statusColor = getStatusColor(statusString);

      if (statusCircle) {
        statusCircle.style.backgroundColor = statusColor;
      }

      jobCardElement.style.borderRight = `10px solid ${statusColor}`;
      jobForm.dataset.editingJobId = job.id;
      openJobModal();
    });

    return jobCard;
  };

  const renderJobCards = () => {
    jobCardsContainer.innerHTML = "";
    jobs.forEach((job) => {
      const jobCard = createJobCardElement(job);

      if (jobCard) {
        jobCard
          .querySelector(".openLink-btn")
          .addEventListener("click", function () {
            window.open(this.dataset.jobLink, "_blank");
          });

        jobCard
          .querySelector(".remove-btn")
          .addEventListener("click", function () {
            const jobId = this.closest(".job-card").dataset.jobId;
            removeJob(jobId);
          });

        jobCardsContainer.appendChild(jobCard);
      }
    });

    updateJobCount();
  };

  const updateJobCount = () => {
    if (jobCountElement) {
      jobCountElement.textContent = `Jobs: (${jobs.length})`;
    }
  };

  const removeJob = (jobId) => {
    jobs = jobs.filter((job) => job.id !== Number(jobId));
    localStorage.setItem("jobs", JSON.stringify(jobs));
    renderJobCards();
  };

  jobForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const isEditing = jobForm.dataset.editingJobId;

    const newJob = {
      id: isEditing ? Number(isEditing) : Date.now(),
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
      jobs = jobs.map((job) => (job.id === Number(isEditing) ? newJob : job));
      jobForm.removeAttribute("data-editing-job-id");
    } else {
      saveJobToLocalStorage(newJob);
    }

    localStorage.setItem("jobs", JSON.stringify(jobs));
    jobForm.reset();
    closeJobModal();
    renderJobCards();
  });

  renderJobCards();
});
