console.log("Hello world!");

// Pricing Page JS start

selectPlan = (element) => {
    // Remove selected class from all options
    document.querySelectorAll('.pricing-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    element.classList.add('selected');
    
    // Check the radio button
    element.querySelector('input[type="radio"]').checked = true;
}

// Pricing Page JS end
