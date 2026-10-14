let processes = [];
const MAX = 100;
let QUANTUM = 3;

// Process colors for Gantt chart
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#FF6F91', '#4CAF50', '#2196F3', '#FF9800', '#E91E63',
    '#9C27B0', '#00BCD4', '#CDDC39', '#FF5722', '#795548'
];

function generateManualInput() {
    const count = parseInt(document.getElementById('processCount').value);
    if (!count || count < 1 || count > 20) {
        alert('Please enter a valid number of processes (1-20)');
        return;
    }

    const container = document.getElementById('processInputs');
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const card = document.createElement('div');
        card.className = 'process-input-card';
        card.innerHTML = `
            <h4>Process ${i + 1}</h4>
            <div class="input-row">
                <label>Arrival Time:</label>
                <input type="number" id="arrival_${i}" min="0" value="0">
            </div>
            <div class="input-row">
                <label>Burst Time:</label>
                <input type="number" id="burst_${i}" min="1" value="1">
            </div>
            <div class="input-row">
                <label>Priority:</label>
                <input type="number" id="priority_${i}" min="1" value="1">
            </div>
        `;
        container.appendChild(card);
    }
}

function generateRandomInput() {
    const count = parseInt(document.getElementById('processCount').value);
    if (!count || count < 1 || count > 20) {
        alert('Please enter a valid number of processes (1-20)');
        return;
    }

    const container = document.getElementById('processInputs');
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const arrival = Math.floor(Math.random() * 10);
        const burst = Math.floor(Math.random() * 10) + 1;
        const priority = Math.floor(Math.random() * 5) + 1;

        const card = document.createElement('div');
        card.className = 'process-input-card';
        card.innerHTML = `
            <h4>Process ${i + 1}</h4>
            <div class="input-row">
                <label>Arrival Time:</label>
                <input type="number" id="arrival_${i}" min="0" value="${arrival}">
            </div>
            <div class="input-row">
                <label>Burst Time:</label>
                <input type="number" id="burst_${i}" min="1" value="${burst}">
            </div>
            <div class="input-row">
                <label>Priority:</label>
                <input type="number" id="priority_${i}" min="1" value="${priority}">
            </div>
        `;
        container.appendChild(card);
    }
}

function collectProcesses() {
    const container = document.getElementById('processInputs');
    if (!container.children.length) {
        alert('Please generate process inputs first!');
        return null;
    }

    processes = [];
    const count = container.children.length;

    for (let i = 0; i < count; i++) {
        const arrival = parseInt(document.getElementById(`arrival_${i}`).value);
        const burst = parseInt(document.getElementById(`burst_${i}`).value);
        const priority = parseInt(document.getElementById(`priority_${i}`).value);

        if (isNaN(arrival) || isNaN(burst) || isNaN(priority) || burst < 1) {
            alert(`Invalid input for Process ${i + 1}`);
            return null;
        }

        processes.push({
            pid: i + 1,
            arrival: arrival,
            burst: burst,
            priority: priority,
            remaining: burst,
            waiting: 0,
            turnaround: 0,
            response: 0,
            firstResponse: -1,
            finishTime: 0
        });
    }

    return processes;
}

function runScheduler(algorithm) {
    if (!collectProcesses()) return;

    QUANTUM = parseInt(document.getElementById('quantum').value) || 3;

    let result;
    let algoName;

    switch (algorithm) {
        case 'fcfs':
            algoName = 'First Come First Serve (FCFS)';
            result = fcfs();
            break;
        case 'sjf_np':
            algoName = 'Shortest Job First - Non-Preemptive';
            result = sjf_np();
            break;
        case 'sjf_p':
            algoName = 'Shortest Job First - Preemptive (SRTF)';
            result = sjf_p();
            break;
        case 'priority_np':
            algoName = 'Priority - Non-Preemptive';
            result = priority_np();
            break;
        case 'priority_p':
            algoName = 'Priority - Preemptive';
            result = priority_p();
            break;
        case 'rr':
            algoName = 'Round Robin (Quantum = ' + QUANTUM + ')';
            result = rr();
            break;
        default:
            alert('Invalid algorithm');
            return;
    }

    displayResults(result, algoName);
}

