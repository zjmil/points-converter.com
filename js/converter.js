let conversionData = null;

// Load conversion data
async function loadConversionData() {
    try {
        const response = await fetch('data/conversions.json');
        conversionData = await response.json();
        
        // Update data info
        updateDataInfo();
        
        // Populate select options
        populateSelectOptions();
        
        // Load affiliate links
        loadAffiliateLinks();
    } catch (error) {
        console.error('Error loading conversion data:', error);
        alert('Error loading conversion data. Please refresh the page.');
    }
}

// Update data source and last updated info
function updateDataInfo() {
    const lastUpdated = new Date(conversionData.lastUpdated);
    document.getElementById('lastUpdated').textContent = `Last updated: ${lastUpdated.toLocaleDateString()}`;
    document.getElementById('dataSource').textContent = `Source: ${conversionData.dataSource}`;
}

// Populate select options
function populateSelectOptions() {
    const fromSelect = document.getElementById('fromProgram');
    const toSelect = document.getElementById('toProgram');
    
    // Clear existing options except the first one
    fromSelect.innerHTML = '<option value="">Select a program</option>';
    toSelect.innerHTML = '<option value="">Select a program</option>';
    
    // Group programs by type
    const bankPrograms = [];
    const hotelPrograms = [];
    const airlinePrograms = [];
    
    Object.entries(conversionData.programs).forEach(([id, program]) => {
        const option = { id, name: program.name, type: program.type };
        
        switch (program.type) {
            case 'bank':
                bankPrograms.push(option);
                break;
            case 'hotel':
                hotelPrograms.push(option);
                break;
            case 'airline':
                airlinePrograms.push(option);
                break;
        }
    });
    
    // Add grouped options to both selects
    [fromSelect, toSelect].forEach(select => {
        if (bankPrograms.length > 0) {
            const bankGroup = document.createElement('optgroup');
            bankGroup.label = 'Bank Points';
            bankPrograms.forEach(prog => {
                const option = document.createElement('option');
                option.value = prog.id;
                option.textContent = prog.name;
                bankGroup.appendChild(option);
            });
            select.appendChild(bankGroup);
        }
        
        if (hotelPrograms.length > 0) {
            const hotelGroup = document.createElement('optgroup');
            hotelGroup.label = 'Hotel Programs';
            hotelPrograms.forEach(prog => {
                const option = document.createElement('option');
                option.value = prog.id;
                option.textContent = prog.name;
                hotelGroup.appendChild(option);
            });
            select.appendChild(hotelGroup);
        }
        
        if (airlinePrograms.length > 0) {
            const airlineGroup = document.createElement('optgroup');
            airlineGroup.label = 'Airline Programs';
            airlinePrograms.forEach(prog => {
                const option = document.createElement('option');
                option.value = prog.id;
                option.textContent = prog.name;
                airlineGroup.appendChild(option);
            });
            select.appendChild(airlineGroup);
        }
    });
}

// Find direct conversion
function findDirectConversion(from, to) {
    return conversionData.conversions.find(c => c.from === from && c.to === to);
}

// Find multi-step conversions (simplified - only 2-step for now)
function findMultiStepConversions(from, to) {
    const routes = [];
    
    // Find all programs that 'from' can transfer to
    const fromTransfers = conversionData.conversions.filter(c => c.from === from);
    
    // For each intermediate program, check if it can transfer to 'to'
    fromTransfers.forEach(firstStep => {
        const secondStep = conversionData.conversions.find(
            c => c.from === firstStep.to && c.to === to
        );
        
        if (secondStep) {
            routes.push({
                steps: [firstStep, secondStep],
                totalRate: firstStep.rate * secondStep.rate
            });
        }
    });
    
    return routes;
}

// Calculate conversion
function calculateConversion() {
    const amount = parseFloat(document.getElementById('fromAmount').value);
    const from = document.getElementById('fromProgram').value;
    const to = document.getElementById('toProgram').value;
    
    if (!amount || !from || !to) {
        alert('Please fill in all fields');
        return;
    }
    
    if (from === to) {
        alert('Please select different programs');
        return;
    }
    
    // Find direct conversion
    const directConversion = findDirectConversion(from, to);
    
    // Find multi-step conversions
    const multiStepRoutes = findMultiStepConversions(from, to);
    
    // Display results
    displayResults(amount, from, to, directConversion, multiStepRoutes);
}

