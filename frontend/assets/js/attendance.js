// Attachee Management Module
let currentPage = 1;
const limit = 10;

// Load attachees with filters
async function loadAttachees(page = 1) {
  currentPage = page;
  try {
    const params = { page, limit };
    const search = document.getElementById('searchInput')?.value;
    const status = document.getElementById('statusFilter')?.value;

    if (search) params.search = search;
    if (status) params.status = status;

    const response = await API.getAttachees(params);
    const { data, pagination } = response;

    const tbody = document.getElementById('attacheesBody');
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center">No attachees found</td></tr>';
      return;
    }

    // Get user role for conditional buttons
    const user = Auth.getUser();
    const isAdminOrHr = user && (user.role === 'admin' || user.role === 'hr');

    tbody.innerHTML = data.map(a => {
      const actions = [];
      actions.push(`<button class="btn btn-sm btn-secondary" onclick="viewAttachee('${a._id}')" title="View"><i class="fas fa-eye"></i></button>`);
      
      // Approve button for pending attachees
      if (a.status === 'pending' && isAdminOrHr) {
        actions.push(`<button class="btn btn-sm btn-success" onclick="approveAttachee('${a._id}')" title="Approve"><i class="fas fa-check"></i></button>`);
      }
      
      // Assign department button
      if (isAdminOrHr) {
        actions.push(`<button class="btn btn-sm btn-info" onclick="showAssignDept('${a._id}')" title="Assign Dept"><i class="fas fa-building"></i></button>`);
        actions.push(`<button class="btn btn-sm btn-primary" onclick="showAssignSup('${a._id}')" title="Assign Supervisor"><i class="fas fa-chalkboard-user"></i></button>`);
      }
      
      // Complete button for active attachees
      if (a.status === 'active' && isAdminOrHr) {
        actions.push(`<button class="btn btn-sm btn-warning" onclick="completeAttachee('${a._id}')" title="Mark Complete"><i class="fas fa-check-circle"></i></button>`);
      }
      
      actions.push(`<button class="btn btn-sm btn-danger" onclick="deleteAttachee('${a._id}')" title="Delete"><i class="fas fa-trash"></i></button>`);

      return `
      <tr>
        <td><a href="#" onclick="viewAttachee('${a._id}')">${a.firstName} ${a.lastName}</a></td>
        <td>${a.studentId}</td>
        <td>${a.institution}</td>
        <td>${a.course}</td>
        <td>${a.department ? a.department.name : '-'}</td>
        <td>${a.supervisor ? a.supervisor.name : '-'}</td>
        <td><span class="badge badge-${a.status === 'active' ? 'success' : a.status === 'pending' ? 'warning' : a.status === 'completed' ? 'info' : 'danger'}">${a.status}</span></td>
        <td>${new Date(a.attachmentStartDate).toLocaleDateString()}</td>
        <td class="actions-cell">${actions.join('')}</td>
      </tr>`;
    }).join('');

    // Update pagination
    const paginationDiv = document.getElementById('pagination');
    if (pagination && paginationDiv) {
      paginationDiv.innerHTML = `
        <span>Showing ${((pagination.page - 1) * pagination.limit) + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}</span>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-secondary" onclick="loadAttachees(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>Previous</button>
          <button class="btn btn-sm btn-secondary" onclick="loadAttachees(${pagination.page + 1})" ${pagination.page >= pagination.pages ? 'disabled' : ''}>Next</button>
        </div>
      `;
    }

  } catch (error) {
    console.error('Error loading attachees:', error);
    const tbody = document.getElementById('attacheesBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center">Error loading attachees</td></tr>';
  }
}

