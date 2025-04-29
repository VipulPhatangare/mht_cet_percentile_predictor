document.getElementById('percentileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const marks = parseFloat(document.getElementById('marks').value);
    const date = document.getElementById('examDate').value;
    const shift = document.getElementById('shift').value;
    
    // Validate inputs
    if (isNaN(marks) || marks < 0 || marks > 200 || !date || !shift) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    // Show loading state
    const btn = document.querySelector('.btn');
    btn.disabled = true;
    btn.innerHTML = 'Calculating...';
    
    // Simulate calculation delay
    setTimeout( async() => {
        // Calculate percentile (replace with your actual algorithm)
        const percentile = await calculateMHTCETPercentile(marks, date, shift);
        
        // Display results
        document.getElementById('percentileValue').textContent = percentile.toFixed(2);
        document.getElementById('displayMarks').textContent = marks;
        document.getElementById('displayDate').textContent = formatDate(date);
        document.getElementById('displayShift').textContent = `Shift ${shift}`;
        document.getElementById('result').style.display = 'block';
        
        // Reset button
        btn.disabled = false;
        btn.innerHTML = 'Calculate My Percentile';
        
        // Scroll to results
        document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
    }, 800);
});

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

async function calculateMHTCETPercentile(marks, date, shift) {
    try {
        const response = await fetch(`/fetch_percentile/${marks}/${date}/${shift}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        console.log("Percentile data:", data);
        return data.Percentile;
    } catch (error) {
        console.error("Error fetching percentile:", error);
    }
}
