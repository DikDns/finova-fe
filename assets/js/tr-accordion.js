document.addEventListener("DOMContentLoaded", () => {
  const groupRows = document.querySelectorAll(".group-row");

  groupRows.forEach((groupRow) => {
    const groupName = groupRow.getAttribute("data-group");
    const categoryRows = document.querySelectorAll(
      `.category-row[data-group="${groupName}"]`
    );
    const icon = groupRow.querySelector(".icon");

    // Initial state
    categoryRows.forEach((row) => (row.style.display = "table-row"));
    icon.classList.remove("collapsed");

    groupRow.addEventListener("click", () => {
      const isCollapsed = icon.classList.contains("collapsed");

      // Toggle Active Class
      groupRow.classList.toggle("active");

      // Toggle icon
      icon.classList.toggle("collapsed");

      // Toggle visibility with animation
      categoryRows.forEach((row) => {
        if (isCollapsed) {
          row.style.display = "table-row";
          // Trigger reflow
          void row.offsetHeight;
          row.style.opacity = "1";
        } else {
          row.style.opacity = "0";
          row.addEventListener("transitionend", function handler() {
            if (icon.classList.contains("fa-plus")) {
              row.style.display = "none";
            }
            row.removeEventListener("transitionend", handler);
          });
        }
      });
    });
  });
});
