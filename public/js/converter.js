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
    
    // Add grouped options to from select
    populateSelectWithGroups(fromSelect, bankPrograms, hotelPrograms, airlinePrograms);
    
    // Initially populate to select with all options
    populateSelectWithGroups(toSelect, bankPrograms, hotelPrograms, airlinePrograms);
    
    // Add change listeners
    fromSelect.addEventListener('change', () => {
        updateToOptions();
        showTransferPreview();
    });
    toSelect.addEventListener('change', () => {
        updateFromOptions();
        showTransferPreview();
    });
}

// Helper function to populate select with grouped options
function populateSelectWithGroups(select, bankPrograms, hotelPrograms, airlinePrograms) {
    // Keep the first option's text
    const firstOption = select.querySelector('option[value=""]');
    const placeholderText = firstOption ? firstOption.textContent : 'Select a program';
    
    // Clear and recreate the first option
    select.innerHTML = '';
    const newFirstOption = document.createElement('option');
    newFirstOption.value = '';
    newFirstOption.textContent = placeholderText;
    select.appendChild(newFirstOption);
    
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
}

// Update to options based on selected from program
function updateToOptions() {
    const fromProgram = document.getElementById('fromProgram').value;
    const toSelect = document.getElementById('toProgram');
    
    // Temporarily remove the to listener to avoid circular updates
    toSelect.removeEventListener('change', updateFromOptions);
    
    if (!fromProgram) {
        // If no from program selected, show all options
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
        
        populateSelectWithGroups(toSelect, bankPrograms, hotelPrograms, airlinePrograms);
        return;
    }
    
    // Find all programs that can be reached from the selected program
    const reachablePrograms = new Set();
    
    // Direct conversions
    conversionData.conversions
        .filter(c => c.from === fromProgram)
        .forEach(c => reachablePrograms.add(c.to));
    
    // Two-step conversions
    conversionData.conversions
        .filter(c => c.from === fromProgram)
        .forEach(firstStep => {
            conversionData.conversions
                .filter(c => c.from === firstStep.to)
                .forEach(secondStep => reachablePrograms.add(secondStep.to));
        });
    
    // Group reachable programs by type
    const reachableBankPrograms = [];
    const reachableHotelPrograms = [];
    const reachableAirlinePrograms = [];
    
    reachablePrograms.forEach(progId => {
        const program = conversionData.programs[progId];
        const option = { id: progId, name: program.name, type: program.type };
        
        switch (program.type) {
            case 'bank':
                reachableBankPrograms.push(option);
                break;
            case 'hotel':
                reachableHotelPrograms.push(option);
                break;
            case 'airline':
                reachableAirlinePrograms.push(option);
                break;
        }
    });
    
    // Sort each group alphabetically
    reachableBankPrograms.sort((a, b) => a.name.localeCompare(b.name));
    reachableHotelPrograms.sort((a, b) => a.name.localeCompare(b.name));
    reachableAirlinePrograms.sort((a, b) => a.name.localeCompare(b.name));
    
    // Preserve current selection if possible
    const currentSelection = toSelect.value;
    
    // Update the to select with only reachable programs
    populateSelectWithGroups(toSelect, reachableBankPrograms, reachableHotelPrograms, reachableAirlinePrograms);
    
    // Restore selection if it's still valid
    if (currentSelection && reachablePrograms.has(currentSelection)) {
        toSelect.value = currentSelection;
    } else {
        toSelect.value = '';
    }
    
    // Update the placeholder text to indicate filtered results
    const firstOption = toSelect.querySelector('option[value=""]');
    if (firstOption) {
        if (reachablePrograms.size === 0) {
            firstOption.textContent = 'No transfer partners available';
        } else {
            firstOption.textContent = `Select from ${reachablePrograms.size} transfer partner${reachablePrograms.size === 1 ? '' : 's'}`;
        }
    }
    
    // Re-add the to listener
    toSelect.addEventListener('change', updateFromOptions);
}

