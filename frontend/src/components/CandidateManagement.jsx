import React from 'react';

const CandidateManagement = ({ candidates, newCandidate, setNewCandidate, handleAddCandidate, handleDeleteCandidate }) => {
  return (
    <div>
      <h3>Manage Candidates</h3>
      <form onSubmit={handleAddCandidate} className="admin-form">
        <input 
          type="text" 
          placeholder="Name" 
          value={newCandidate.name} 
          onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} 
          required 
        />
        <input 
          type="text" 
          placeholder="Party" 
          value={newCandidate.party} 
          onChange={e => setNewCandidate({...newCandidate, party: e.target.value})} 
          required 
        />
        <textarea 
          placeholder="Description" 
          value={newCandidate.description} 
          onChange={e => setNewCandidate({...newCandidate, description: e.target.value})} 
          required 
        />
        <button type="submit" className="btn-primary">Add Candidate</button>
      </form>
      <table className="admin-table mt-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Party</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.party}</td>
              <td>
                <button className="btn-danger" onClick={() => handleDeleteCandidate(c._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateManagement;