function fcfs() {
    let time = 0, completed = 0;
    let gantt = [];
    let procs = processes.map(p => ({ ...p, remaining: p.burst }));

    while (completed !== procs.length) {
        let id = -1;
        let earliest = Infinity;

        for (let i = 0; i < procs.length; i++) {
            if (procs[i].arrival <= time && procs[i].remaining > 0) {
                if (procs[i].arrival < earliest) {
                    earliest = procs[i].arrival;
                    id = i;
                }
            }
        }

        if (id === -1) {
            time++;
            continue;
        }

        if (procs[id].remaining === procs[id].burst) {
            procs[id].firstResponse = time;
        }

        time += procs[id].burst;
        procs[id].remaining = 0;
        procs[id].finishTime = time;
        gantt.push({ pid: procs[id].pid, duration: procs[id].burst, endTime: time });
        completed++;
    }

    return { processes: procs, gantt: gantt };
}

function sjf_np() {
    let time = 0, completed = 0;
    let gantt = [];
    let procs = processes.map(p => ({ ...p, remaining: p.burst }));

    while (completed !== procs.length) {
        let id = -1;
        let minBT = Infinity;

        for (let i = 0; i < procs.length; i++) {
            if (procs[i].arrival <= time && procs[i].remaining > 0) {
                if (procs[i].burst < minBT) {
                    minBT = procs[i].burst;
                    id = i;
                }
            }
        }

        if (id === -1) {
            time++;
            continue;
        }

        if (procs[id].remaining === procs[id].burst) {
            procs[id].firstResponse = time;
        }

        time += procs[id].burst;
        procs[id].remaining = 0;
        procs[id].finishTime = time;
        gantt.push({ pid: procs[id].pid, duration: procs[id].burst, endTime: time });
        completed++;
    }

    return { processes: procs, gantt: gantt };
}

function sjf_p() {
    let time = 0, completed = 0;
    let gantt = [];
    let procs = processes.map(p => ({ ...p, remaining: p.burst, firstResponse: -1 }));

    while (completed !== procs.length) {
        let id = -1;
        let minRT = Infinity;

        for (let i = 0; i < procs.length; i++) {
            if (procs[i].arrival <= time && procs[i].remaining > 0) {
                if (procs[i].remaining < minRT) {
                    minRT = procs[i].remaining;
                    id = i;
                }
            }
        }

        if (id === -1) {
            time++;
            continue;
        }

        if (procs[id].firstResponse === -1) {
            procs[id].firstResponse = time;
        }

        procs[id].remaining--;
        gantt.push({ pid: procs[id].pid, duration: 1, endTime: time + 1 });

        if (procs[id].remaining === 0) {
            completed++;
            procs[id].finishTime = time + 1;
        }

        time++;
    }

    return { processes: procs, gantt: gantt };
}

function priority_np() {
    let time = 0, completed = 0;
    let gantt = [];
    let procs = processes.map(p => ({ ...p, remaining: p.burst }));

    while (completed !== procs.length) {
        let id = -1;
        let highest = Infinity;

        for (let i = 0; i < procs.length; i++) {
            if (procs[i].arrival <= time && procs[i].remaining > 0) {
                if (procs[i].priority < highest) {
                    highest = procs[i].priority;
                    id = i;
                }
            }
        }

        if (id === -1) {
            time++;
            continue;
        }

        procs[id].firstResponse = time;
        time += procs[id].burst;
        procs[id].remaining = 0;
        procs[id].finishTime = time;
        gantt.push({ pid: procs[id].pid, duration: procs[id].burst, endTime: time });
        completed++;
    }

    return { processes: procs, gantt: gantt };
}

