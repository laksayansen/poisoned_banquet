// ==============================
// THE POISONED BANQUET - story.js
// All the writing lives in this file: who is in the story, where you can go,
// what you can do in each place, the clues, and the endings.
// game.js reads this and decides what to show and when.
//
// A line of dialogue is written as [speaker, text].
// The speaker is a key from "characters" below, or null for narration.
// ==============================


// CHARACTERS
let characters = {
    maomao:   { name: "Maomao",              image: "images/maomao.jpg" },
    jinshi:   { name: "Jinshi",              image: "images/jinshi.jpg" },
    gyokuyou: { name: "Lady Gyokuyou",       image: "images/gyokuyou.jpg" },
    lishu:    { name: "Consort Lishu",       image: "images/lishu.jpg" },
    taster:   { name: "Lishu’s food taster", image: "images/lishu-taster.jpg" },
    ahduo:    { name: "Lady Ah-Duo",         image: "images/ah-duo.jpg" },
    fengming: { name: "Fengming",            image: "images/fengming.jpg" }
};


// CLUES
// "place" is where the clue is found, so the journal can show it.
let clues = {
    soup: {
        title: "Poisoned soup",
        text: "The soup served to Lady Gyokuyou at the garden party was poisoned. Maomao caught it on the first sip. A minister who tasted it after her is still sick.",
        place: "garden"
    },
    lishuFear: {
        title: "Lishu looked scared",
        text: "Consort Lishu was staring at her tray before anything happened. Something on her side of the table was wrong.",
        place: "garden"
    },
    swap: {
        title: "Switched dishes",
        text: "Lishu’s own attendants switched one of her dishes with one from Lady Gyokuyou’s tray, just to be cruel. The poison was meant for Lishu.",
        place: "garden"
    },
    oneBowl: {
        title: "One bowl",
        text: "Everyone ate from the same pot and nobody else got sick. The poison went into a single serving. Whoever did it picked one person.",
        place: "jade"
    },
    rumor: {
        title: "A new consort",
        text: "The Emperor may take a new consort. If he does, Lady Ah-Duo is the one most likely to leave the palace.",
        place: "jade"
    },
    pushedAway: {
        title: "Sent home early",
        text: "Lishu lived at the Garnet Pavilion as a child and Lady Ah-Duo treated her like a daughter. Fengming always finds a reason to send her home.",
        place: "lishu"
    },
    honeyBaby: {
        title: "Honey and babies",
        text: "Lishu almost died as a baby after someone fed her honey. Honey is fine for adults, but it can kill an infant.",
        place: "lishu"
    },
    note: {
        title: "The note in the moat",
        text: "A servant was found drowned in the moat. Her note says she poisoned the soup and couldn’t live with it.",
        place: "moat"
    },
    covering: {
        title: "Covering for someone",
        text: "A servant couldn’t reach a consort’s tray on her own. She took the blame to protect someone else.",
        place: "moat"
    },
    honeyJars: {
        title: "Honey jars",
        text: "The Garnet Pavilion keeps a lot of honey. Fengming is in charge of it.",
        place: "garnet"
    },
    lostSon: {
        title: "Ah-Duo’s son",
        text: "Lady Ah-Duo’s son was born seventeen years ago and died while he was still a baby. Luomen, Maomao’s adoptive father, delivered him.",
        place: "garnet"
    },
    caretaker: {
        title: "Who looked after him",
        text: "Lady Ah-Duo was sick for a long time after the birth. Fengming took care of the baby for her.",
        place: "garnet"
    },
    loyalty: {
        title: "Fengming’s loyalty",
        text: "Fengming has served Lady Ah-Duo since they were girls and says there’s nothing she wouldn’t do for her.",
        place: "garnet"
    }
};


