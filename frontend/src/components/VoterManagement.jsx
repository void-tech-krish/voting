import React from 'react';

const VoterManagement = ({ users, handleUpdateUserStatus, handleDeleteUser }) => {
  return (
    <div>
      <h3>Registered Voters</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Has Voted</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.hasVoted ? 'Yes' : 'No'}</td>
              <td>{u.status}</td>
              <td>
                {u.status !== 'blocked' && <button className="btn-warning" onClick={() => handleUpdateUserStatus(u._id, 'blocked')}>Block</button>}
                {u.status === 'blocked' && <button className="btn-success" onClick={() => handleUpdateUserStatus(u._id, 'approved')}>Approve</button>}
                <button className="btn-danger" onClick={() => handleDeleteUser(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VoterManagement;
