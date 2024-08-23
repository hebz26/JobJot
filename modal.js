const jobModal = document.getElementById("jobModal");

export const openJobModal = () => {
  jobModal.style.display = "flex";
};

export const closeJobModal = () => {
  jobModal.style.display = "none";
  jobForm.reset();
};