// Display conversion results
function displayResults(amount, from, to, directConversion, multiStepRoutes) {
    const resultsDiv = document.getElementById('results');
    const conversionPath = document.getElementById('conversionPath');
    const conversionDetails = document.getElementById('conversionDetails');
    const multiStepDiv = document.getElementById('multiStep');
    const alternativeRoutes = document.getElementById('alternativeRoutes');
    
    resultsDiv.classList.remove('hidden');
    
    const fromName = conversionData.programs[from].name;
    const toName = conversionData.programs[to].name;
    
    if (directConversion) {
        const rate = directConversion.bonus ? directConversion.bonusRate : directConversion.rate;
        const result = Math.floor(amount * rate);
        
        conversionPath.innerHTML = `${amount.toLocaleString()} ${fromName} → ${result.toLocaleString()} ${toName}`;
        
        let detailsHTML = `
            <p><strong>Exchange Rate:</strong> 1:${rate}</p>
            <p><strong>Transfer Type:</strong> ${directConversion.instantTransfer ? 'Instant' : 'May take 1-2 days'}</p>
        `;
        
        if (directConversion.bonus) {
            detailsHTML += `
                <p class="bonus-info">
                    <span class="bonus-indicator">BONUS ACTIVE</span>
                    Regular rate: 1:${directConversion.rate} → Bonus rate: 1:${directConversion.bonusRate}
                    ${directConversion.bonusEndDate ? ` (Ends ${new Date(directConversion.bonusEndDate).toLocaleDateString()})` : ''}
                </p>
            `;
        }
        
        if (directConversion.note) {
            detailsHTML += `<p><strong>Note:</strong> ${directConversion.note}</p>`;
        }
        
        conversionDetails.innerHTML = detailsHTML;
        
        // Show multi-step alternatives if available
        if (multiStepRoutes.length > 0) {
            multiStepDiv.classList.remove('hidden');
            displayAlternativeRoutes(amount, fromName, toName, multiStepRoutes);
        } else {
            multiStepDiv.classList.add('hidden');
        }
    } else if (multiStepRoutes.length > 0) {
        // No direct route, but multi-step routes available
        conversionPath.innerHTML = 'No direct conversion available';
        conversionDetails.innerHTML = '<p>Consider these multi-step conversion routes:</p>';
        
        multiStepDiv.classList.remove('hidden');
        alternativeRoutes.innerHTML = '';
        
        multiStepRoutes.forEach((route, index) => {
            const result = Math.floor(amount * route.totalRate);
            const routeDiv = document.createElement('div');
            routeDiv.className = 'conversion-step';
            
            let routeHTML = `<h4>Route ${index + 1}: ${result.toLocaleString()} ${toName}</h4>`;
            routeHTML += '<ol>';
            
            let currentAmount = amount;
            route.steps.forEach((step, stepIndex) => {
                const stepRate = step.bonus ? step.bonusRate : step.rate;
                const stepResult = Math.floor(currentAmount * stepRate);
                const stepFromName = conversionData.programs[step.from].name;
                const stepToName = conversionData.programs[step.to].name;
                
                routeHTML += `<li>${currentAmount.toLocaleString()} ${stepFromName} → ${stepResult.toLocaleString()} ${stepToName} (1:${stepRate})`;
                
                if (step.bonus) {
                    routeHTML += ' <span class="bonus-indicator">BONUS</span>';
                }
                
                routeHTML += '</li>';
                currentAmount = stepResult;
            });
            
            routeHTML += '</ol>';
            routeHTML += `<p><strong>Total Rate:</strong> 1:${route.totalRate.toFixed(2)}</p>`;
            
            routeDiv.innerHTML = routeHTML;
            alternativeRoutes.appendChild(routeDiv);
        });
    } else {
        // No conversion path found
        conversionPath.innerHTML = 'No conversion path found';
        conversionDetails.innerHTML = '<p>Unfortunately, there is no direct or 2-step conversion path between these programs.</p>';
        multiStepDiv.classList.add('hidden');
    }
}

// Display alternative routes when direct conversion exists
function displayAlternativeRoutes(amount, fromName, toName, routes) {
    const alternativeRoutes = document.getElementById('alternativeRoutes');
    alternativeRoutes.innerHTML = '<p>You might also consider these multi-step routes:</p>';
    
    routes.forEach((route, index) => {
        const result = Math.floor(amount * route.totalRate);
        const routeDiv = document.createElement('div');
        routeDiv.className = 'conversion-step';
        
        let routeHTML = `<h4>Alternative ${index + 1}: ${result.toLocaleString()} ${toName}</h4>`;
        routeHTML += '<ol>';
        
        let currentAmount = amount;
        route.steps.forEach((step) => {
            const stepRate = step.bonus ? step.bonusRate : step.rate;
            const stepResult = Math.floor(currentAmount * stepRate);
            const stepFromName = conversionData.programs[step.from].name;
            const stepToName = conversionData.programs[step.to].name;
            
            routeHTML += `<li>${currentAmount.toLocaleString()} ${stepFromName} → ${stepResult.toLocaleString()} ${stepToName} (1:${stepRate})`;
            
            if (step.bonus) {
                routeHTML += ' <span class="bonus-indicator">BONUS</span>';
            }
            
            routeHTML += '</li>';
            currentAmount = stepResult;
        });
        
        routeHTML += '</ol>';
        routeHTML += `<p><strong>Total Rate:</strong> 1:${route.totalRate.toFixed(2)}</p>`;
        
        routeDiv.innerHTML = routeHTML;
        alternativeRoutes.appendChild(routeDiv);
    });
}

// Load affiliate links
function loadAffiliateLinks() {
    const affiliateLinksDiv = document.getElementById('affiliateLinks');
    
    conversionData.affiliateLinks.forEach(link => {
        const card = document.createElement('div');
        card.className = 'affiliate-card';
        card.innerHTML = `
            <h4>${link.name}</h4>
            <p><strong>Bonus:</strong> ${link.bonus}</p>
            <p><strong>Annual Fee:</strong> ${link.annualFee}</p>
            <a href="${link.url}" target="_blank" rel="noopener">Learn More</a>
        `;
        affiliateLinksDiv.appendChild(card);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadConversionData();
    
    document.getElementById('convertBtn').addEventListener('click', calculateConversion);
    
    // Allow Enter key to trigger conversion
    document.getElementById('fromAmount').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateConversion();
    });
});