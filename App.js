const App = () => {
  const [view, setView] = React.useState('players'); // 'players', 'selection', 'teams'
  const [players, setPlayers] = React.useState([]);
  const [selectedPlayers, setSelectedPlayers] = React.useState([]);
  const [teams, setTeams] = React.useState({ team1: [], team2: [] });
  const [playersPerTeam, setPlayersPerTeam] = React.useState(5);

  // Load saved players from localStorage on component mount
  React.useEffect(() => {
    const loadedPlayers = PlayerManagement.loadPlayers();
    setPlayers(loadedPlayers);
  }, []);

  const handleAddPlayer = (player) => {
    const updatedPlayers = PlayerManagement.addPlayer(players, player);
    setPlayers(updatedPlayers);
  };

  const handleUpdatePlayer = (updatedPlayer) => {
    const updatedPlayers = PlayerManagement.updatePlayer(players, updatedPlayer);
    setPlayers(updatedPlayers);
  };

  const handleDeletePlayer = (playerId) => {
    const updatedPlayers = PlayerManagement.deletePlayer(players, playerId);
    setPlayers(updatedPlayers);
    
    // Also remove from selected players if needed
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    }
  };

  const togglePlayerSelection = (playerId) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const generateTeams = () => {
    // Get the selected players' full data
    const selectedPlayerObjects = players.filter(p => selectedPlayers.includes(p.id));
    
    // Use the balancer module to create balanced teams
    const balancedTeams = TeamBalancer.balanceTeams(selectedPlayerObjects, playersPerTeam);
    
    setTeams(balancedTeams);
    setView('teams');
  };

  return (
    <div className="font-sans">
      <header className="bg-blue-600 text-white p-4 rounded-t-lg mb-4">
        <h1 className="text-xl font-bold text-center">מ
</rewritten_file> 