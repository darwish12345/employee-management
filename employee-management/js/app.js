// Employee Management System
let employees = [];
let currentView = 'dashboard';
let deptChart = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    updateDashboard();
    renderEmployees();
    renderDepartments();
});

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('employees');
    if (saved) {
        employees = JSON.parse(saved);
    } else {
        // Load sample data
        employees = getSampleData();
    }
}

// Sample data
function getSampleData() {
    return [
        { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', position: 'Senior Developer', salary: 85000, status: 'Active', phone: '555-0101', hireDate: '2022-01-15', address: '123 Main St' },
        { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing', position: 'Marketing Manager', salary: 75000, status: 'Active', phone: '555-0102', hireDate: '2021-06-10', address: '456 Oak Ave' },
        { id: 3, name: 'Bob Johnson', email: 'bob@company.com', department: 'Sales', position: 'Sales Rep', salary: 65000, status: 'Active', phone: '555-0103', hireDate: '2023-02-20', address: '789 Pine Rd' },
        { id: 4, name: 'Alice Brown', email: 'alice@company.com', department: 'HR', position: 'HR Specialist', salary: 60000, status: 'Inactive', phone: '555-0104', hireDate: '2022-08-05', address: '321 Elm St' }
    ];
}

// Save to localStorage
function saveData() {
    localStorage.setItem('employees', JSON.stringify(employees));
}

// Setup event listeners
function setupEventListeners() {
    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            switchView(view);
        });
    });
    
    // Employee form submission
    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
        employeeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addEmployee();
        });
    }
    
    // Search and filter
    const searchInput = document.getElementById('searchEmployee');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderEmployees());
    }
    
    const deptFilter = document.getElementById('deptFilter');
    if (deptFilter) {
        deptFilter.addEventListener('change', () => renderEmployees());
    }
    
    // Export data
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Import data
    const importBtn = document.getElementById('importData');
    if (importBtn) {
        importBtn.addEventListener('click', importData);
    }
    
    // Clear all data
    const clearBtn = document.getElementById('clearAllData');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
    }
    
    // Load sample data
    const sampleBtn = document.getElementById('loadSampleData');
    if (sampleBtn) {
        sampleBtn.addEventListener('click', loadSampleData);
    }
    
    // Save edit button
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditEmployee);
    }
}

// Switch views
function switchView(view) {
    currentView = view;
    
    // Update menu active state
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === view) {
            item.classList.add('active');
        }
    });
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        employees: 'Employee Management',
        add: 'Add New Employee',
        departments: 'Departments',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[view] || 'Dashboard';
    
    // Show selected view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${view}View`).classList.add('active');
    
    // Refresh data when needed
    if (view === 'dashboard') {
        updateDashboard();
    } else if (view === 'employees') {
        renderEmployees();
    } else if (view === 'departments') {
        renderDepartments();
    }
}

// Add employee
function addEmployee() {
    const newEmployee = {
        id: Date.now(),
        name: document.getElementById('empName').value,
        email: document.getElementById('empEmail').value,
        department: document.getElementById('empDept').value,
        position: document.getElementById('empPosition').value,
        salary: parseInt(document.getElementById('empSalary').value),
        status: 'Active',
        phone: document.getElementById('empPhone').value || '',
        hireDate: document.getElementById('empHireDate').value || new Date().toISOString().split('T')[0],
        address: document.getElementById('empAddress').value || ''
    };
    
    employees.push(newEmployee);
    saveData();
    updateDashboard();
    renderEmployees();
    renderDepartments();
    
    // Reset form
    document.getElementById('employeeForm').reset();
    
    // Show success message
    showToast('Employee added successfully!', 'success');
    
    // Switch to employees view
    switchView('employees');
}

