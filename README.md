# TempusChatBot
 chat bot that interfaces with the tempus api for twitch commands

# CurrentCommands (replace s with d for demo commands)
 !playing playerName <br>
 !srank playerName <br>
 !srank rankIndex <br>
 !rank playerName <br>
 !rank rankIndex <br>
 !stime mapName rankIndex <br>
 !stime mapName playerName <br>
 !swr mapName <br>
 !m mapName <br>
 !m <br>
 !svid mapName <br>
 !sbtime mapName bonusIndex rankIndex  <br>
 !sbtime mapName bonusIndex playerName <br>
 !sbwr mapName bonusIndex<br>
 !scwr mapName courseIndex<br>
 !sctime mapName courseIndex rankIndex <br>
 !sctime mapName courseIndex playerName <br>
 !update (broadcaster only to update mapNames file any time new maps are added to tempus) <br>
 !tempuscommands <br>

# Examples
 !playing bwai <br>
 output: jump_storm_final by Mireal, Solly T5 | Demo T6 <br>
 !srank boshy <br>
 output: Boshy is ranked 1 (Solly) <br>
 !srank 2 <br>
 output: Steve is ranked 2 (Solly) <br>
 !stime 4starters 3 <br>
 output: (Solly) Shunix -tt is ranked 3 on jump_4starters_rc1 with time: 8:51.13 <br>
 !stime when steve <br>
 output: (Solly) steve is ranked 6/13 on jump_when_b2_fix with time: 2:48:47.50 <br>
 !swr vex <br>
 output: (Solly) Boshy is ranked 1 on jump_vex_final with time: 2:23.97 <br>
 !m simplified <br>
 output: jump_simplified_rc1 by Niirvash, Solly T4 | Demo T4 <br>
 !m <br>
 output: jump_simplified_rc1 by Niirvash, Solly T4 | Demo T4 <br>
 !svid simplified <br>
 output: (Solly) jump_simplified_rc1 https://www.youtube.com/watch?v=sWu2dGTDM-o <br>
 !sbtime when 3 2 <br>
 output: (Solly) Makly is ranked 2 on jump_when_b2_fix bonus 3 with time: 0:19.82 <br>
 !sbtime simply 1 steve <br>
 output: (Solly) steve is ranked 11/49 on jump_simply_v2 bonus 1 with time: 0:08.99 <br>
 !sbwr simply <br>
 output: (Solly) Boshy is ranked 1 on jump_simply_v2 bonus 1 with time: 0:07.77 <br>
 !scwr 4starters 3 <br>
 output: (Solly) flightreacts is the GOAT is ranked 1 on jump_4starters_rc1 course 3 with time: 0:53.41 <br>
 !sctime 4starters 5 steve <br>
 output: (Solly) steve is ranked 124/1295 on jump_4starters_rc1 course 5 with time: 2:55.85 <br>
 !sctime 4starters 5 3 <br>
 output: (Solly) Carter is ranked 3 on jump_4starters_rc1 course 5 with time: 1:35.42 <br>
