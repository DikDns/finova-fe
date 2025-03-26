// Budget Page JavaScript

// Initialize IndexedDB
let db;
const DB_NAME = "finovaDB";
const DB_VERSION = 1;
const BUDGET_STORE = "budgets";
const TRANSACTION_STORE = "transactions";

// DOM Elements
let currentMonth = new Date();
let activeTab = "semua";
let categories = [];

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeDB();
  setupEventListeners();
  updateMonthDisplay();
});

// Initialize IndexedDB
function initializeDB() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onerror = (event) => {
    console.error("IndexedDB error:", event.target.error);
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Database opened successfully");
    loadInitialData();
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Create budget categories store
    if (!db.objectStoreNames.contains(BUDGET_STORE)) {
      const budgetStore = db.createObjectStore(BUDGET_STORE, {
        keyPath: "id",
        autoIncrement: true,
      });
      budgetStore.createIndex("month", "month", { unique: false });
      budgetStore.createIndex("category", "category", { unique: false });
    }

    // Create transactions store
    if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
      const transactionStore = db.createObjectStore(TRANSACTION_STORE, {
        keyPath: "id",
        autoIncrement: true,
      });
      transactionStore.createIndex("date", "date", { unique: false });
      transactionStore.createIndex("category", "category", { unique: false });
      transactionStore.createIndex("month", "month", { unique: false });
    }
  };
}

// Load initial data if DB is empty
function loadInitialData() {
  const transaction = db.transaction(BUDGET_STORE, "readonly");
  const store = transaction.objectStore(BUDGET_STORE);
  const countRequest = store.count();

  countRequest.onsuccess = () => {
    if (countRequest.result === 0) {
      // Add sample data if DB is empty
      const sampleData = [
        {
          month: formatMonth(currentMonth),
          category: "Tagihan",
          subcategory: "KPR",
          icon: "🏠",
          allocated: 450000,
          spent: 350000,
          target: 100000,
        },
        {
          month: formatMonth(currentMonth),
          category: "Tagihan",
          subcategory: "Listrik",
          icon: "⚡",
          allocated: 450000,
          spent: 350000,
          target: 100000,
        },
        {
          month: formatMonth(currentMonth),
          category: "Tagihan",
          subcategory: "Sampah",
          icon: "🗑️",
          allocated: 450000,
          spent: 350000,
          target: 100000,
        },
        {
          month: formatMonth(currentMonth),
          category: "Tagihan",
          subcategory: "Air",
          icon: "💧",
          allocated: 450000,
          spent: 350000,
          target: 100000,
        },
        {
          month: formatMonth(currentMonth),
          category: "Tagihan",
          subcategory: "Internet",
          icon: "📶",
          allocated: 450000,
          spent: 350000,
          target: 100000,
        },
        {
          month: formatMonth(currentMonth),
          category: "Kebutuhan",
          subcategory: "Internet",
          icon: "📶",
          allocated: 450000,
          spent: 350000,
          target: 100000,
        },
      ];

      addBulkData(sampleData);
    } else {
      // Load existing data
      loadBudgetData();
    }
  };
}

// Validate bulk data before adding
function validateBulkData(data) {
  const errors = [];
  data.forEach((item, index) => {
    const itemErrors = validateBudgetItem(item);
    if (itemErrors.length > 0) {
      errors.push(`Item ${index + 1}: ${itemErrors.join(", ")}`);
    }
  });
  return errors;
}

// Add bulk data to IndexedDB with validation and error handling
function addBulkData(data) {
  return new Promise((resolve, reject) => {
    const errors = validateBulkData(data);
    if (errors.length > 0) {
      reject(new Error(`Validation failed:\n${errors.join("\n")}`));
      return;
    }

    const transaction = db.transaction(BUDGET_STORE, "readwrite");
    const store = transaction.objectStore(BUDGET_STORE);
    const addedItems = [];

    data.forEach((item) => {
      const request = store.add(item);
      request.onsuccess = () => {
        addedItems.push({ ...item, id: request.result });
      };
    });

    transaction.oncomplete = () => {
      console.log("Bulk data added successfully");
      loadBudgetData();
      resolve(addedItems);
    };

    transaction.onerror = (event) => {
      console.error("Error adding bulk data:", event.target.error);
      reject(event.target.error);
    };
  });
}

// Cache for budget data
let budgetDataCache = {
  month: null,
  data: null,
  timestamp: null,
};

// Cache timeout in milliseconds (5 minutes)
const CACHE_TIMEOUT = 5 * 60 * 1000;