function priority_p() {
    let time = 0, completed = 0;
    let gantt = [];
    let procs = processes.map(p => ({ ...p, remaining: p.burst, firstResponse: -1 }));

    while (completed !== procs.length) {
        let id = -1;
        let highest = Infinity;

        for (let i = 0; i < procs.length; i++) {
            if (procs[i].arrival <= time && procs[i].remaining > 0) {
                if (procs[i].priority < highest) {
                    highest = procs[i].priority;
                    id = i;
                }
            }
        }

        if (id === -1) {
            time++;
            continue;
        }

        if (procs[id].firstResponse === -1) {
            procs[id].firstResponse = time;
        }

        procs[id].remaining--;
        gantt.push({ pid: procs[id].pid, duration: 1, endTime: time + 1 });

        if (procs[id].remaining === 0) {
            procs[id].finishTime = time + 1;
            completed++;
        }

        time++;
    }

    return { processes: procs, gantt: gantt };
}

function rr() {
    let time = 0, completed = 0;
    let gantt = [];
    let procs = processes.map(p => ({ ...p, remaining: p.burst, firstResponse: -1 }));

    while (completed !== procs.length) {
        let done = true;

        for (let i = 0; i < procs.length; i++) {
            if (procs[i].arrival <= time && procs[i].remaining > 0) {
                done = false;

                if (procs[i].firstResponse === -1) {
                    procs[i].firstResponse = time;
                }

                let exec = (procs[i].remaining >= QUANTUM) ? QUANTUM : procs[i].remaining;
                procs[i].remaining -= exec;
                
                gantt.push({ pid: procs[i].pid, duration: exec, endTime: time + exec });
                time += exec;

                if (procs[i].remaining === 0) {
                    procs[i].finishTime = time;
                    completed++;
                }
            }
        }

        if (done) time++;
    }

    return { processes: procs, gantt: gantt };
}

function displayResults(result, algoName) {
    document.getElementById('outputSection').style.display = 'block';
    document.getElementById('algorithmName').textContent = algoName;

    // Display Gantt Chart
    const ganttChart = document.getElementById('ganttChart');
    ganttChart.innerHTML = '';

    // Merge consecutive blocks of the same process
    let mergedGantt = [];
    for (let i = 0; i < result.gantt.length; i++) {
        if (mergedGantt.length === 0 || mergedGantt[mergedGantt.length - 1].pid !== result.gantt[i].pid) {
            mergedGantt.push({ ...result.gantt[i] });
        } else {
            mergedGantt[mergedGantt.length - 1].duration += result.gantt[i].duration;
            mergedGantt[mergedGantt.length - 1].endTime = result.gantt[i].endTime;
        }
    }

    mergedGantt.forEach((block, idx) => {
        const div = document.createElement('div');
        div.className = 'gantt-block';
        div.textContent = `P${block.pid}`;
        div.style.width = `${block.duration * 40}px`;
        div.style.backgroundColor = colors[(block.pid - 1) % colors.length];
        div.setAttribute('data-time', block.endTime);
        ganttChart.appendChild(div);
    });

    // Display results table
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';

    let totalWT = 0, totalTAT = 0;

    result.processes.forEach(p => {
        p.waiting = p.finishTime - p.arrival - p.burst;
        p.turnaround = p.finishTime - p.arrival;
        p.response = p.firstResponse - p.arrival;

        totalWT += p.waiting;
        totalTAT += p.turnaround;

        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${p.pid}</td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
            <td>${p.priority}</td>
            <td>${p.waiting}</td>
            <td>${p.turnaround}</td>
            <td>${p.response}</td>
        `;
    });

    // Display statistics
    document.getElementById('avgWT').textContent = (totalWT / result.processes.length).toFixed(2);
    document.getElementById('avgTAT').textContent = (totalTAT / result.processes.length).toFixed(2);

    // Scroll to results
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

// Initialize with manual input form
window.onload = () => {
    generateManualInput();
};
