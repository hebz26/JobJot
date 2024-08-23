export const getStatusColor = (status) => {
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
