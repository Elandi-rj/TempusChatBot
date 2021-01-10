# TempusChatBot
 chat bot that interfaces with the tempus api for twitch commands that emulate a lot of the functionality found in a tempus server

# Setup Guide 
 1. Download and install <a href="https://nodejs.org/en/">Node.js</a> <br>
 2. Download the project <a href="https://github.com/Elandi-rj/TempusChatBot/archive/master.zip">here</a> and unzip it anywhere <br>
 3. Open <b>options.js</b> with any text editor and replace <b>YourBotTwitchName</b> with the twitch channel name for the bot to use and don't get rid of the quotes here or anywhere else
 4. (Optional) To make the ssearch command return a direct link you need a youtube data api. You can read about getting one <a href="https://developers.google.com/youtube/v3/getting-started">here</a> and put it in the options file. The command will still work without one but instead of a direct link, it will return a query link, so 1 extra click.
 4. Replace <b>oauth:twitchAuthKey</b> with the key for your bot channel, which can be found <a href="https://twitchapps.com/tmi/">here</a> <br>
 5. You can place the bot in any channel you'd like by replacing elandi with your twitch channel name, it's also possible to run the bot in multiple channels at once 
 like this. <br> channels: ['elandi', 'boshytf', 'arvinge']
 6. Open <b>players.js</b> with a text editor and if your name and channel isn't on the list already, add a new entry (or edit one) following the first one as an example. <br><b>alias</b> can be any name/nickname's you want, <br><b>id</b> is your tempus id which you can either find in game on a tempus server or go to https://tempus.xyz/ and search for your profile, your id will be in the URL after players/ for example https://tempus.xyz/players/170674/overall this is my profile and the number is my id. <br>in <b>channel</b> type your twitch channel name
 7. Finally you can start the bot by running <b>start.bat</b>, and type <b>!update</b> in twitch with the bot on, it will take a few seconds to finish, any time tempus adds new maps you will need to run this command again. Bot should be fully functional now.
 
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
 !ssearch sketchy2<br>
 output: https://www.youtube.com/results?search_query=jump_sketchy2_rc1_zip+-+02:10.050 (Boshy) <br>
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
