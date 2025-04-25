const TeamDisplayComponent = ({ teams, players }) => {
  const getPlayerById = (id) => players.find(p => p.id === id);
  
  const calculateTeamAverage = (team, property) => {
    if (!team.length) return 0;
    return team.reduce((sum, playerId) => {
      const player = getPlayerById(playerId);
      return sum + (player ? player[property] : 0);
    }, 0) / team.length;
  };
  
  const copyToClipboard = () => {
    const team1Text = teams.team1
      .map(id => getPlayerById(id)?.name || '')
      .join(', ');
      
    const team2Text = teams.team2
      .map(id => getPlayerById(id)?.name || '')
      .join(', ');
      
    const text = `קבוצה 1: ${team1Text}\n\nקבוצה 2: ${team2Text}`;
    
    navigator.clipboard.writeText(text)
      .then(() => alert('הקבוצות הועתקו ללוח'))
      .catch(err => console.error('שגיאה בהעתקה:', err));
  };
  
  const renderTeam = (teamName, teamIds, color) => {
    const averageOverall = calculateTeamAverage(teamIds, 'overallLevel').toFixed(1);
    const averageAttack = calculateTeamAverage(teamIds, 'attackLevel').toFixed(1);
    const averageDefense = calculateTeamAverage(teamIds, 'defenseLevel').toFixed(1);
    const averageMovement = calculateTeamAverage(teamIds, 'movementLevel').toFixed(1);
    
    return (
      <div className={`bg-${color}-50 p-4 rounded-lg shadow mb-4`}>
        <h3 className={`text-${color}-700 font-bold mb-2`}>{teamName}</h3>
        
        <div className="grid grid-cols-4 gap-2 mb-3 text-center text-sm">
          <div>
            <div className="font-bold">רמה</div>
            <div>{averageOverall}</div>
          </div>
          <div>
            <div className="font-bold">התקפה</div>
            <div>{averageAttack}</div>
          </div>
          <div>
            <div className="font-bold">הגנה</div>
            <div>{averageDefense}</div>
          </div>
          <div>
            <div className="font-bold">תנועה</div>
            <div>{averageMovement}</div>
          </div>
        </div>
        
        <ul className="space-y-2">
          {teamIds.map(playerId => {
            const player = getPlayerById(playerId);
            if (!player) return null;
            
            return (
              <li key={playerId} className="flex justify-between bg-white p-2 rounded">
                <span className="font-medium">{player.name}</span>
                <span className="text-gray-600 text-sm">
                  {player.overallLevel} | התק׳ {player.attackLevel} | הגנ׳ {player.defenseLevel} | תנ׳ {player.movementLevel}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">הקבוצות שנוצרו</h2>
      
      {renderTeam('קבוצה 1', teams.team1, 'blue')}
      {renderTeam('קבוצה 2', teams.team2, 'green')}
      
      <button 
        onClick={copyToClipboard}
        className="w-full bg-purple-500 text-white py-3 rounded font-bold"
      >
        העתק קבוצות לשיתוף
      </button>
    </div>
  );
}; 