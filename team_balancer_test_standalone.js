// Standalone Team Balancer Test Script

// Shuffle function (Fisher-Yates)
function shuffleArray(array) {
    const newArray = [...array]; // Create a copy
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

const TIER_RANGES = [
    { name: "Tier 1", min: 1.0, max: 1.7, index: 0 },
    { name: "Tier 2", min: 2.2, max: 2.6, index: 1 },
    { name: "Tier 3", min: 3.0, max: 3.9, index: 2 },
    { name: "Tier 4", min: 4.4, max: 5.6, index: 3 },
    { name: "Tier 5", min: 6.2, max: 7.0, index: 4 },
    { name: "Tier 6", min: 7.2, max: 7.4, index: 5 },
    { name: "Tier 7", min: 8.0, max: 9.0, index: 6 },
    { name: "Tier 8", min: 9.0, max: 10.0, index: 7 }
];

// The balanceTeams function (copied and adapted from index.html)
const balanceTeams = (playersToAssign, numberOfTeams) => {
  // console.log("STARTING NEW COMPREHENSIVE TEAM BALANCING");
  // console.log("Players to assign:", playersToAssign.map(p => `${p.name} (${p.rating})`));
  // console.log("Number of teams:", numberOfTeams);

  if (!playersToAssign || playersToAssign.length === 0) {
    console.error("No players to assign.");
    return { teams: Array(numberOfTeams).fill(null).map(() => []), teamsWithGoalkeeper: [] };
  }

  const MAX_TIER_6_PER_TEAM = 1;
  const BALANCE_THRESHOLD = 0.5; 

  let allPlayers = JSON.parse(JSON.stringify(playersToAssign)); 

  allPlayers.forEach(p => {
    p.rating = parseFloat(p.rating);
    p.randomSortFactor = Math.random(); 
    p.assignedToTeam = -1; 
    p.tierIndex = -1;

    for (let i = 0; i < TIER_RANGES.length; i++) {
      if (p.rating >= TIER_RANGES[i].min && p.rating <= TIER_RANGES[i].max) {
        p.tierIndex = TIER_RANGES[i].index;
        break;
      }
    }
    if (p.tierIndex === -1) {
        if (p.rating < 1.0) p.tierIndex = 0;
        else if (p.rating < 2.2) p.tierIndex = 0; 
        else if (p.rating < 3.0) p.tierIndex = 1; 
        else if (p.rating < 4.4) p.tierIndex = 2;
        else if (p.rating < 6.2) p.tierIndex = 3;
        else if (p.rating < 7.2) p.tierIndex = 4;
        else if (p.rating < 8.0) p.tierIndex = 5;
        else if (p.rating < 9.0) p.tierIndex = 6;
        else p.tierIndex = 7;
        // console.warn(`Player ${p.name} (${p.rating}) assigned to fallback Tier ${p.tierIndex + 1}`);
    }
  });

  allPlayers.sort((a, b) => {
    if (a.rating !== b.rating) return a.rating - b.rating;
    return a.randomSortFactor - b.randomSortFactor;
  });
  
  const playersByTier = Array(TIER_RANGES.length).fill(null).map(() => []);
  allPlayers.forEach(p => {
    if (p.tierIndex !== -1) {
      playersByTier[p.tierIndex].push(p);
    }
  });

  // console.log("Players classified by tier:");
  // playersByTier.forEach((tierPlayers, index) => {
  //   console.log(`  ${TIER_RANGES[index].name}: ${tierPlayers.map(p => `${p.name}(${p.rating})`).join(', ')}`);
  // });

  const totalPlayerCount = allPlayers.length;
  let teams = Array(numberOfTeams).fill(null).map((_, i) => ({
    id: i,
    playerIds: [],
    players: [],
    tierCounts: Array(TIER_RANGES.length).fill(0),
    totalRating: 0,
    targetSize: 0,
    hasTier1: false,
  }));

  let playersPerTeamIdeal = Math.floor(totalPlayerCount / numberOfTeams);
  let remainderPlayers = totalPlayerCount % numberOfTeams;
  
  if (playersPerTeamIdeal >= 5) {
    teams.forEach(t => t.targetSize = 5);
  } else if (playersPerTeamIdeal === 4) {
    teams.forEach((t, i) => {
      t.targetSize = (i < remainderPlayers) ? 5 : 4;
    });
  } else { 
    // console.warn("Potentially not enough players for 4 per team. Adjusting target sizes.");
    teams.forEach(t => t.targetSize = 4); 
    let playersNeededFor4s = numberOfTeams * 4;
    if (totalPlayerCount < playersNeededFor4s) {
        let tempPlayerIdx = 0;
        for(let i=0; i<numberOfTeams; ++i) {
            teams[i].targetSize = 0;
            for(let j=0; j<4 && tempPlayerIdx < totalPlayerCount; ++j) {
                 teams[i].targetSize++;
                 tempPlayerIdx++;
            }
        }
    } else { 
        let playersLeftFor5s = totalPlayerCount - playersNeededFor4s;
        for(let i=0; i < playersLeftFor5s && i < numberOfTeams; ++i) {
            teams[i].targetSize = 5;
        }
    }
  }
  
  teams.sort(() => Math.random() - 0.5);
  // console.log("Team target sizes:", teams.map(t => `Team${t.id}: ${t.targetSize}`).join(', '));

  const assignPlayer = (player, team) => {
    team.players.push(player);
    team.playerIds.push(player.id);
    team.tierCounts[player.tierIndex]++;
    team.totalRating += player.rating;
    if (player.tierIndex === 0) team.hasTier1 = true;
    player.assignedToTeam = team.id;
  };

  const removePlayer = (player, team) => {
    team.players = team.players.filter(p => p.id !== player.id);
    team.playerIds = team.playerIds.filter(id => id !== player.id);
    team.tierCounts[player.tierIndex]--;
    team.totalRating -= player.rating;
    if (player.tierIndex === 0) {
      team.hasTier1 = team.players.some(p => p.tierIndex === 0);
    }
    player.assignedToTeam = -1;
  };
  
  const canAddTier6 = (team) => team.tierCounts[5] < MAX_TIER_6_PER_TEAM;

  const checkTier78Conflict = (player, team) => {
    if (player.tierIndex === 7 && team.tierCounts[7] > 0) return true; 
    if (player.tierIndex === 7 && team.tierCounts[6] > 0) return true; 
    if (player.tierIndex === 6 && team.tierCounts[7] > 0) return true; 
    return false;
  };
  
  let tier1PlayersToDistribute = [...playersByTier[0]]; 
  tier1PlayersToDistribute.sort((a,b) => a.rating - b.rating); 

  const teamsEligibleForT1 = [...teams].sort((a,b) => a.players.length - b.players.length || a.totalRating - b.totalRating);
  
  for (const team of teamsEligibleForT1) {
    if (tier1PlayersToDistribute.length > 0 && !team.hasTier1 && team.players.length < team.targetSize) {
      assignPlayer(tier1PlayersToDistribute.shift(), team);
    }
  }
  
  playersByTier[0] = [...tier1PlayersToDistribute]; 
  
  let tempCombinedHighTiers = [...playersByTier[0], ...playersByTier[1]];
  tempCombinedHighTiers.sort((a,b) => a.rating - b.rating);
  playersByTier[1] = tempCombinedHighTiers; 
  playersByTier[0] = []; 

  for (let tierIdx = 1; tierIdx < TIER_RANGES.length; tierIdx++) { 
    const currentTierPlayers = playersByTier[tierIdx].filter(p => p.assignedToTeam === -1);
    currentTierPlayers.sort((a,b) => {
        if(a.rating !== b.rating) return a.rating - b.rating;
        return a.randomSortFactor - b.randomSortFactor;
    });

    currentTierPlayers.forEach(player => {
      let candidateTeams = teams.filter(t => t.players.length < t.targetSize);

      if (player.tierIndex === 5) { 
        candidateTeams = candidateTeams.filter(t => canAddTier6(t));
      } else if (player.tierIndex === 6 || player.tierIndex === 7) { 
        candidateTeams = candidateTeams.filter(t => !checkTier78Conflict(player, t));
      }

      if (candidateTeams.length === 0) {
        candidateTeams = teams.filter(t => t.players.length < t.targetSize);
        if (candidateTeams.length === 0) {
            // console.error(`CRITICAL: Player ${player.name} (Rating ${player.rating}, Original Tier ${player.tierIndex+1}) cannot be assigned. All teams full.`);
            return; 
        }
        // console.warn(`Player ${player.name} (Rating ${player.rating}, Original Tier ${player.tierIndex+1}) requires assignment to a team potentially violating a secondary rule.`);
      }
      
      candidateTeams.sort((a, b) => {
        // Priority 1: Compensation for T2/T3 players if a team lacks T1
        const isPlayerT2orT3 = player.tierIndex === TIER_RANGES[1].index || player.tierIndex === TIER_RANGES[2].index;
        if (isPlayerT2orT3) {
            if (a.hasTier1 !== b.hasTier1) {
                return a.hasTier1 ? 1 : -1; // Teams WITHOUT T1 get priority for these players
            }
        }

        // Priority 2: Evenly distribute low-tier players (Tiers 5-8)
        // This applies if the current player being assigned is from one of these low tiers.
        const lowTierIndices = [4, 5, 6, 7]; // Indices for Tiers 5, 6, 7, 8
        if (lowTierIndices.includes(player.tierIndex)) {
            const countOverallLowTierPlayers = (team) => 
                lowTierIndices.reduce((sum, tierIdx) => sum + team.tierCounts[tierIdx], 0);
            
            const aLowTierCount = countOverallLowTierPlayers(a);
            const bLowTierCount = countOverallLowTierPlayers(b);

            if (aLowTierCount !== bLowTierCount) {
                return aLowTierCount - bLowTierCount; // Assign to team with fewer *overall* low-tier (T5-T8) players
            }
        }

        // Priority 3: Teams with fewer players from the *current player's specific tier*.
        if (a.tierCounts[player.tierIndex] !== b.tierCounts[player.tierIndex]) {
          return a.tierCounts[player.tierIndex] - b.tierCounts[player.tierIndex];
        }
        
        // Priority 4: Balance by total team rating.
        if (a.totalRating !== b.totalRating) {
            return a.totalRating - b.totalRating; 
        }
        
        // Priority 5: Balance by number of players.
        if (a.players.length !== b.players.length) {
            return a.players.length - b.players.length; 
        }

        // Priority 6: Random for tie-breaking.
        return Math.random() - 0.5;
      });

      if (candidateTeams.length > 0) {
        assignPlayer(player, candidateTeams[0]);
      } else {
         // console.warn(`Could not assign ${player.name} (Rating ${player.rating}, Original Tier ${player.tierIndex+1}) after sorting. Player remains unassigned.`);
      }
    });
  }
  
  allPlayers.filter(p => p.assignedToTeam === -1).sort((a,b) => a.rating - b.rating).forEach(player => {
      let fallbackCandidateTeams = teams.filter(t => t.players.length < t.targetSize);
      if (player.tierIndex === 5) fallbackCandidateTeams = fallbackCandidateTeams.filter(t => canAddTier6(t));
      else if (player.tierIndex === 6 || player.tierIndex === 7) fallbackCandidateTeams = fallbackCandidateTeams.filter(t => !checkTier78Conflict(player, t));
      
      if (fallbackCandidateTeams.length > 0) {
          fallbackCandidateTeams.sort((a,b) => a.players.length - b.players.length || a.totalRating - b.totalRating);
          assignPlayer(player, fallbackCandidateTeams[0]);
          // console.log(`Fallback assigned ${player.name} (Rating ${player.rating}) to Team ${fallbackCandidateTeams[0].id}`);
      } else {
          // console.error(`!!! ${player.name} (Rating ${player.rating}, Original Tier ${player.tierIndex+1}) REMAINS UNASSIGNED after fallback. !!!`);
      }
  });

  // console.log("\n--- Initial Team Assignment Complete ---");
  // teams.forEach(t => {
  //   t.players.sort((a,b) => a.rating - b.rating); 
  //   console.log(`Team ${t.id} (Size: ${t.players.length}/${t.targetSize}, TargetRating(avg): ${(t.totalRating / (t.players.length || 1)).toFixed(2)}, HasT1: ${t.hasTier1}): ${t.players.map(p => `${p.name}(${p.rating.toFixed(1)},T${p.tierIndex+1})`).join(', ')}`);
  //   console.log(`  Tier Counts: ${t.tierCounts.map((c,i) => `T${TIER_RANGES[i].name.split(' ')[1]}:${c}`).join(' ')}`);
  // });

  const MAX_SWAP_ITERATIONS = 30 * numberOfTeams; 
  let totalSwapsMadeThisRun = 0;

  for (let iter = 0; iter < MAX_SWAP_ITERATIONS; iter++) {
    teams.sort((a, b) => (a.totalRating / (a.players.length || 1)) - (b.totalRating / (b.players.length || 1)));
    
    if (teams.length < 2 || teams[0].players.length === 0 || teams[teams.length-1].players.length === 0) break; 

    const weakestTeam = teams[0]; 
    const strongestTeam = teams[teams.length - 1]; 

    if (weakestTeam.id === strongestTeam.id) break; 

    const currentAvgRatingGap = (strongestTeam.totalRating / (strongestTeam.players.length || 1)) - (weakestTeam.totalRating / (weakestTeam.players.length || 1));
    
    if (Math.abs(currentAvgRatingGap) <= BALANCE_THRESHOLD) {
      break; 
    }

    let bestSwapFound = null;
    let maxRatingGapReduction = -Infinity; 

    for (let pStrongIdx = 0; pStrongIdx < strongestTeam.players.length; pStrongIdx++) {
      for (let pWeakIdx = 0; pWeakIdx < weakestTeam.players.length; pWeakIdx++) {
        const pFromStrongTeam = strongestTeam.players[pStrongIdx]; 
        const pFromWeakTeam = weakestTeam.players[pWeakIdx];   

        if (pFromStrongTeam.id === pFromWeakTeam.id) continue;
        if (pFromStrongTeam.rating <= pFromWeakTeam.rating) continue; 

        let simStrongTeamTierCounts = [...strongestTeam.tierCounts];
        simStrongTeamTierCounts[pFromStrongTeam.tierIndex]--;
        simStrongTeamTierCounts[pFromWeakTeam.tierIndex]++; 

        let simWeakTeamTierCounts = [...weakestTeam.tierCounts];
        simWeakTeamTierCounts[pFromWeakTeam.tierIndex]--;
        simWeakTeamTierCounts[pFromStrongTeam.tierIndex]++; 

        if (pFromStrongTeam.tierIndex === 0 && strongestTeam.tierCounts[0] === 1 && pFromWeakTeam.tierIndex !== 0) continue; 
        if (pFromWeakTeam.tierIndex === 0 && weakestTeam.tierCounts[0] === 1 && pFromStrongTeam.tierIndex !== 0) continue; 
        if (pFromWeakTeam.tierIndex === 0 && simStrongTeamTierCounts[0] > 1) continue; 
        if (pFromStrongTeam.tierIndex === 0 && simWeakTeamTierCounts[0] > 1) continue; 
        
        if (simStrongTeamTierCounts[5] > MAX_TIER_6_PER_TEAM || simWeakTeamTierCounts[5] > MAX_TIER_6_PER_TEAM) continue;
        
        if (checkTier78Conflict(pFromWeakTeam, {tierCounts: simStrongTeamTierCounts} )) continue;
        if (checkTier78Conflict(pFromStrongTeam, {tierCounts: simWeakTeamTierCounts} )) continue;
        
        const newStrongTeamRating = strongestTeam.totalRating - pFromStrongTeam.rating + pFromWeakTeam.rating;
        const newWeakTeamRating = weakestTeam.totalRating - pFromWeakTeam.rating + pFromStrongTeam.rating;
        
        const newStrongAvg = newStrongTeamRating / (strongestTeam.players.length || 1);
        const newWeakAvg = newWeakTeamRating / (weakestTeam.players.length || 1);
        const newGap = Math.abs(newStrongAvg - newWeakAvg); 

        const improvement = currentAvgRatingGap - newGap;

        if (improvement > maxRatingGapReduction) {
            maxRatingGapReduction = improvement;
            bestSwapFound = { pStrong: pFromStrongTeam, pWeak: pFromWeakTeam };
        }
      }
    }

    if (bestSwapFound && maxRatingGapReduction > 0.01) { 
      const { pStrong, pWeak } = bestSwapFound;
      
      removePlayer(pStrong, strongestTeam);
      removePlayer(pWeak, weakestTeam);
      assignPlayer(pStrong, weakestTeam); 
      assignPlayer(pWeak, strongestTeam); 
      
      totalSwapsMadeThisRun++;
    } else {
      break; 
    }
  }
  
  // if(totalSwapsMadeThisRun > 0) {
  //   console.log(`Made ${totalSwapsMadeThisRun} swaps during balancing.`);
  // } else {
  //   console.log("No beneficial swaps found or teams already within balance threshold.");
  // }

  let finalTeamsArray = [];
  let teamsWithGoalkeeper = [];
  
  teams.sort((a,b) => a.id - b.id);

  teams.forEach(team => {
    team.players.sort((a,b) => a.rating - b.rating); 
    finalTeamsArray.push(team.playerIds);
    if (team.players.length === 4) { 
      teamsWithGoalkeeper.push(team.id);
    }
  });
  
  const unassignedPlayers = allPlayers.filter(p => p.assignedToTeam === -1);
  if (unassignedPlayers.length > 0) {
      // console.error("CRITICAL: Unassigned players remain after all phases:", unassignedPlayers.map(p => `${p.name}(${p.rating})`));
  }
  const totalAssigned = teams.reduce((sum, team) => sum + team.players.length, 0);
  if (totalAssigned !== totalPlayerCount && totalPlayerCount > 0) { 
      // console.error(`Mismatch! Provided ${totalPlayerCount}, but assigned ${totalAssigned}`);
  }

  if (finalTeamsArray.some(team => team.length === 0) && totalPlayerCount > 0 && numberOfTeams > 0) {
    //  console.warn("Warning: Some teams are empty.");
  }
  return { teams: finalTeamsArray, teamsWithGoalkeeper, fullTeamData: teams };
};


// --- Mock Player Data (from football_players.json) ---
const allMockPlayers = [
    {"name":"יגאל ק.","id":1745531449611,"rating":1.0},
    {"name":"יאריק ק.","id":1745531551514,"rating":1.2},
    {"name":"אביחי ר.","id":1745531476229,"rating":1.4},
    {"name":"ארתור מ.ז","id":1745531961030,"rating":1.4},
    {"name":"קובי ב.","id":1745531786494,"rating":1.7},
    {"name":"דימה פ.","id":1745531321846,"rating":2.2},
    {"name":"נתי צ.","id":1745531358679,"rating":2.2},
    {"name":"מאריק ש.","id":1745531987093,"rating":2.6},
    {"name":"לירן ב.","id":1745531859381,"rating":3.0},
    {"name":"דנינו.","id":1745532916212,"rating":3.2},
    {"name":"בני ר.","id":1745531708969,"rating":3.6},
    {"name":"ויטלי ד.","id":1745531575551,"rating":3.9},
    {"name":"אביר ס.","id":1745532025971,"rating":4.4},
    {"name":"יאן ט.","id":1745532025111,"rating":4.8},
    {"name":"שיקו פ.","id":1745531629226,"rating":4.8},
    {"name":"זוהר ק.","id":1745531766994,"rating":5.6},
    {"name":"רן ר.","id":1745532008971,"rating":6.2},
    {"name":"מאור מ.","id":1745531743056,"rating":6.4},
    {"name":"אורי ג.","id":1745530816202,"rating":6.4},
    {"name":"יניב נ.","id":1745531899955,"rating":6.4},
    {"name":"שוריק ל.","id":1745531611527,"rating":7.0},
    {"name":"בני א.","id":1745531671819,"rating":7.2},
    {"name":"אריק ג.","id":1745531656604,"rating":7.4},
    {"name":"אלכס ש.","id":1745531836618,"rating":8.0},
    {"name":"דוד א.","id":1745531811979,"rating":8.2},
    {"name":"פלג.","id":1745532810022,"rating":8.4},
    {"name":"יעקב יאשקה.","id":1745531918158,"rating":10.0},
    {"name":"ארתור ג.","id":1745531934711,"rating":9.5}
];

// --- Test Case Runner ---
function runTestScenario(numTeams, numPlayersToSelect, mockPlayersPool) {
    console.log(`

--- SCENARIO: ${numTeams} teams - ${numPlayersToSelect} players ---`);
    if (numPlayersToSelect > mockPlayersPool.length) {
        console.error(`Error: Not enough mock players (available: ${mockPlayersPool.length}) to select ${numPlayersToSelect} for the scenario.`);
        return;
    }

    const selectedPlayersForScenario = shuffleArray(mockPlayersPool).slice(0, numPlayersToSelect);
    // console.log("Selected players for this run:", selectedPlayersForScenario.map(p => `${p.name} (${p.rating})`));

    const result = balanceTeams(selectedPlayersForScenario, numTeams);
    const { teams: finalTeamPlayerIds, fullTeamData } = result;

    console.log("\n--- FINAL TEAM DISTRIBUTION --- ");
    const teamAvgs = [];

    if (fullTeamData && Array.isArray(fullTeamData)) {
        fullTeamData.forEach(team => {
            const teamRatingSum = team.players.reduce((sum, p) => sum + p.rating, 0);
            const avgTeamRating = team.players.length > 0 ? (teamRatingSum / team.players.length) : 0;
            teamAvgs.push(avgTeamRating);
            const playerDetails = team.players.map(p => {
                const tier = TIER_RANGES.find(tr => tr.index === p.tierIndex);
                return `${p.name}(${p.rating.toFixed(1)}, T${tier ? tier.name.split(' ')[1] : 'N/A'})`;
            }).join(', ');

            console.log(`Team ${team.id} (Size: ${team.players.length}/${team.targetSize}, AvgRating: ${avgTeamRating.toFixed(2)}, HasT1: ${team.hasTier1})`);
            console.log(`  Players: ${playerDetails}`);
            console.log(`  TierCounts: ${team.tierCounts.map((c, i) => `T${i + 1}:${c}`).join(' ')}`);
        });
    } else {
         console.log("fullTeamData not available for detailed summary. Using finalTeamPlayerIds.");
         finalTeamPlayerIds.forEach((teamPlayerIds, teamIndex) => {
            const teamPlayers = teamPlayerIds.map(playerId => selectedPlayersForScenario.find(p => p.id === playerId));
            if (!teamPlayers.every(p => p)) {
                console.error(`Error: Could not find all player objects for Team ${teamIndex}. IDs: ${teamPlayerIds.join(',')}`);
                return;
            }
            const totalRating = teamPlayers.reduce((sum, p) => sum + p.rating, 0);
            const avgRating = teamPlayers.length > 0 ? (totalRating / teamPlayers.length).toFixed(2) : "0.00";
            teamAvgs.push(parseFloat(avgRating));
            console.log(`Team ${teamIndex}: Avg Rating: ${avgRating}`);
            console.log(`  Players: ${teamPlayers.map(p => `${p.name}(${p.rating.toFixed(1)})`).join(', ')}`);
        });
    }

    if (teamAvgs.length > 1) {
        const validAvgs = teamAvgs.filter(avg => !isNaN(avg) && avg > 0);
        if (validAvgs.length > 1) {
            const minAvg = Math.min(...validAvgs);
            const maxAvg = Math.max(...validAvgs);
            console.log(`
Overall Avg Rating Spread for this run: ${(maxAvg - minAvg).toFixed(2)} (Min: ${minAvg.toFixed(2)}, Max: ${maxAvg.toFixed(2)})`);
        } else if (validAvgs.length === 1) {
             console.log(`
Overall Avg Rating Spread: Only one team with valid avg rating: ${validAvgs[0].toFixed(2)}`);
        } else {
            console.log(`
Overall Avg Rating Spread: No valid team averages to compare.`);
        }
    }
    console.log("--- END SCENARIO ---");
}

// --- Run Test Scenarios ---
// You can uncomment console.logs inside balanceTeams if you need deep debugging for a specific run.

runTestScenario(3, 14, allMockPlayers); // Test 5
runTestScenario(4, 18, allMockPlayers); // Test 6
runTestScenario(4, 19, allMockPlayers); // Test 7

console.log("\n\nNote: Each run uses a random selection of players from the mock pool.");
console.log("The 'balanceTeams' function itself also has internal randomization for tie-breaking,");
console.log("so results for the same scenario might differ slightly between script executions, which is intended.");

/*
To run this script:
1. Save it as a .js file (e.g., team_balancer_test_standalone.js).
2. Open your terminal or command prompt.
3. Navigate to the directory where you saved the file.
4. Run the script using Node.js: node team_balancer_test_standalone.js
*/ 