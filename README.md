# TempusChatBot
 ### chat bot that interfaces with the tempus api for twitch commands that emulate a lot of the functionality found in a tempus server

# Setup Guide 
<h3> 
 1. Download the project <a href="https://github.com/Elandi-rj/TempusChatBot/releases/download/v.1.0.0/tempus-chat.7z">here</a> and unzip it anywhere <br>
 
 2. The options.json file is filled in with made up api keys and must be configured to work. Open <b>options.json</b> with any text editor and edit only the fields mentioned here<br>
 
 3. "password": change the key to your chosen twitch bot channel, which can be found <a href="https://twitchtokengenerator.com/">here</a> (choose bot token) and replace the string of letters and numbers<br>
 
 4. "youtubeApi": (Optional) To make the !swrvid command return a direct link you need a youtube data api. You can read about getting one <a href="https://developers.google.com/youtube/v3/getting-started">here</a> and put it in the youtubeApi. The command will still work without one but instead of a direct link, it will return a query link, so 1 extra click.
<br>If you don't want to bother, leave the key blank like so: "youtubeApi": "",
 
 5. "steamApi":,  can be found <a href="https://steamcommunity.com/dev/apikey">here</a>
 
 6. "alias": whatever nickname you want to show up as when the bot refers to your account, if it doesn't change you may need to find your entry inside nicknames.json and delete it

 7. "tempusId": this can found by going to <a href="https://tempus2.xyz/">tempus2.xyz</a> and typing your current steam name in the search field, after going to your tempus profile, look at the url and extract the number that comes after "xyz/players/", which can be entered into the tempusId field

 8. "twitchChannel": here you just type the exact name of your twitch channel, this is what the bot connects to

 9. "steamId64": go <a href="https://steamid.io/">here</a> and paste your steam profile link, enter the steamid64 that you find

 If everything has been configured correctly, you should be able to launch tempus-chat.exe
 </h3>
 
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
 !swrvid simplified
 tempuschat: https://www.youtube.com/watch?v=qW7vSAnxiUQ (ff73 on jump_simplified_rc1 02:52.349) 
 ```
 ```
!swrcvid simplified 1
 tempuschat: https://www.youtube.com/watch?v=EyvUgR3AtQg (riot on jump_beef course 1 0:12.149)
 ```
 ```
!swrbvid simply 1
 tempuschat: https://www.youtube.com/watch?v=aJNRxcxWLLg (nibs on jump_simply_v2 bonus 1 0:06.239)
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
 !swrb simply 1
 tempuschat: (Solly) Boshy is ranked 1 on jump_simply_v2 bonus 1 with time: 0:07.77 
 ```
 ```
 !swrc 4starters 3
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
 !swrvid mapName <br>
 !swrvid <br>
 !swrcvid mapName courseIndex <br>
 !swrcvid courseIndex <br>
 !sbtime bonusIndex <br>
 !sbtime mapName bonusIndex <br>
 !sbtime mapName bonusIndex rankIndex <br>
 !sbtime mapName bonusIndex playerName <br>
 !swrc mapName courseIndex <br>
 !swrb mapName bonusIndex <br>
 !sctime courseIndex <br>
 !sctime mapName courseIndex <br>
 !sctime mapName courseIndex rankIndex <br>
 !sctime mapName courseIndex playerName <br>
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