// Render employees table
function renderEmployees() {
    const searchTerm = document.getElementById('searchEmployee')?.value.toLowerCase() || '';
    const deptFilter = document.getElementById('deptFilter')?.value || 'all';
    
    let filtered = [...employees];
    
    if (searchTerm) {
        filtered = filtered.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm) ||
            emp.email.toLowerCase().includes(searchTerm) ||
            emp.position.toLowerCase().includes(searchTerm)
        );
    }
    
    if (deptFilter !== 'all') {
        filtered = filtered.filter(emp => emp.department === deptFilter);
    }
    
    const tbody = document.getElementById('employeeTableBody');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No employees found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(emp => `
        <tr>
            <td>${emp.id}</td>
            <td><strong>${emp.name}</strong></td>
            <td>${emp.email}</td>
            <td>${emp.department}</td>
            <td>${emp.position}</td>
            <td>$${emp.salary.toLocaleString()}</td>
            <td><span class="status-badge status-${emp.status.toLowerCase()}">${emp.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" onclick="editEmployee(${emp.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteEmployee(${emp.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Edit employee
function editEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;
    
    document.getElementById('editEmpId').value = employee.id;
    document.getElementById('editName').value = employee.name;
    document.getElementById('editEmail').value = employee.email;
    document.getElementById('editDept').value = employee.department;
    document.getElementById('editPosition').value = employee.position;
    document.getElementById('editSalary').value = employee.salary;
    document.getElementById('editStatus').value = employee.status;
    document.getElementById('editPhone').value = employee.phone || '';
    
    const modal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
    modal.show();
}

// Save edit employee
function saveEditEmployee() {
    const id = parseInt(document.getElementById('editEmpId').value);
    const index = employees.findIndex(e => e.id === id);
    
    if (index !== -1) {
        employees[index] = {
            ...employees[index],
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            department: document.getElementById('editDept').value,
            position: document.getElementById('editPosition').value,
            salary: parseInt(document.getElementById('editSalary').value),
            status: document.getElementById('editStatus').value,
            phone: document.getElementById('editPhone').value
        };
        
        saveData();
        updateDashboard();
        renderEmployees();
        renderDepartments();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
        modal.hide();
        
        showToast('Employee updated successfully!', 'success');
    }
}

// Delete employee
function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        employees = employees.filter(e => e.id !== id);
        saveData();
        updateDashboard();
        renderEmployees();
        renderDepartments();
        showToast('Employee deleted successfully!', 'warning');
    }
}

// Update dashboard
function updateDashboard() {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'Active').length;
    const departments = [...new Set(employees.map(e => e.department))];
    const avgSalary = employees.length > 0 
        ? employees.reduce((sum, e) => sum + e.salary, 0) / employees.length 
        : 0;
    
    document.getElementById('totalEmployees').textContent = total;
    document.getElementById('activeEmployees').textContent = active;
    document.getElementById('totalDepartments').textContent = departments.length;
    document.getElementById('avgSalary').textContent = `$${Math.round(avgSalary).toLocaleString()}`;
    
    // Update chart
    updateDepartmentChart();
}

// Update department chart
function updateDepartmentChart() {
    const deptCount = {};
    employees.forEach(emp => {
        deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
    });
    
    const ctx = document.getElementById('deptChart').getContext('2d');
    
    if (deptChart) {
        deptChart.destroy();
    }
    
    deptChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(deptCount),
            datasets: [{
                data: Object.values(deptCount),
                backgroundColor: ['#667eea', '#11998e', '#f093fb', '#4facfe', '#f5576c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Render departments
function renderDepartments() {
    const deptCount = {};
    employees.forEach(emp => {
        deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
    });
    
    const colors = {
        Engineering: '#667eea',
        Marketing: '#11998e',
        Sales: '#f093fb',
        HR: '#4facfe',
        Finance: '#f5576c'
    };
    
    const container = document.getElementById('departmentCards');
    container.innerHTML = Object.keys(deptCount).map(dept => `
        <div class="col-md-4 mb-3">
            <div class="department-card" onclick="filterByDepartment('${dept}')">
                <div class="dept-icon" style="background: ${colors[dept] || '#667eea'}">
                    <i class="fas fa-building"></i>
                </div>
                <div class="dept-name">${dept}</div>
                <div class="dept-count">${deptCount[dept]} Employees</div>
            </div>
        </div>
    `).join('');
}

// Filter by department
function filterByDepartment(dept) {
    const deptFilter = document.getElementById('deptFilter');
    if (deptFilter) {
        deptFilter.value = dept;
        switchView('employees');
        renderEmployees();
    }
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(employees, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
}

// Import data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    employees = [...employees, ...imported];
                    saveData();
                    updateDashboard();
                    renderEmployees();
                    renderDepartments();
                    showToast(`Imported ${imported.length} employees!`, 'success');
                }
            } catch (error) {
                showToast('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Clear all data
function clearAllData() {
    if (confirm('⚠️ This will delete ALL employees. Are you sure?')) {
        employees = [];
        saveData();
        updateDashboard();
        renderEmployees();
        renderDepartments();
        showToast('All data cleared', 'warning');
    }
}

// Load sample data
function loadSampleData() {
    const sampleData = getSampleData();
    employees = [...employees, ...sampleData];
    saveData();
    updateDashboard();
    renderEmployees();
    renderDepartments();
    showToast(`Added ${sampleData.length} sample employees!`, 'success');
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2"></i>
        ${message}
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 12px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#11998e' : type === 'warning' ? '#f093fb' : '#667eea'};
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Make functions global
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.filterByDepartment = filterByDepartment;