// Load budget data for the current month with caching
function loadBudgetData() {
  return new Promise((resolve, reject) => {
    const month = formatMonth(currentMonth);

    // Check if we have valid cached data
    if (
      budgetDataCache.month === month &&
      budgetDataCache.timestamp &&
      Date.now() - budgetDataCache.timestamp < CACHE_TIMEOUT
    ) {
      renderBudgetTable(budgetDataCache.data);
      updateTotalBalance(budgetDataCache.data);
      resolve(budgetDataCache.data);
      return;
    }

    const transaction = db.transaction(BUDGET_STORE, "readonly");
    const store = transaction.objectStore(BUDGET_STORE);
    const index = store.index("month");
    const request = index.getAll(month);

    transaction.oncomplete = () => {
      const budgetItems = request.result;

      // Update cache
      budgetDataCache = {
        month: month,
        data: budgetItems,
        timestamp: Date.now(),
      };

      renderBudgetTable(budgetItems);
      updateTotalBalance(budgetItems);
      resolve(budgetItems);
    };

    transaction.onerror = (event) => {
      console.error("Error loading budget data:", event.target.error);
      reject(event.target.error);
    };
  });
}

// Render the budget table
function renderBudgetTable(items) {
  const tableBody = document.getElementById("budgetTableBody");
  tableBody.innerHTML = "";

  // Group items by category
  const groupedItems = {};
  items.forEach((item) => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  // Render each category and its subcategories
  Object.keys(groupedItems).forEach((category) => {
    // Category row
    const categoryRow = document.createElement("tr");
    categoryRow.className = "category-row";
    categoryRow.innerHTML = `
      <td colspan="4">
        <button class="collapse-btn" data-category="${category}">
          <i class="fas fa-minus"></i>
        </button>
        ${category}
      </td>
    `;
    tableBody.appendChild(categoryRow);

    // Subcategory rows
    groupedItems[category].forEach((item) => {
      const subcategoryRow = document.createElement("tr");
      subcategoryRow.className = "subcategory-row";
      subcategoryRow.dataset.category = category;
      subcategoryRow.innerHTML = `
        <td>
          <span class="category-icon">${item.icon}</span>
          ${item.subcategory}
        </td>
        <td class="amount-allocated">Rp${formatNumber(item.allocated)}</td>
        <td class="amount-spent">-Rp${formatNumber(item.spent)}</td>
        <td class="amount-target">Rp${formatNumber(item.target)}</td>
      `;
      tableBody.appendChild(subcategoryRow);
    });
  });

  // Add event listeners to collapse buttons
  document.querySelectorAll(".collapse-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const category = e.currentTarget.dataset.category;
      const icon = e.currentTarget.querySelector("i");
      const rows = document.querySelectorAll(`tr[data-category="${category}"]`);

      rows.forEach((row) => {
        row.classList.toggle("hidden");
      });

      if (icon.classList.contains("fa-minus")) {
        icon.classList.replace("fa-minus", "fa-plus");
      } else {
        icon.classList.replace("fa-plus", "fa-minus");
      }
    });
  });
}

// Update the total balance display
function updateTotalBalance(items) {
  let totalAllocated = 0;
  let totalSpent = 0;

  items.forEach((item) => {
    totalAllocated += item.allocated;
    totalSpent += item.spent;
  });

  const remainingBalance = totalAllocated - totalSpent;

  document.getElementById("balanceAmount").textContent = `Rp${formatNumber(
    remainingBalance
  )}`;
}

// Set up event listeners
function setupEventListeners() {
  // Month selector
  document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    updateMonthDisplay();
    loadBudgetData();
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    updateMonthDisplay();
    loadBudgetData();
  });

  // Tab switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      e.currentTarget.classList.add("active");
      activeTab = e.currentTarget.dataset.tab;
      filterBudgetItems(activeTab);
    });
  });

  // Add category button
  document.getElementById("addCategoryBtn").addEventListener("click", () => {
    // Show modal or form to add new category
    console.log("Add category clicked");
  });

  // Allocate button
  document.getElementById("allocateBtn").addEventListener("click", () => {
    // Show allocation modal
    console.log("Allocate clicked");
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      document.querySelector(".nav-items").classList.toggle("open");
    });
  }
}

// Update the month display
function updateMonthDisplay() {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const monthYear = `${
    monthNames[currentMonth.getMonth()]
  } ${currentMonth.getFullYear()}`;
  document.getElementById("currentMonth").textContent = monthYear;
}

// Filter budget items based on active tab
function filterBudgetItems(tabName) {
  // Implementation depends on the specific filtering requirements
  console.log(`Filtering by: ${tabName}`);
  // For now, just reload the data
  loadBudgetData();
}

