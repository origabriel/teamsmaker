const PlayerManagementComponent = ({ 
  players, 
  addPlayer, 
  updatePlayer, 
  deletePlayer 
}) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingPlayer, setEditingPlayer] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: '',
    overallLevel: 3,
    attackLevel: 3,
    defenseLevel: 3,
    movementLevel: 3
  });
  const [validationError, setValidationError] = React.useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'name' ? value : parseInt(value, 10)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate player data
    const validation = PlayerManagement.validatePlayer(formData);
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }
    
    setValidationError('');
    
    if (editingPlayer) {
      updatePlayer({ ...formData, id: editingPlayer.id });
      setEditingPlayer(null);
    } else {
      addPlayer(formData);
    }
    
    resetForm();
  };

  const startEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      overallLevel: player.overallLevel,
      attackLevel: player.attackLevel,
      defenseLevel: player.defenseLevel,
      movementLevel: player.movementLevel
    });
    setIsAdding(true);
    setValidationError('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      overallLevel: 3,
      attackLevel: 3,
      defenseLevel: 3,
      movementLevel: 3
    });
    setIsAdding(false);
    setValidationError('');
  };

  const renderRatingInput = (label, name, value) => (
    <div className="mb-3">
      <label className="block mb-1">{label}</label>
      <div className="flex items-center">
        <span className="mr-2">1</span>
        <input
          type="range"
          name={name}
          min="1"
          max="5"
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="ml-2">5</span>
      </div>
      <div className="text-center mt-1">{value}</div>
    </div>
  );

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">ניהול שחקנים</h2>
      
      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full bg-green-500 text-white py-2 rounded mb-4"
        >
          הוסף שחקן חדש
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
          <div className="mb-3">
            <label className="block mb-1">שם</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          {renderRatingInput('רמה כללית', 'overallLevel', formData.overallLevel)}
          {renderRatingInput('רמה התקפית', 'attackLevel', formData.attackLevel)}
          {renderRatingInput('רמה הגנתית', 'defenseLevel', formData.defenseLevel)}
          {renderRatingInput('רמת תנועה', 'movementLevel', formData.movementLevel)}
          
          {validationError && (
            <div className="text-red-500 mb-3">{validationError}</div>
          )}
          
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button 
              type="submit" 
              className="flex-1 bg-blue-500 text-white py-2 rounded"
            >
              {editingPlayer ? 'עדכן' : 'הוסף'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-300 py-2 rounded"
            >
              ביטול
            </button>
          </div>
        </form>
      )}
      
      <div className="bg-white rounded shadow">
        {players.length === 0 ? (
          <p className="p-4 text-center text-gray-500">אין שחקנים. הוסף שחקנים כדי להתחיל.</p>
        ) : (
          <ul>
            {players.map(player => (
              <li key={player.id} className="border-b p-3 flex justify-between items-center">
                <div>
                  <div className="font-bold">{player.name}</div>
                  <div className="text-sm text-gray-600">
                    רמה: {player.overallLevel} | התקפה: {player.attackLevel} | 
                    הגנה: {player.defenseLevel} | תנועה: {player.movementLevel}
                  </div>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button 
                    onClick={() => startEdit(player)}
                    className="text-blue-500"
                  >
                    עריכה
                  </button>
                  <button 
                    onClick={() => deletePlayer(player.id)}
                    className="text-red-500"
                  >
                    מחיקה
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 