// PLACES
// Each place has:
//   unlocked()    - true when you are allowed to go there
//   lockedHint    - what to do to open it
//   intro()       - lines for your first visit
//   returnLines() - lines when you come back
//   actions       - things you can do there
// An action can have:
//   available()   - only shows up when this is true
//   isDone()      - when it counts as finished (default: after the first time)
//   run()         - changes the state and returns the lines to show
let places = {

    // ---------- 1. THE GARDEN PARTY ----------
    garden: {
        name: "The Garden Party",
        image: "images/garden-party.jpg",
        alt: "A palace courtyard set up for the garden party, with guests lined up along the walls",
        unlocked: function () { return true; },
        lockedHint: "",
        intro: function () {
            return [
                [null, "The garden party is in full swing, and it’s freezing. The four high consorts sit in a row, each with a food taster standing behind her."],
                ["maomao", "I’m here for Lady Gyokuyou. Taste everything first, and speak up if something’s wrong. Simple enough."]
            ];
        },
        returnLines: function () {
            if (hasFlag("tastedSoup")) {
                return [[null, "The tables are being cleared. People are still whispering about the soup."]];
            }
            return [[null, "The party is still going. Lady Gyokuyou’s soup is waiting."]];
        },
        actions: [
            {
                id: "tasteSoup",
                label: "Taste Lady Gyokuyou’s soup",
                run: function () {
                    setFlag("tastedSoup");
                    addClue("soup");
                    return [
                        [null, "Maomao takes a small sip and holds it on her tongue."],
                        ["maomao", "It stings. This is poison."],
                        [null, "She says it out loud, sets the bowl down, and walks out to throw it up before it gets into her system."],
                        [null, "One of the ministers doesn’t take her seriously and tastes it anyway. By evening he’s in bed and very sick."],
                        ["jinshi", "Go back to the Jade Pavilion. I’ll bring the bowl."]
                    ];
                }
            },
            {
                id: "watchLishu",
                label: "Watch Consort Lishu",
                run: function () {
                    setFlag("watchedLishu");
                    addClue("lishuFear");
                    return [
                        [null, "Lishu is the youngest of the four consorts. She’s barely touched her food."],
                        [null, "She keeps looking down at her tray like there’s something wrong with it."],
                        ["maomao", "She looked scared before anything happened. That isn’t normal party nerves."]
                    ];
                }
            },
            {
                id: "talkTaster",
                label: "Talk to Lishu’s food taster",
                available: function () { return hasFlag("watchedLishu"); },
                run: function () {
                    addClue("swap");
                    return [
                        [null, "Lishu’s food taster won’t look Maomao in the eye."],
                        ["maomao", "One of the dishes on your lady’s tray was switched with one from Lady Gyokuyou’s. Wasn’t it?"],
                        ["taster", "I don’t know what you’re talking about."],
                        [null, "She does. Lishu’s own attendants switched the dish on purpose, just to make things harder for her."],
                        ["maomao", "So the soup that reached Lady Gyokuyou was supposed to go to Lishu."]
                    ];
                }
            }
        ]
    },

    // ---------- 2. THE JADE PAVILION ----------
    jade: {
        name: "The Jade Pavilion",
        image: "images/jade-pavilion.jpg",
        alt: "The main hall of the Jade Pavilion, with a wide wooden staircase and lanterns",
        unlocked: function () { return hasFlag("tastedSoup"); },
        lockedHint: "Taste the soup at the party first.",
        intro: function () {
            return [
                [null, "The Jade Pavilion is quieter than usual. Jinshi has the soup bowl on the table, still half full."],
                ["gyokuyou", "There you are. Sit down before you fall down."]
            ];
        },
        returnLines: function () {
            return [[null, "Back at the Jade Pavilion. The bowl is still on the table."]];
        },
        actions: [
            {
                id: "examineBowl",
                label: "Examine the soup bowl",
                run: function () {
                    addClue("oneBowl");
                    return [
                        [null, "Maomao looks over the bowl, then asks about the rest of the soup."],
                        ["jinshi", "It all came from the same pot. Nobody else got sick."],
                        ["maomao", "Then the poison went into one serving after it was poured. Somebody picked a person, not a party."]
                    ];
                }
            },
            {
                // This one has three different answers depending on what you've found.
                id: "talkJinshi",
                label: "Tell Jinshi who the target was",
                isDone: function () { return hasFlag("toldJinshi"); },
                run: function () {
                    if (hasClue("swap")) {
                        setFlag("toldJinshi");
                        return [
                            ["maomao", "It wasn’t meant for Lady Gyokuyou. A dish was switched between the trays. The poison was for Consort Lishu."],
                            ["jinshi", "The youngest consort. That changes things."],
                            ["jinshi", "There’s something else. A servant was found in the moat this morning. Come with me."]
                        ];
                    } else if (hasFlag("watchedLishu")) {
                        return [
                            ["jinshi", "So who was it meant for?"],
                            ["maomao", "Lady Gyokuyou, on paper. But something was off at Lishu’s end of the table. I want to check first."],
                            ["jinshi", "Then check. Don’t guess."]
                        ];
                    } else {
                        return [
                            ["jinshi", "So who was it meant for?"],
                            ["maomao", "It was Lady Gyokuyou’s bowl. That’s all I know so far."],
                            ["jinshi", "That’s what everyone knows. Go back and look again."]
                        ];
                    }
                }
            },
            {
                id: "talkGyokuyou",
                label: "Talk to Lady Gyokuyou",
                run: function () {
                    addClue("rumor");
                    return [
                        ["gyokuyou", "Everyone keeps telling me someone wants me dead. I’m not sure that’s right."],
                        ["gyokuyou", "There’s a rumor going around. The Emperor might take a new consort, and if he does, Lady Ah-Duo is probably the one who has to leave."],
                        ["maomao", "So somebody at the Garnet Pavilion has a reason to worry."]
                    ];
                }
            }
        ]
    },

    // ---------- 3. LISHU'S ROOMS ----------
    lishu: {
        name: "Lishu’s Rooms",
        image: "images/lishu-room.jpg",
        alt: "A consort’s room with red lacquered walls, green curtains and hanging lanterns",
        unlocked: function () { return hasFlag("watchedLishu"); },
        lockedHint: "Notice something about Lishu at the party.",
        intro: function () {
            return [
                [null, "Lishu’s rooms are big and quiet. Her ladies-in-waiting are in the next room, laughing about something."],
                ["lishu", "You’re Lady Gyokuyou’s food taster. Did she send you?"]
            ];
        },
        returnLines: function () {
            return [[null, "Lishu is sitting where Maomao left her."]];
        },
        actions: [
            {
                id: "askParty",
                label: "Ask about the party",
                run: function () {
                    setFlag("askedParty");
                    return [
                        ["lishu", "I knew my tray was wrong. I didn’t say anything."],
                        ["lishu", "Nobody listens to me here anyway."],
                        ["maomao", "She’s fourteen, and her own attendants treat her like a joke. No wonder she kept quiet."]
                    ];
                }
            },
            {
                id: "askGarnet",
                label: "Ask about the Garnet Pavilion",
                available: function () { return hasFlag("askedParty"); },
                run: function () {
                    addClue("pushedAway");
                    return [
                        ["lishu", "I lived there for a while when I was little. Lady Ah-Duo looked after me like I was her own."],
                        ["lishu", "I still visit. But Fengming always finds a reason to send me home early. I don’t think she wants me there."]
                    ];
                }
            },
            {
                id: "askFood",
                label: "Ask what she can’t eat",
                available: function () { return hasFlag("askedParty"); },
                run: function () {
                    addClue("honeyBaby");
                    let lines = [
                        ["lishu", "A lot of things make me sick. When I was a baby someone gave me honey, and I almost died."]
                    ];
                    // Maomao reacts differently if she has already seen the honey at the Garnet Pavilion
                    if (hasClue("honeyJars")) {
                        lines.push(["maomao", "Honey. And the Garnet Pavilion is full of it."]);
                    } else {
                        lines.push(["maomao", "Honey is harmless for adults. For a baby, it can kill."]);
                    }
                    return lines;
                }
            }
        ]
    },

    // ---------- 4. THE MOAT ----------
    moat: {
        name: "The Moat",
        image: "images/moat.jpg",
        alt: "The palace wall and moat at night, with two small figures by a lantern",
        unlocked: function () { return hasFlag("toldJinshi"); },
        lockedHint: "Tell Jinshi who the poison was really for.",
        intro: function () {
            return [
                [null, "It’s dark by the time they reach the moat. The body has already been taken away."],
                ["jinshi", "She was a servant here. The guards found a note with her things."]
            ];
        },
        returnLines: function () {
            return [[null, "The moat is quiet. The guards have gone home."]];
        },
        actions: [
            {
                id: "readNote",
                label: "Read the note",
                run: function () {
                    addClue("note");
                    return [
                        [null, "The note is short. She poisoned the soup, she’s sorry, and she couldn’t live with it."],
                        ["jinshi", "Half the officials already want to close the case."]
                    ];
                }
            },
            {
                id: "questionNote",
                label: "Look at the note again",
                available: function () { return hasClue("note"); },
                run: function () {
                    addClue("covering");
                    setFlag("sentToGarnet");
                    return [
                        ["maomao", "A servant like her couldn’t get anywhere near a consort’s tray by herself."],
                        ["maomao", "And people don’t die over something they did alone. She was covering for someone."],
                        ["jinshi", "Lishu spent part of her childhood at the Garnet Pavilion. If anyone there wanted her gone, I want to know. They’re short on help. You start tomorrow."]
                    ];
                }
            }
        ]
    },

    // ---------- 5. THE GARNET PAVILION ----------
    garnet: {
        name: "The Garnet Pavilion",
        image: "images/garnet-pavilion.jpg",
        alt: "The entrance hall of the Garnet Pavilion, with twin staircases and yellow lanterns",
        unlocked: function () { return hasFlag("sentToGarnet"); },
        lockedHint: "Work out what’s wrong with the note at the moat.",
        intro: function () {
            return [
                [null, "The Garnet Pavilion is the oldest in the inner palace. Lady Ah-Duo lives here, and her head lady-in-waiting, Fengming, runs it."],
                ["fengming", "You’re the help Jinshi sent. Do what you’re told and don’t wander."]
            ];
        },
        returnLines: function () {
            return [[null, "Fengming glances up when Maomao comes back in, then goes back to work."]];
        },
        actions: [
            {
                id: "moveHoney",
                label: "Help carry the honey jars",
                run: function () {
                    addClue("honeyJars");
                    let lines = [
                        [null, "Fengming has Maomao carry jars of honey into the storeroom. There are a lot of them."],
                        ["fengming", "Careful. Those are for Lady Ah-Duo."]
                    ];
                    if (hasClue("honeyBaby")) {
                        lines.push(["maomao", "Honey again. Lishu almost died from it as a baby, and this place is stacked with it."]);
                    } else {
                        lines.push(["maomao", "That’s a lot of honey for one pavilion."]);
                    }
                    return lines;
                }
            },
            {
                id: "library",
                label: "Air out the library",
                run: function () {
                    addClue("lostSon");
                    return [
                        [null, "The library hasn’t been opened in a long time. Between the old books are records from the pavilion."],
                        [null, "One of them is about Lady Ah-Duo’s son. He was born seventeen years ago and died while he was still a baby."],
                        ["maomao", "The doctor who delivered him was Luomen. My old man."]
                    ];
                }
            },
            {
                id: "talkAhDuo",
                label: "Talk to Lady Ah-Duo",
                run: function () {
                    addClue("caretaker");
                    return [
                        ["ahduo", "Lishu stayed with me when she was small. I miss having her around."],
                        ["ahduo", "After my son was born I was sick for a long time. Fengming took care of him for me."]
                    ];
                }
            },
            {
                id: "talkFengming",
                label: "Talk to Fengming",
                run: function () {
                    addClue("loyalty");
                    let lines = [
                        ["fengming", "I’ve served Lady Ah-Duo since we were girls. There’s nothing I wouldn’t do for her."]
                    ];
                    if (hasClue("pushedAway")) {
                        lines.push(["maomao", "Consort Lishu says you send her home early."]);
                        lines.push(["fengming", "Consort Lishu has her own pavilion. She should spend her time there."]);
                        lines.push(["maomao", "Polite about everyone except Lishu."]);
                    } else {
                        lines.push(["maomao", "She means it, too."]);
                    }
                    return lines;
                }
            }
        ]
    },

    // ---------- 6. NAME THE POISONER ----------
    // This place has no normal actions. game.js shows the suspects instead.
    accuse: {
        name: "Name the Poisoner",
        image: "images/jade-pavilion.jpg",
        alt: "The main hall of the Jade Pavilion",
        unlocked: function () { return hasClue("note"); },
        lockedHint: "Read the note at the moat first.",
        intro: function () {
            return [
                ["jinshi", "You think you know who did it. Who?"]
            ];
        },
        returnLines: function () {
            return [["jinshi", "Well? Who was it?"]];
        },
        actions: []
    }
};

