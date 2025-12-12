// ============================================================================
// GENRE INSIGHTS - All 12 genres
// Voice: Researcher/builder (not expert/authority)
// ============================================================================

interface GenreInsight {
  display: string
  challenge: string
  opportunity: string
  advice: string
}

const GENRE_INSIGHTS: Record<string, GenreInsight> = {
  
  'fps': {
    display: 'FPS',
    challenge: `alright so I spent way too much time analyzing FPS streams trying to figure out why so many just... fail. the answer is brutal: if you're not naturally gifted at aiming, FPS audiences will clock you immediately and leave. like there's no hiding mediocrity in a genre where every fight is a 1v1 skill check. pro players and ex-esports people dominate, and unless you're in that tier, most FPS channels hit zero.`,
    opportunity: `but here's what I found that actually works: niche tactical shooters. games like Squad, Insurgency, Ready or Not - these have real audiences. not huge audiences, but way less competition than Valorant or CS2. and more importantly? they reward TEAMWORK and COMMUNICATION over pure aim. so a smaller team of coordinated players beats randos every time, which means viewers see constant wins without needing to be a pro.`,
    advice: `if you're gonna stream FPS, pick tactical shooters, find a consistent team, and stream when they're available. don't try to compete with aim gods. find the games where aim is 30% and teamwork is 70%. and honestly? every successful FPS stream has friends or a squad. playing solo FPS where you're queuing random teams? viewers immediately peace out.`
  },

  'horror': {
    display: 'Horror',
    challenge: `okay this one's weird because horror seems like it should be perfect for small streamers. reaction content = free clips, right? genuine jump scares, authentic fear, people share that on Twitter... sounds perfect. except when I looked at actual horror stream data, there's this thing nobody talks about: most horror games are 3-6 hours long and then done. one and done. you beat Amnesia once, you're not replaying it. so a streamer plays one horror game, gets some clips, then what? move to the next game? now your channel is just horror game #47.`,
    opportunity: `the streamers making it work are doing something different. replayable horror - games with roguelike elements or multiplayer. Phasmophobia (multiplayer ghost hunting), Grounded (co-op survival horror), Risk of Rain 2 (roguelike chaos). every run is different, deaths are expected, viewers understand "one more run" mentality. or really long horror with personality requirements where you're genuinely experiencing it WITH your chat, not just screaming at jump scares for clips.`,
    advice: `the thing that kills horror streams: solo, new game every time, fake reactions. the thing that works: community horror (multiplayer), extended horror (long stories), or consistent horror (same game, challenge runs). and honestly? multiplayer horror specifically. watching one person scream at a game gets old. watching a group of friends try not to piss themselves while communicating? that's infinite content.`
  },

  'rpg': {
    display: 'RPG',
    challenge: `I looked at like 40 different RPG streams trying to understand why some build communities and others just... exist. the problem everyone faces is spoilers. you're streaming a story game and instantly you've got people who haven't played avoiding you (don't want spoilers), people who have played already (already know the story), people watching for their first time but not chatting (don't want to get spoiled). so the engagement dies. you're basically narrating to silent people.`,
    opportunity: `but here's what surprised me: RPG audiences are the MOST loyal of any genre. like if someone shows up to an RPG stream, they come back. consistently. every stream. the engagement metrics are insane. the key is picking the right RPGs - games with build variety like Baldur's Gate 3, Dark Souls, Path of Exile where your playstyle matters. viewers get invested in YOUR specific build/approach, not just the story. or indie RPGs that are actually short - 10-20 hours, not 100.`,
    advice: `avoid 60-hour JRPGs where you're stuck in one game for like 4 months. your audience gets bored waiting for you to finish. and here's the thing: RPG viewers WANT the story experience with you. don't skip dialogue, don't rush cutscenes. they're there for the journey, not speedruns. lean into that. have actual reactions, discuss the story, let them experience it with you instead of narrating passively.`
  },

  'battle-royale': {
    display: 'Battle Royale',
    challenge: `BR games look incredible to stream. constant action, natural drama, built-in tension. except when I actually tracked BR streams, there's this brutal pattern: if you're not placing top 3 and getting kills, it's... hard to watch. like watching someone loot buildings for 10 minutes then get sniped in the first fight? that's not compelling content. and the saturated ones (Fortnite, Warzone) are so dominated by skilled players that new streamers just drown.`,
    opportunity: `but here's what works: consistency beats skill for BR. I tracked smaller BRs with less competition and the data shows that people care way more about "streamer shows up same time every day" than "streamer gets 10 kills a game." why? because BR games are short cycles. 5-20 minutes per game. viewers can tune in for a quick session, hang out, clip moments, then peace out. it's less commitment than other games.`,
    advice: `the other thing: BR streamers who engage chat between games actually build audiences. the downtime between matches is when personality shows. if you're silent while waiting for next match, people leave. but if you're joking with chat, talking about past plays, trash talking... people stick around. also BRs are insane for clips. last-circle drama, clutch moments, funny fails. clip it, post it, drive traffic back.`
  },

  'moba': {
    display: 'MOBA',
    challenge: `MOBA viewers are hardcore. like genuinely some of the most engaged audiences in gaming. also genuinely some of the most toxic lol. and here's the thing that kills small streamer MOBA channels: skill gatekeep is REAL. League and Dota audiences expect diamond/immortal minimum. if you're hardstuck plat or gold, viewers will just... leave immediately. no chat, no follow, just gone. they can smell elo fraud a mile away.`,
    opportunity: `I spent a lot of time in MOBA communities and there's basically a tier system - Challenger gets thousands, Diamond+ gets hundreds, Plat-Gold gets tens, below that basically invisible. it's brutal. but here's where the opportunity actually is: alternative MOBAs. Heroes of the Storm, Smite, even older games like Hon have communities that still exist. and they're actually looking for streamers. like people genuinely want to find creators for their game and there's barely anyone streaming.`,
    advice: `the audiences are smaller but they're WAY less toxic. and if you're a decent player in an alternative MOBA, you can actually build something. also: be honest about your rank. don't hide it, don't pretend. MOBA viewers will call you out instantly if you're lying. pick a role, master it, and actually explain your decisions on stream. don't just play - think out loud. MOBA audiences want to learn from you.`
  },

  'strategy': {
    display: 'Strategy',
    challenge: `strategy games are interesting because they seem niche, which they are, but the data on viewer loyalty is actually insane. I looked at turn-based tactics and 4X games and found something weird: basically zero competition. like categories with hundreds of viewers and single-digit streamers. that ratio doesn't exist anywhere else. why? because most gaming streamers think strategy is boring. fast-paced action is "real content." strategy is too slow, too methodical, too brain-heavy.`,
    opportunity: `but the people who DO watch strategy? they're ride or die. loyal, engaged, chatting constantly. small communities but tight communities. the thing is you actually have to know what you're doing. you can't fake it in strategy games. viewers are analyzing your plays, seeing your mistakes, thinking about what you should have done differently. games to look at: any turn-based tactics (Slay the Spire, Tactics Ogre, Fire Emblem), 4X games (Civilization, Crusader Kings, Stellaris), even roguelike deck builders.`,
    advice: `the best strategy streamers literally think out loud. they're not executing perfect plays silently - they're saying "here's my gameplan, here's why I'm doing this, here's what could go wrong." viewers eat that up because they're learning while watching. also important: stream when you're mentally fresh. strategy streams are taxing. if you're tired or fried, it shows immediately. people want to see good decision-making.`
  },

  'survival': {
    display: 'Survival',
    challenge: `survival games have this weird problem that nobody admits: early death ends your stream. like you spend 20 minutes building, looting, establishing, then one mistake and... stream's over. or you get unlucky. that's not guaranteed content. plus viewers get frustrated watching survival streamers make obviously dumb decisions. "why didn't you build shelter?" the engagement becomes negative.`,
    opportunity: `BUT - and this is the thing that surprised me - survival audiences are insanely loyal. like people come back specifically for YOUR streams. if you're actually competent and entertaining, they follow you religiously. the unlock is multiplayer. solo survival is a slog. but multiplayer survival? that's chaos. you've got group dynamics, resource competition, betrayals, funny moments. Games like Rust, ARK, Valheim co-op - watching a group navigate survival is way more interesting than watching one person solo.`,
    advice: `the other thing: players who take calculated risks beat players who never die. viewers WANT drama. they want to see you in danger, making tough calls, narrowly surviving. boring survival (hiding in a base all stream) is actually boring. and if you're playing multiplayer, lean into the group interactions. that's your actual content - not whether you survive, but the relationships, arguments, funny moments that happen along the way.`
  },

  'indie': {
    display: 'Indie',
    challenge: `indie games seem like they're built for small streamers right? literally zero competition in most categories, plus dev communities. except here's the problem: there are like 5000 indie games released per year. most are completely unplayable. so how do you know which ones to stream? I looked at successful indie streamers and the pattern is clear: they're picky as hell. they're not streaming every trending indie game. they're curating. watching reviews, watching clips, making sure the game is actually good before they touch it.`,
    opportunity: `because streaming a mediocre game to zero people isn't content - it's just wasting time. but here's where it gets interesting: indie dev communities are actually responsive. if you stream a good indie game, engage with the dev, tweet about it, show you care... developers will promote you. for free. it's word-of-mouth marketing that actually works. the unlock is finding genuinely good indie games and becoming the person who discovered them for your audience.`,
    advice: `you're not competing against other streamers - you're competing with the game's visibility. make the game visible, people show up. also: indie audiences tend to be really engaged and cool. the people watching indie games are there specifically because they care about indie games. you build real relationships. so the strategy: be intentional about what you stream. look at reviews, watch gameplay, make sure it's actually good. then engage with the community and dev. tweet about it, tag the devs, get involved.`
  },

  'mmo': {
    display: 'MMO',
    challenge: `MMOs have this brutal gatekeep problem that nobody talks about. WoW and FF14 are so dominant that if you're a new streamer in those games, you're invisible. established players, guilds, streamers already own the space. the barrier to entry is insane - you need to be known AND good AND entertaining just to get noticed.`,
    opportunity: `but here's what I found: newer MMOs and lesser-known ones have massive communities looking for streamers. like people actively searching "is there a streamer for this game?" and finding nothing. Games that should have way more streamer presence: Eso, SWTOR, GW2, even some F2P MMOs. active communities, engaged players, basically zero streamer representation. the unlock is commitment. pick ONE MMO and commit. don't bounce around.`,
    advice: `build a guild, create community events, get people invested in your specific journey. these audiences want to feel part of something, not watch a streamer sample different games. also: stream during off-peak hours for your game. your competition is the actual game's population. if you stream during primetime, you're competing with everyone who's just playing instead of watching. but 2 AM? 6 AM? you're the only option. the loyalty is insane once you build it though.`
  },

  'simulation': {
    display: 'Simulation',
    challenge: `okay this one surprised me. everyone says sim games are boring to stream. farming simulator? euro truck? who watches that? ...turns out a LOT of people watch that. I looked at like 50 sim game categories and the viewer retention is actually insane. people don't click away. they just... hang out. for hours. it's background content - people have you on while they work or eat or whatever.`,
    opportunity: `you're not competing for attention, you're providing vibes. and here's the thing stream coaches won't tell you: sim games have almost ZERO competition. like I found categories with 500+ viewers and literally 8 streamers. that ratio is unheard of in any other genre. games to look at: PowerWash Simulator (seriously), House Flipper, any of the Truck Simulators, Stardew, even weird niche stuff like PC Building Simulator has audiences.`,
    advice: `the trick with sims is consistency over everything else. same schedule, same game, same vibe. these viewers want reliability. they're not looking for hype energy - they want chill. if that's not you, don't force it. but if you're naturally a calm streamer who likes methodical gameplay? sim games are literally your market and nobody's competing for it. one warning: don't try to make sims exciting. that's the trap. embrace the slow pace. the audience is there FOR the slow pace.`
  },

  'action': {
    display: 'Action',
    challenge: `look, I'm just gonna say it - most action game streams are mid. like genuinely unwatchable mid. and it's not because action games are bad, it's because there's this weird middle ground where you're not good enough to be impressive but not bad enough to be funny. spent way too long watching action streams trying to figure out what works. turns out it's basically two paths - either you're actually cracked or you're genuinely entertaining when you fail. the middle is where streams go to die. harsh but true.`,
    opportunity: `here's what the numbers say though - games like Hades, Dead Cells, Sifu have way better ratios than you'd expect. roguelike action specifically. why? because every run is different, deaths are expected, and there's always "one more run" energy that keeps viewers around. if you're streaming action, pick something with replayability. one-and-done action games (beat it once, never touch it again) are content deserts.`,
    advice: `and honestly? if you're gonna die a lot, lean into it. "I am bad at video games" is a more honest brand than pretending you're good. so pick either be really good at action, play games with great stories, or embrace being bad at it. don't pick games where skill is literally everything if you don't have the skill. people watch for personality + gameplay, not just gameplay.`
  },

  'sports': {
    display: 'Sports',
    challenge: `I'll be honest - sports games are probably the hardest genre to crack as a small streamer. and not for the reason you'd think. it's not skill. it's that sports game viewers would rather PLAY than watch. like... why watch someone else's FIFA ultimate team when you could be grinding yours? the value proposition is weird.`,
    opportunity: `but there's a hack that actually works: narrative. franchise modes, career modes, rebuild challenges - anything with a STORY. "can I take the worst team in the league to a championship" is watchable. random exhibition matches are not. the other thing that works? retro sports games have cult audiences. NCAA Football 14 has a whole community of people who refuse to move on. old wrestling games. NBA Street. these communities are small but DEDICATED and they have basically zero streamers serving them.`,
    advice: `if you're gonna stream modern sports games (madden, fifa, nba 2k), you need a hook: competitive ranked grind with commentary, challenge runs with weird rules, or community leagues where viewers play against you. just playing the game isn't enough. the game isn't the content - YOU are the content, and the game is the backdrop. more true for sports than any other genre honestly. and look... if you actually know the sport? like REALLY know it - talk about it. break down plays, explain strategy, react to real-life games. sports knowledge is your differentiator.`
  }

}

export default GENRE_INSIGHTS
