# TempusChatBot
 chat bot that interfaces with the tempus api for twitch commands

# CurrentCommands
 !stime mapName index
 !dtime mapName index
 !stime mapName playerName
 !dtime mapName playerName
 !swr mapName
 !dwr mapName
 !m mapName
 !sbtime mapName index bonusIndex
 !dbtime mapName index bonusIndex
 !sbwr mapName
 !dbwr mapName
 !update (broadcaster only to update mapNames file any time new maps are added to tempus)

# Examples
 !stime 4starters 3
 output: (Solly) Shunix -tt is ranked 3 on jump_4starters_rc1 with time: 8:51.13
 !dtime when 1
 output: (Demo) Waldo is ranked 1 on jump_when_b2_fix with time: 4:49:28.76
 !stime when steve
 output: (Solly) steve is ranked 6/13 on jump_when_b2_fix with time: 2:48:47.50
 !swr vex
 output: (Solly) Boshy is ranked 1 on jump_vex_final with time: 2:23.97
 !dwr mireal
 output: (Demo) ok is ranked 1 on jump_mireal2_final with time: 4:34.50
 !m simplified
 output: jump_simplified_rc1 by Niirvash, Solly T4 | Demo T4
 !dbtime when 1 3
 output: (Demo) rawruns is ranked 1 on jump_when_b2_fix bonus 3 with time: 0:11.32
 !sbtime simply
 output: (Solly) Boshy is ranked 1 on jump_simply_v2 bonus 1 with time: 0:07.77
 !sbwr simply
 output: (Solly) Boshy is ranked 1 on jump_simply_v2 bonus 1 with time: 0:07.77
 !dbwr simply
 (Demo) cander is ranked 1 on jump_simply_v2 bonus 1 with time: 0:03.19