// Format month for database storage (YYYY-MM)
function formatMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

// Format number with thousand separators
function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Validate budget item data
function validateBudgetItem(item) {
  const errors = [];
  if (!item.category) errors.push("Category is required");
  if (!item.subcategory) errors.push("Subcategory is required");
  if (!item.icon) errors.push("Icon is required");
  if (typeof item.allocated !== "number" || item.allocated < 0)
    errors.push("Allocated amount must be a positive number");
  if (typeof item.spent !== "number" || item.spent < 0)
    errors.push("Spent amount must be a positive number");
  if (typeof item.target !== "number" || item.target < 0)
    errors.push("Target amount must be a positive number");
  return errors;
}

// Add a new budget item with validation
function addBudgetItem(item) {
  return new Promise((resolve, reject) => {
    const errors = validateBudgetItem(item);
    if (errors.length > 0) {
      reject(new Error(`Validation failed: ${errors.join(", ")}`));
      return;
    }

    const transaction = db.transaction(BUDGET_STORE, "readwrite");
    const store = transaction.objectStore(BUDGET_STORE);

    transaction.oncomplete = () => {
      console.log("Budget item added successfully");
      loadBudgetData();
      resolve(item);
    };

    transaction.onerror = (event) => {
      console.error("Transaction error:", event.target.error);
      reject(event.target.error);
    };

    try {
      store.add(item);
    } catch (error) {
      reject(error);
    }
  });
}

// Update a budget item with validation and error handling
function updateBudgetItem(id, updatedItem) {
  return new Promise((resolve, reject) => {
    const errors = validateBudgetItem(updatedItem);
    if (errors.length > 0) {
      reject(new Error(`Validation failed: ${errors.join(", ")}`));
      return;
    }

    const transaction = db.transaction(BUDGET_STORE, "readwrite");
    const store = transaction.objectStore(BUDGET_STORE);

    // First check if item exists
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      if (!getRequest.result) {
        reject(new Error(`Budget item with id ${id} not found`));
        return;
      }

      const request = store.put({ ...updatedItem, id });

      transaction.oncomplete = () => {
        console.log("Budget item updated successfully");
        loadBudgetData();
        resolve(updatedItem);
      };

      transaction.onerror = (event) => {
        console.error("Transaction error:", event.target.error);
        reject(event.target.error);
      };
    };

    getRequest.onerror = (event) => {
      reject(new Error(`Error checking item existence: ${event.target.error}`));
    };
  });
}

// Delete a budget item with validation and error handling
function deleteBudgetItem(id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error("Invalid budget item ID"));
      return;
    }

    const transaction = db.transaction(BUDGET_STORE, "readwrite");
    const store = transaction.objectStore(BUDGET_STORE);

    // First check if item exists
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      if (!getRequest.result) {
        reject(new Error(`Budget item with id ${id} not found`));
        return;
      }

      const request = store.delete(id);

      transaction.oncomplete = () => {
        console.log("Budget item deleted successfully");
        loadBudgetData();
        resolve(id);
      };

      transaction.onerror = (event) => {
        console.error("Transaction error:", event.target.error);
        reject(event.target.error);
      };
    };

    getRequest.onerror = (event) => {
      reject(new Error(`Error checking item existence: ${event.target.error}`));
    };
  });
}

// Add a transaction
function addTransaction(transaction) {
  const dbTransaction = db.transaction(
    [TRANSACTION_STORE, BUDGET_STORE],
    "readwrite"
  );
  const transactionStore = dbTransaction.objectStore(TRANSACTION_STORE);
  const budgetStore = dbTransaction.objectStore(BUDGET_STORE);

  // Add the transaction
  const request = transactionStore.add(transaction);

  request.onsuccess = () => {
    console.log("Transaction added successfully");

    // Update the corresponding budget item's spent amount
    const index = budgetStore.index("category");
    const getRequest = index.get([
      transaction.category,
      transaction.subcategory,
    ]);

    getRequest.onsuccess = () => {
      const budgetItem = getRequest.result;
      if (budgetItem) {
        budgetItem.spent += transaction.amount;

        const updateRequest = budgetStore.put(budgetItem);

        updateRequest.onsuccess = () => {
          console.log("Budget item updated with transaction");
          loadBudgetData();
        };
      }
    };
  };

  request.onerror = (event) => {
    console.error("Error adding transaction:", event.target.error);
  };
}

// Responsive handling
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  if (width <= 768) {
    // Mobile view adjustments
    document.querySelector(".budget-container").classList.add("mobile");
  } else {
    // Desktop view adjustments
    document.querySelector(".budget-container").classList.remove("mobile");
  }
});