// The order places appear in the "Go to" list
let placeOrder = ["garden", "jade", "lishu", "moat", "garnet", "accuse"];


// SUSPECTS
// They only show up once you've met them or found out about them.
let suspects = [
    {
        id: "taster",
        name: "Lishu’s food taster",
        image: "images/lishu-taster.jpg",
        available: function () { return hasClue("swap"); }
    },
    {
        id: "servant",
        name: "The servant in the moat",
        image: "images/moat.jpg",
        available: function () { return hasClue("note"); }
    },
    {
        id: "ahduo",
        name: "Lady Ah-Duo",
        image: "images/ah-duo.jpg",
        available: function () { return hasVisited("garnet"); }
    },
    {
        id: "fengming",
        name: "Fengming",
        image: "images/fengming.jpg",
        available: function () { return hasVisited("garnet"); }
    }
];

// What gets said when you accuse each suspect
let accusations = {
    taster: [
        ["maomao", "Lishu’s food taster. She switched the dishes."],
        ["jinshi", "She switched them to be cruel. That doesn’t make her a poisoner."]
    ],
    servant: [
        ["maomao", "The servant in the moat. She confessed."],
        ["jinshi", "That’s what the officials wanted to hear."]
    ],
    ahduo: [
        ["maomao", "Lady Ah-Duo. She’s the one who’d lose her place to a new consort."],
        ["jinshi", "You’re accusing a high consort. Do you have anything that says she knew?"],
        [null, "Maomao doesn’t."]
    ],
    fengmingWeak: [
        ["maomao", "Fengming."],
        ["fengming", "Why would I poison a child?"],
        [null, "Maomao has a feeling, but no reason she can say out loud."]
    ],
    fengmingFull: [
        ["maomao", "Fengming."],
        ["maomao", "Seventeen years ago, Lady Ah-Duo was too sick to look after her son, so Fengming did. The Garnet Pavilion has always had honey."],
        ["maomao", "Nobody told her honey can kill a baby. She gave him some, and he died. Nobody knew why."],
        ["maomao", "Years later, Lishu mentioned she almost died from honey as a baby. That’s when Fengming understood what she’d done."],
        ["maomao", "Lishu is close to Lady Ah-Duo and keeps visiting. Sooner or later Lady Ah-Duo might hear the same story and put it together. Fengming couldn’t let that happen."],
        ["maomao", "So she went after Lishu. And the servant in the moat took the blame so nobody would look at the Garnet Pavilion."],
        ["jinshi", "And Lady Ah-Duo?"],
        ["maomao", "She doesn’t know. That part is up to me."]
    ]
};

