//if "odds" are not specified, they are assumed to be uniform (e.g. [1, 1, 1, 1] for 4 options)
//if "state" is specified and equals "OFF", then this category will be turned off by default

//"conditions" mean that this category will be present only if everything specified is true
//it can only feature previous categories, since they are selected one-by-one from top to bottom
//multiple conditions mean "AND", i.e. every single one of them must be true
//multiple values inside one condition mean "OR", i.e. this category's selection must be this or this
//if "type": "negative" added to a condition, then it turns into "everything but these"

//"multiple" means that this category will be selected from 1 to "max" times
//(or from 0 to "max" times if "zero": "YES", i.e. maybe not select at all)
//where the number of times is also decided randomly based on their own "odds"
//(they work the same way)
//by default, every value can be selected only once (i.e. no duplicates),
//to change this, add "same": "YES" inside "multiple"

//"arts" are images that will be displayed on the page when that game is selected
//they are for aesthetic purposes only and have no effect on the selection process
//they are displayed in random order, as many as can fit
//"primary" will appear to the left (or at the top for smaller screens)
//"secondary" will appear to the right (and will be hidden for smaller screens)
//one or both can be empty
//all paths should be relative to the "arts" subfolder
//you should also specify their display sizes in px (recommended values are between 100 and 200)
//- "primary-width": for primary arts when they are on the left
//- "primary-height": for primary arts when they are at the top
//- "secondary-width": for secondary arts

//"preselected": "YES" is for a game that you want to be selected first, when the page loads