// Update from options based on selected to program (reverse lookup)
function updateFromOptions() {
    const toProgram = document.getElementById('toProgram').value;
    const fromSelect = document.getElementById('fromProgram');
    
    // Temporarily remove the from listener to avoid circular updates
    fromSelect.removeEventListener('change', updateToOptions);
    
    if (!toProgram) {
        // If no to program selected, show all options
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
        
        populateSelectWithGroups(fromSelect, bankPrograms, hotelPrograms, airlinePrograms);
        return;
    }
    
    // Find all programs that can reach the selected program
    const sourcePrograms = new Set();
    
    // Direct conversions TO the selected program
    conversionData.conversions
        .filter(c => c.to === toProgram)
        .forEach(c => sourcePrograms.add(c.from));
    
    // Two-step conversions TO the selected program
    conversionData.conversions
        .filter(c => c.to === toProgram)
        .forEach(lastStep => {
            conversionData.conversions
                .filter(c => c.to === lastStep.from)
                .forEach(firstStep => sourcePrograms.add(firstStep.from));
        });
    
    // Group source programs by type
    const sourceBankPrograms = [];
    const sourceHotelPrograms = [];
    const sourceAirlinePrograms = [];
    
    sourcePrograms.forEach(progId => {
        const program = conversionData.programs[progId];
        const option = { id: progId, name: program.name, type: program.type };
        
        switch (program.type) {
            case 'bank':
                sourceBankPrograms.push(option);
                break;
            case 'hotel':
                sourceHotelPrograms.push(option);
                break;
            case 'airline':
                sourceAirlinePrograms.push(option);
                break;
        }
    });
    
    // Sort each group alphabetically
    sourceBankPrograms.sort((a, b) => a.name.localeCompare(b.name));
    sourceHotelPrograms.sort((a, b) => a.name.localeCompare(b.name));
    sourceAirlinePrograms.sort((a, b) => a.name.localeCompare(b.name));
    
    // Preserve current selection if possible
    const currentSelection = fromSelect.value;
    
    // Update the from select with only source programs
    populateSelectWithGroups(fromSelect, sourceBankPrograms, sourceHotelPrograms, sourceAirlinePrograms);
    
    // Restore selection if it's still valid
    if (currentSelection && sourcePrograms.has(currentSelection)) {
        fromSelect.value = currentSelection;
    } else {
        fromSelect.value = '';
    }
    
    // Update the placeholder text to indicate filtered results
    const firstOption = fromSelect.querySelector('option[value=""]');
    if (firstOption) {
        if (sourcePrograms.size === 0) {
            firstOption.textContent = 'No programs can transfer to this destination';
        } else {
            firstOption.textContent = `Select from ${sourcePrograms.size} program${sourcePrograms.size === 1 ? '' : 's'} that can transfer here`;
        }
    }
    
    // Re-add the from listener
    fromSelect.addEventListener('change', updateToOptions);
}