// The clues you need to explain WHY Fengming did it
let keyClues = ["honeyBaby", "lostSon", "caretaker"];

// The last choice, after you've worked out the whole thing
let finalChoice = {
    question: "Does Lady Ah-Duo find out about the honey?",
    options: [
        {
            label: "Tell Lady Ah-Duo everything",
            lines: [["maomao", "Lady Ah-Duo should know how her son died."]],
            ending: "truth"
        },
        {
            label: "Keep the honey out of it",
            lines: [["maomao", "Fengming can confess to the poisoning. The rest doesn’t need to come out."]],
            ending: "secret"
        }
    ]
};


// ENDINGS
let endings = {
    prank: {
        title: "Just a cruel prank",
        image: "images/lishu-taster.jpg",
        text: "Lishu’s food taster is punished for switching the dishes, and she deserved that much. But she never touched the poison. Whoever did is still in the palace, and Lishu is still a target.",
        canon: false
    },
    closed: {
        title: "Case closed",
        image: "images/moat.jpg",
        text: "The palace takes the note at face value and closes the case within the week. Maomao goes back to tasting soup. She doesn’t believe a word of it, but nobody asks her.",
        canon: false
    },
    wrongLady: {
        title: "The wrong lady",
        image: "images/ah-duo.jpg",
        text: "Lady Ah-Duo had nothing to do with it. Jinshi smooths it over, but Maomao is taken off the case, and the real poisoner never has to explain anything.",
        canon: false
    },
    weak: {
        title: "Right person, no proof",
        image: "images/fengming.jpg",
        text: "Fengming asks for proof and Maomao doesn’t have it, so Fengming goes back to running the Garnet Pavilion. You had the right person but not the reason. Look into what happened at the Garnet Pavilion seventeen years ago, and ask Lishu what she can’t eat.",
        canon: false
    },
    truth: {
        title: "The whole truth",
        image: "images/ah-duo.jpg",
        text: "Fengming is taken away either way. But now Lady Ah-Duo knows her son died in the hands of the person she trusted most. Maomao told the truth. She isn’t sure it helped anyone.",
        canon: false
    },
    secret: {
        title: "What Maomao kept",
        image: "images/maomao.jpg",
        text: "Fengming turns herself in. She says she poisoned Lishu to protect Lady Ah-Duo’s place in the palace, and she is executed soon after. She never mentions the honey, and neither does Maomao. Lady Ah-Duo never finds out how her son died. This is how the arc ends in the anime.",
        canon: true
    }
};

let endingOrder = ["prank", "closed", "wrongLady", "weak", "truth", "secret"];
