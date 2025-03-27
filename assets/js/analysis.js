// Function to update chart dimensions
function updateChartDimensions() {
  if (window.expenseChart) {
    const expenseCanvas = document.getElementById("expenseChart");
    expenseCanvas.style.height = "300px";
    window.expenseChart.resize();
  }
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Add resize event listener
    window.addEventListener("resize", updateChartDimensions);
    // Initialize expense doughnut chart
    const expenseCtx = document.getElementById("expenseChart");
    const expenseData = {
      labels: ["KPR", "Listrik", "Belanja", "Bensin"],
      datasets: [
        {
          data: [250000, 100000, 50000, 50000],
          backgroundColor: ["#284a63", "#4a90e2", "#50c878", "#f39c12"],
          borderWidth: 0,
        },
      ],
    };

    // Set canvas dimensions and clear before initialization
    const expenseContainer = expenseCtx.parentElement;
    const expenseContext = expenseCtx.getContext("2d", {
      willReadFrequently: true,
    });
    expenseCtx.style.width = "100%";
    expenseCtx.style.height = "300px";
    expenseCtx.width = expenseContainer.offsetWidth;
    expenseCtx.height = 300;
    expenseContext.clearRect(0, 0, expenseCtx.width, expenseCtx.height);

    // Destroy existing chart if it exists
    if (window.expenseChart instanceof Chart) {
      window.expenseChart.destroy();
    }

    // Create new chart and store reference
    window.expenseChart = new Chart(expenseCtx, {
      type: "doughnut",
      data: expenseData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        animation: {
          animateRotate: true,
          animateScale: true,
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });

    // Create custom legends
    const expenseLegend = document.getElementById("expenseLegend");
    expenseLegend.innerHTML = ""; // Clear existing legends
    expenseData.labels.forEach((label, index) => {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.innerHTML = `
      <div class="legend-color" style="background-color: ${expenseData.datasets[0].backgroundColor[index]}"></div>
      <div class="legend-label">${label}</div>
    `;
      expenseLegend.appendChild(legendItem);
    });
  } catch (error) {
    console.error("Error initializing charts:", error);
  }
});