DATA = [
{
	"game": "Bleed 2",
	"preselected": "YES",
	"lists": [
	{
		"category": "Character",
		"options" : ["Wryn", "Rival", "Clawed Girl", "White", "Valentine", "Plucky"],
		"odds": [3, 3, 1, 1, 1, 1],
	},
	{
		"category": "Difficulty",
		"options": ["Easy", "Normal", "Hard", "Very Hard"],
		"odds": [1, 4, 3, 2],
	},
	{
		"category": "Mode",
		"options": ["Story", "Arcade", "Challenge", "Endless"],
		"odds": [2, 2, 1, 1],
	},
	{
		"category": "Mutator",
		"options": ["Death Bullets", "Tiny Bullets", "Unreflectable", "Weightless", "Too Hard"],
		"multiple": { "max": 3, "zero": "YES", "odds": [25, 9, 3, 1] },
	},
	{
		"category": "Level",
		"conditions": { "Mode": "Story" },
		"options": ["1", "2", "3", "4", "5", "6", "7"],
		"state": "OFF",
	},
	{
		"category": "Arcade Mode",
		"conditions": [{ "Character": ["Wryn", "Rival"] }, { "Mode": "Arcade" }],
		"options": ["New Game", "Freestyle"],
	},
	{
		"category": "Weapon",
		"conditions": [{ "Character": ["Wryn", "Rival"] }, { "Arcade Mode": "New Game", "type": "negative" }],
		"options": ["Katana/Pistols", "Pistols", "Katana", "Rocket Launcher", "Laser Rifle", "Chainsaw", "White"],
		"multiple": { "max": 4, "zero": "YES", "odds": [10, 3, 4, 2, 1] },
	},
	{
		"category": "Air-Dodge",
		"conditions": [{ "Character": ["Wryn", "Rival"] }, { "Arcade Mode": "New Game", "type": "negative" }],
		"options": ["Classic", "Flying Kick", "Teleport", "Energy Blast"],
		"multiple": { "max": 2, "zero": "YES", "odds": [8, 3, 1] },
	},
	{
		"category": "Boss",
		"conditions": { "Mode": "Challenge" },
		"options": ["Random", "Blast Jumper", "Kitty Chopper", "Red Sprite", "Ninja", "Chaff Spammer",
					"Robo-Guppy", "Robo-Gibby+Stu", "Robo-White", "Robo-Bunny", "Anti-Batallion",
					"Valentine A", "Valentine B", "Valentine C", "Mantis Core Mk-II", "Whale Core", "Rival"],
		"multiple": { "max": 3, "odds": [1, 2, 2], "same": "YES" },
	},
	{
		"category": "Arena",
		"conditions": { "Mode": "Challenge" },
		"options": ["Virtual", "City", "Highway", "Lava", "Launch", "Warship", "Stadium", "Security"],
	},
	],
	"extras-state": "ON",
	"extras": [
	{
		"name": "Be Awesome Instead",
		"description": "Get S rank or above",
		"probability": 5,
	},
	{
		"name": "Purple Perfection",
		"description": "Get SSS rank",
		"probability": 1,
	},
	{
		"name": "Time Police",
		"description": "Do not use slo-mo",
		"conditions": { "Character": "Valentine", "type": "negative" },
		"probability": 2,
	},
	{
		"name": "Psychological Warfare",
		"description": "Taunt every boss at least 3 times",
		"probability": 5,
	},
	{
		"name": "Heartless",
		"description": "Skip at least 2 hearts",
		"conditions": { "Mode": "Arcade" },
		"probability": 5,
	},
	{
		"name": "Shooty-go-round",
		"description": "Switch to your next weapon whenever a new boss health bar appears, thus cycling through them all",
		"conditions": [{ "Character": ["Wryn", "Rival"] }, { "Arcade Mode": "New Game", "type": "negative" }, { "Mode": "Challenge", "type": "negative" }],
		"probability": 5,
	},
	{
		"name": "Flashy Finish",
		"description": "Finish off every possible boss by reflecting its glowing attack",
		"conditions": { "Character": ["White", "Valentine"], "type": "negative" },
		"probability": 5,
	},
	{
		"name": "Karma Claws",
		"description": "Kill everyone by reflecting attacks as much as you can",
		"conditions": { "Character": "Clawed Girl" },
		"probability": 5,
	},
	{
		"name": "You May Fire When Ready",
		"description": "Use only laser as much as you can",
		"conditions": { "Character": "Valentine" },
		"probability": 5,
	},
	{
		"name": "Finally Some Platforming",
		"description": "Stay in the air as much as you can",
		"conditions": { "Character": "Plucky" },
		"probability": 5,
	},
	],
	"arts": {
		"primary-width": 110,
		"primary-height": 170,
		"secondary-width": 130,
		"primary": [
			"bleed2/characters/wryn.png",
			"bleed2/characters/wryn_alt.png",
			"bleed2/characters/rival.png",
			"bleed2/characters/clawedgirl.png",
			"bleed2/characters/clawedgirl_alt.png",
			"bleed2/characters/white.png",
			"bleed2/characters/white_alt.png",
			"bleed2/characters/valentine.png",
			"bleed2/characters/valentine_alt.png",
			"bleed2/characters/plucky.png",
			"bleed2/characters/plucky_alt.png",
		],
		"secondary": [
			"bleed2/enemies/antibattalion.png",
			"bleed2/enemies/blast_jumper.png",
			"bleed2/enemies/cats.png",
			"bleed2/enemies/chaff_spammer.png",
			"bleed2/enemies/crawling_core.png",
			"bleed2/enemies/drones.png",
			"bleed2/enemies/invaders.png",
			"bleed2/enemies/kitty_chopper.png",
			"bleed2/enemies/mantis_core.png",
			"bleed2/enemies/mirror_core.png",
			"bleed2/enemies/nemesis_core.png",
			"bleed2/enemies/ninja.png",
			"bleed2/enemies/red_sprite.png",
			"bleed2/enemies/rex_rocket.png",
			"bleed2/enemies/robo_bunny.png",
			"bleed2/enemies/robo_gibby_stu.png",
			"bleed2/enemies/robo_guppy.png",
			"bleed2/enemies/robo_white.png",
			"bleed2/enemies/segment_slider.png",
			"bleed2/enemies/spider_core.png",
			"bleed2/enemies/valentine.png",
			"bleed2/enemies/whale_core.png",
		],
	},
},
{
	"game": "Bleed 1",
	"lists": [
	{
		"category": "Character",
		"options" : ["Wryn", "Robo-Wryn", "White", "Rival"],
		"odds": [3, 1, 1, 1],
	},
	{
		"category": "Difficulty",
		"options": ["Easy", "Normal", "Hard", "Very Hard"],
		"odds": [1, 4, 3, 2],
	},
	{
		"category": "Mode",
		"options": ["Story", "Arcade", "Challenge"],
		"odds": [2, 2, 1],
	},
	{
		"category": "Level",
		"conditions": { "Mode": "Story" },
		"options": ["1", "2", "3", "4", "5", "6", "7"],
		"state": "OFF",
	},
	{
		"category": "Arcade Health",
		"conditions": { "Mode": "Arcade" },
		"options": ["One hit", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "110", "Full"],
		"state": "OFF",
	},
	{
		"category": "Weapon",
		"conditions": { "Character": "White", "type": "negative" },
		"options": ["Dual Pistols", "Rocket Launcher", "Laser Rifle", "Katana", "Revolver", "Remote Mines",
		            "Flamethrower", "Shotgun", "Homing Missiles", "Akimbo Pistols", "Chainsaw", "White"],
		"multiple": { "max" : 2, "zero": "YES", "odds": [8, 1, 3] },
	},
	{
		"category": "Boss",
		"conditions": { "Mode": "Challenge" },
		"options": ["Random", "Chopper Core", "Guppy", "Gibby and Stu", "White Mk-II",
		            "Bunny Rockette", "Laser Bots", "Battalion", "Bubble Core", "Rival"],
		"multiple": { "max": 3, "odds": [1, 2, 2] },
	},
	{
		"category": "Arena",
		"conditions": { "Mode": "Challenge" },
		"options": ["Default Arena", "Manor Rooftop", "Lava Cave", "Robot Arena", "Bullet Train", "Lab Arena", "Dragon Stomach", "Hall of Heroes"],
	},
	],
	"arts": {
		"primary-width": 130,
		"primary-height": 150,
		"secondary-width": 130,
		"primary": [
			"bleed1/characters/clear_rival.png",
			"bleed1/characters/clear_wryn.png",
			"bleed1/characters/earth_talking.png",
			"bleed1/characters/menu_hand.png",
			"bleed1/characters/menu_note.png",
			"bleed1/characters/menu_thinking.png",
			"bleed1/characters/menu_writing.png",
			"bleed1/characters/rival_interview.png",
			"bleed1/characters/rival_remote.png",
			"bleed1/characters/tv_plucky.png",
			"bleed1/characters/tv_rival.png",
			"bleed1/characters/tv_wryn.png",
			"bleed1/characters/wryn_greatest.png",
			"bleed1/characters/wryn_love.png",
		],
		"secondary": [
			"bleed1/enemies/battalion.png",
			"bleed1/enemies/bubble_core.png",
			"bleed1/enemies/bunny_rockette.png",
			"bleed1/enemies/cats.png",
			"bleed1/enemies/dragon_bubbles.png",
			"bleed1/enemies/dragon_slain.png",
			"bleed1/enemies/drones.png",
			"bleed1/enemies/gibby_and_stu.png",
			"bleed1/enemies/guppy.png",
			"bleed1/enemies/hall_of_heroes.png",
			"bleed1/enemies/laser_bots.png",
			"bleed1/enemies/lil_guppies.png",
			"bleed1/enemies/robo_regulars.png",
			"bleed1/enemies/train_gang.png",
			"bleed1/enemies/white.png",
			"bleed1/enemies/worms.png",
		],
	},
},
]