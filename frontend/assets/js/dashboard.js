// Dashboard Module
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load dashboard stats
    const statsResponse = await API.getDashboardStats();
    const stats = statsResponse.data;

    // Update stats cards
    document.getElementById('totalAttachees').textContent = stats.totalAttachees || 0;
    document.getElementById('activeAttachees').textContent = stats.activeAttachees || 0;
    document.getElementById('pendingAttachees').textContent = stats.pendingAttachees || 0;
    document.getElementById('completedAttachees').textContent = stats.completedAttachees || 0;
    document.getElementById('totalSupervisors').textContent = stats.totalSupervisors || 0;
    document.getElementById('totalDepartments').textContent = stats.totalDepartments || 0;
    document.getElementById('overdueAttachees').textContent = stats.overdueAttachees || 0;

    // Load recent attachees
    const recentResponse = await API.getRecentAttachees();
    const recentAttachees = recentResponse.data;
    const tbody = document.getElementById('recentAttacheesBody');

    if (recentAttachees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No attachees registered yet</td></tr>';
    } else {
      tbody.innerHTML = recentAttachees.map(a => `
        <tr>
          <td>${a.firstName} ${a.lastName}</td>
          <td>${a.institution}</td>
          <td>${a.course}</td>
          <td>${a.department ? a.department.name : '-'}</td>
          <td>${a.supervisor ? a.supervisor.name : '-'}</td>
          <td><span class="badge badge-${a.status === 'active' ? 'success' : a.status === 'pending' ? 'warning' : a.status === 'completed' ? 'info' : 'danger'}">${a.status}</span></td>
          <td>${new Date(a.attachmentStartDate).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }

  } catch (error) {
    console.error('Dashboard load error:', error);
  }
});