// Approve attachee (activate)
async function approveAttachee(id) {
  if (!confirm('Approve this attachee? They will be marked as active.')) return;
  try {
    await API.updateAttacheeStatus(id, 'active');
    alert('Attachee approved successfully!');
    loadAttachees(currentPage);
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Mark as completed
async function completeAttachee(id) {
  if (!confirm('Mark this attachee as completed?')) return;
  try {
    await API.updateAttacheeStatus(id, 'completed');
    alert('Attachee marked as completed!');
    loadAttachees(currentPage);
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Show assign department modal
async function showAssignDept(id) {
  try {
    const deptRes = await API.getDepartments();
    const depts = deptRes.data || [];
    const modalBody = document.getElementById('viewModalBody');
    modalBody.innerHTML = `
      <h4>Assign Department</h4>
      <div class="form-group">
        <label>Select Department</label>
        <select id="deptSelect" class="form-select">
          <option value="">Choose...</option>
          ${depts.map(d => `<option value="${d._id}">${d.name} (${d.code})</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary mt-1" onclick="assignDept('${id}')"><i class="fas fa-save"></i> Assign</button>
    `;
    openModal('viewModal');
  } catch(e) { alert(e.message); }
}

async function assignDept(id) {
  const dept = document.getElementById('deptSelect').value;
  if (!dept) { alert('Please select a department'); return; }
  try {
    await API.assignDepartment(id, dept);
    closeModal('viewModal');
    alert('Department assigned!');
    loadAttachees(currentPage);
  } catch(e) { alert(e.message); }
}

// Show assign supervisor modal
async function showAssignSup(id) {
  try {
    const supRes = await API.getSupervisors();
    const sups = supRes.data || [];
    const modalBody = document.getElementById('viewModalBody');
    modalBody.innerHTML = `
      <h4>Assign Supervisor</h4>
      <div class="form-group">
        <label>Select Supervisor</label>
        <select id="supSelect" class="form-select">
          <option value="">Choose...</option>
          ${sups.map(s => `<option value="${s._id}">${s.name} - ${s.department}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary mt-1" onclick="assignSup('${id}')"><i class="fas fa-save"></i> Assign</button>
    `;
    openModal('viewModal');
  } catch(e) { alert(e.message); }
}

async function assignSup(id) {
  const sup = document.getElementById('supSelect').value;
  if (!sup) { alert('Please select a supervisor'); return; }
  try {
    await API.assignSupervisor(id, sup);
    closeModal('viewModal');
    alert('Supervisor assigned!');
    loadAttachees(currentPage);
  } catch(e) { alert(e.message); }
}

// View attachee details
async function viewAttachee(id) {
  try {
    const response = await API.getAttachee(id);
    const a = response.data;

    const modalBody = document.getElementById('viewModalBody');
    modalBody.innerHTML = `
      <div class="mb-2">
        <h4>${a.firstName} ${a.middleName || ''} ${a.lastName}</h4>
        <p><strong>Student ID:</strong> ${a.studentId}</p>
        <p><strong>National ID:</strong> ${a.nationalId}</p>
        <p><strong>Email:</strong> ${a.email}</p>
        <p><strong>Phone:</strong> ${a.phone}</p>
      </div>
      <hr>
      <div class="mb-2">
        <h4>Institution Details</h4>
        <p><strong>Institution:</strong> ${a.institution}</p>
        <p><strong>Course:</strong> ${a.course}</p>
        <p><strong>Year of Study:</strong> ${a.yearOfStudy || 'N/A'}</p>
      </div>
      <hr>
      <div class="mb-2">
        <h4>Attachment Details</h4>
        <p><strong>Department:</strong> ${a.department ? a.department.name : 'Not assigned'}</p>
        <p><strong>Supervisor:</strong> ${a.supervisor ? a.supervisor.name : 'Not assigned'}</p>
        <p><strong>Start Date:</strong> ${new Date(a.attachmentStartDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(a.attachmentEndDate).toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${a.duration} weeks</p>
        <p><strong>Status:</strong> <span class="badge badge-${a.status === 'active' ? 'success' : a.status === 'pending' ? 'warning' : a.status === 'completed' ? 'info' : 'danger'}">${a.status}</span></p>
      </div>
    `;

    openModal('viewModal');
  } catch (error) {
    console.error('Error viewing attachee:', error);
    alert('Error loading attachee details');
  }
}

// Delete attachee
async function deleteAttachee(id) {
  if (!confirm('Are you sure you want to delete this attachee?')) return;
  try {
    await API.deleteAttachee(id);
    loadAttachees(currentPage);
  } catch (error) {
    alert('Error deleting attachee: ' + error.message);
  }
}

// Modal functions
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // Load attachees if on attachees page
  if (document.getElementById('attacheesBody')) {
    loadAttachees();
  }
});