// Show transfer preview when one program is selected
function showTransferPreview() {
    const fromProgram = document.getElementById('fromProgram').value;
    const toProgram = document.getElementById('toProgram').value;
    const previewDiv = document.getElementById('transferPreview');
    const previewTitle = document.getElementById('transferPreviewTitle');
    const transferList = document.getElementById('transferList');
    
    // Hide if both or neither are selected
    if ((fromProgram && toProgram) || (!fromProgram && !toProgram)) {
        previewDiv.classList.add('hidden');
        return;
    }
    
    previewDiv.classList.remove('hidden');
    transferList.innerHTML = '';
    transferList.className = 'transfer-list';
    
    if (fromProgram && !toProgram) {
        // Show all transfers FROM the selected program
        const programName = conversionData.programs[fromProgram].name;
        previewTitle.textContent = `Transfer ${programName} points to:`;
        
        // Direct transfers
        const directTransfers = conversionData.conversions.filter(c => c.from === fromProgram);
        
        // Two-step transfers
        const twoStepTransfers = [];
        conversionData.conversions
            .filter(c => c.from === fromProgram)
            .forEach(firstStep => {
                conversionData.conversions
                    .filter(c => c.from === firstStep.to)
                    .forEach(secondStep => {
                        twoStepTransfers.push({
                            to: secondStep.to,
                            steps: [firstStep, secondStep],
                            totalRate: firstStep.rate * secondStep.rate
                        });
                    });
            });
        
        // Display direct transfers first
        directTransfers.forEach(transfer => {
            displayTransferItem(transfer, true);
        });
        
        // Display two-step transfers
        twoStepTransfers.forEach(transfer => {
            displayTransferItem(transfer, false);
        });
        
    } else if (!fromProgram && toProgram) {
        // Show all transfers TO the selected program
        const programName = conversionData.programs[toProgram].name;
        previewTitle.textContent = `Transfer points to ${programName} from:`;
        
        // Direct transfers
        const directTransfers = conversionData.conversions.filter(c => c.to === toProgram);
        
        // Two-step transfers
        const twoStepTransfers = [];
        conversionData.conversions
            .filter(c => c.to === toProgram)
            .forEach(lastStep => {
                conversionData.conversions
                    .filter(c => c.to === lastStep.from)
                    .forEach(firstStep => {
                        twoStepTransfers.push({
                            from: firstStep.from,
                            steps: [firstStep, lastStep],
                            totalRate: firstStep.rate * lastStep.rate
                        });
                    });
            });
        
        // Display direct transfers first
        directTransfers.forEach(transfer => {
            displayTransferItem(transfer, true, true);
        });
        
        // Display two-step transfers
        twoStepTransfers.forEach(transfer => {
            displayTransferItem(transfer, false, true);
        });
    }
    
    if (transferList.children.length === 0) {
        transferList.innerHTML = '<p>No transfers available</p>';
    }
}

// Helper function to display a transfer item
function displayTransferItem(transfer, isDirect, isReverse = false) {
    const transferList = document.getElementById('transferList');
    const item = document.createElement('div');
    item.className = 'transfer-item';
    
    let title, rate, details;
    
    if (isDirect) {
        const targetProgram = isReverse 
            ? conversionData.programs[transfer.from].name
            : conversionData.programs[transfer.to].name;
        
        title = targetProgram;
        rate = transfer.bonus ? transfer.bonusRate : transfer.rate;
        
        details = [];
        details.push(`Rate: 1:${rate}`);
        details.push(transfer.instantTransfer ? 'Instant' : '1-2 days');
        
        if (transfer.bonus) {
            details.push('BONUS ACTIVE');
        }
        if (transfer.note) {
            details.push(transfer.note);
        }
    } else {
        // Two-step transfer
        const targetProgram = isReverse 
            ? conversionData.programs[transfer.from].name
            : conversionData.programs[transfer.to].name;
        
        title = targetProgram;
        rate = transfer.totalRate.toFixed(2);
        
        details = [];
        details.push(`Rate: 1:${rate} (2 steps)`);
        
        // Show the path
        if (isReverse) {
            const step1From = conversionData.programs[transfer.steps[0].from].name;
            const step1To = conversionData.programs[transfer.steps[0].to].name;
            const step2To = conversionData.programs[transfer.steps[1].to].name;
            details.push(`Via: ${step1From} → ${step1To} → ${step2To}`);
        } else {
            const step1From = conversionData.programs[transfer.steps[0].from].name;
            const step1To = conversionData.programs[transfer.steps[0].to].name;
            const step2To = conversionData.programs[transfer.steps[1].to].name;
            details.push(`Via: ${step1From} → ${step1To} → ${step2To}`);
        }
    }
    
    item.innerHTML = `
        <div class="transfer-item-header">
            <div class="transfer-item-title">${title}</div>
            <div class="transfer-item-rate">1:${rate}</div>
        </div>
        <div class="transfer-item-details">${details.join(' • ')}</div>
    `;
    
    transferList.appendChild(item);
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
            displayAlternativeRoutes(amount, toName, multiStepRoutes);
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
    } else {
        // No conversion path found
        conversionPath.innerHTML = 'No conversion path found';
        conversionDetails.innerHTML = '<p>Unfortunately, there is no direct or 2-step conversion path between these programs.</p>';
        multiStepDiv.classList.add('hidden');
    }
}

// Display alternative routes when direct conversion exists
function displayAlternativeRoutes(amount, toName, routes) {
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