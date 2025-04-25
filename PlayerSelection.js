const PlayerSelectionComponent = ({ 
  players, 
  selectedPlayers, 
  toggleSelection, 
  playersPerTeam, 
  setPlayersPerTeam,
  generateTeams 
}) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">בחירת שחקנים למשחק</h2>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <label className="block mb-2">שחקנים בכל קבוצה:</label>
        <div className="flex items-center">
          <button 
            onClick={() => playersPerTeam > 3 && setPlayersPerTeam(playersPerTeam - 1)}
            className="bg-gray-200 px-3 py-1 rounded"
            disabled={playersPerTeam <= 3}
          >
            -
          </button>
          <span className="mx-3">{playersPerTeam}</span>
          <button 
            onClick={() => setPlayersPerTeam(playersPerTeam + 1)}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            +
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded shadow mb-4">
        <div className="p-3 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <span>סמן את השחקנים המגיעים</span>
            <span>{selectedPlayers.length} נבחרו</span>
          </div>
        </div>
        
        {players.length === 0 ? (
          <p className="p-4 text-center text-gray-500">אין שחקנים. הוסף שחקנים במסך הקודם.</p>
        ) : (
          <ul>
            {players.map(player => (
              <li key={player.id} className="border-b last:border-0">
                <button 
                  onClick={() => toggleSelection(player.id)}
                  className={`w-full p-3 text-right flex justify-between items-center ${
                    selectedPlayers.includes(player.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div>
                    <div className="font-bold">{player.name}</div>
                    <div className="text-sm text-gray-600">
                      רמה: {player.overallLevel} | התקפה: {player.attackLevel} | 
                      הגנה: {player.defenseLevel} | תנועה: {player.movementLevel}
                    </div>
                  </div>
                  <div>
                    <span className={`inline-block w-6 h-6 rounded-full border ${
                      selectedPlayers.includes(player.id) 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPlayers.includes(player.id) && (
                        <span className="text-white flex justify-center items-center h-full">✓</span>
                      )}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <button 
        onClick={generateTeams}
        disabled={selectedPlayers.length < playersPerTeam * 2}
        className={`w-full py-3 rounded font-bold ${
          selectedPlayers.length < playersPerTeam * 2
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-500 text-white'
        }`}
      >
        צור קבוצות
      </button>
      
      {selectedPlayers.length < playersPerTeam * 2 && (
        <p className="text-red-500 text-center mt-2">
          נדרשים לפחות {playersPerTeam * 2} שחקנים ({playersPerTeam * 2 - selectedPlayers.length} נוספים)
        </p>
      )}
    </div>
  );
}; 