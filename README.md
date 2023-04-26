# TempusChatBot
 chat bot that interfaces with the tempus api for twitch commands that emulate a lot of the functionality found in a tempus server

# Setup Guide 
 1. Download and install <a href="https://nodejs.org/en/">Node.js</a> <br>
 2. Download the project <a href="https://github.com/Elandi-rj/TempusChatBot/archive/master.zip">here</a> and unzip it anywhere <br>
 3. Open <b>options.js</b> with any text editor and replace <b>YourBotTwitchName</b> with the twitch channel name for the bot to use and don't get rid of the quotes here or anywhere else
 4. (Optional) To make the ssearch command return a direct link you need a youtube data api. You can read about getting one <a href="https://developers.google.com/youtube/v3/getting-started">here</a> and put it in the options file. The command will still work without one but instead of a direct link, it will return a query link, so 1 extra click.
 4. Replace <b>oauth:twitchAuthKey</b> with the key for your bot channel, which can be found <a href="https://twitchapps.com/tmi/">here</a> <br>
 5. Open <b>players.js</b> with a text editor and change the lines using the first example as a guide <br><b>alias</b> can be any name/nickname's you want, <br><b>id</b> is your tempus id which you can either find in game on a tempus server or go to https://tempus.xyz/ and search for your profile, your id will be in the URL after players/ for example https://tempus.xyz/players/170674/overall this is my profile and the number is my id. <br>in <b>channel</b> type your twitch channel name <br>You can run the bot in multiple channels by adding another entry to this list.
 6. Finally you can start the bot by running <b>start.bat</b>, and type <b>!update</b> in twitch with the bot on, it will take a few seconds to finish, any time tempus adds new maps you will need to run this command again. Bot should be fully functional now.
 
 # Command Examples
 ```
 !playing bwai
 tempuschat: jump_storm_final by Mireal, Solly T5 | Demo T6
 ```
 ```
 !srank boshy
 tempuschat: Boshy is ranked 1 (Solly)
 ```
 ```
 !srank 2
 output: Steve is ranked 2 (Solly)
 ```
 ```
 !stime         (this whill grab the time from the streamer without typing his name)
 tempuschat: (Solly) Steve is ranked 24/7815 on jump_beef with time: 1:16.74
 ``` 
 ```
 !stime 4starters 3 
 tempuschat: (Solly) Shunix -tt is ranked 3 on jump_4starters_rc1 with time: 8:51.13 
 ```
 ```
 !stime when steve 
 tempuschat: (Solly) steve is ranked 6/13 on jump_when_b2_fix with time: 2:48:47.50 
 ```
 ```
 !swr vex 
 tempuschat: (Solly) Boshy is ranked 1 on jump_vex_final with time: 2:23.97 
 ```
 ```
 !m simplified 
 tempuschat: jump_simplified_rc1 by Elandi, Solly T4 | Demo T4 
 ```
 ```
 !m 
 tempuschat: jump_simplified_rc1 by Elandi, Solly T4 | Demo T4 
 ```
 ```
 !svid simplified 
 tempuschat: (Solly) jump_simplified_rc1 https://www.youtube.com/watch?v=sWu2dGTDM-o 
 ```
 ```
 !ssearch simplified
 tempuschat: https://www.youtube.com/watch?v=qW7vSAnxiUQ (ff73 on jump_simplified_rc1 02:52.349) 
 ```
 ```
 !sbtime when 3 2 
 tempuschat: (Solly) Makly is ranked 2 on jump_when_b2_fix bonus 3 with time: 0:19.82 
 ```
 ```
 !sbtime simply 1 steve 
 tempuschat: (Solly) steve is ranked 11/49 on jump_simply_v2 bonus 1 with time: 0:08.99 
 ```
 ```
 !sbwr simply 
 tempuschat: (Solly) Boshy is ranked 1 on jump_simply_v2 bonus 1 with time: 0:07.77 
 ```
 ```
 !scwr 4starters 3
 tempuschat: (Solly) flightreacts is the GOAT is ranked 1 on jump_4starters_rc1 course 3 with time: 0:53.41 
 ```
 ```
 !sctime 4starters 5 steve 
 tempuschat: (Solly) steve is ranked 124/1295 on jump_4starters_rc1 course 5 with time: 2:55.85 
 ```
 ```
 !sctime 4starters 5 3 
 tempuschat: (Solly) Carter is ranked 3 on jump_4starters_rc1 course 5 with time: 1:35.42 
 ```
 ```
 !cc (!coursesearch) 4starters 
 tempuschat: https://www.youtube.com/watch?v=xKF4imgDEY8 (jump_4starters_rc1 course collection) 
 ```
 
# CurrentCommands (replace s with d for demo commands)
 !playing playerName <br>
 !srank playerName <br>
 !srank rankIndex <br>
 !rank playerName <br>
 !rank rankIndex <br>
 !stime <br>
 !stime playerName<br>
 !stime mapName <br>
 !stime mapName rankIndex <br>
 !stime mapName playerName <br>
 !swr mapName <br>
 !m mapName <br>
 !m <br>
 !svid mapName <br>
 !ssearch mapName <br>
 !sbtime bonusIndex <br>
 !sbtime mapName bonusIndex <br>
 !sbtime mapName bonusIndex rankIndex <br>
 !sbtime mapName bonusIndex playerName <br>
 !sbwr mapName bonusIndex <br>
 !scwr mapName courseIndex <br>
 !sctime courseIndex <br>
 !sctime mapName courseIndex <br>
 !sctime mapName courseIndex rankIndex <br>
 !sctime mapName courseIndex playerName <br>
 !cc (or !coursesearch) <br>
 !random <br>
 !random s <br>
 !update (streamer only to update the map list any time new maps are added to tempus) <br>
 !tempusenable (mod/streamer only) <br>
 !tempusdisable (mod/streamer only) <br>
 !tempuscommands <br>
 Ignore these vvv <br><br>
 !tierlist (streamer only) <br> 
 !tierduplicates map (streamer only) <br> 
 !tierremoveexact map (streamer only) <br> 
 !tieradd map class (streamer only) <br>
 !tierremove map (streamer only) <br>
 !massadd map (streamer only) <br>
