# The Poisoned Banquet

A fan-made mystery based on the garden party arc of *The Apothecary Diaries* (Season 1, episodes 6 to 11). You play as Maomao, look around the inner palace, collect clues, and name whoever poisoned the soup.

Made by Laksa Fadhil Yansen for CCT360, Project 2: Interactive Discovery.

## How to run

Open `index.html` in a browser, or visit the GitHub Pages link. No installs needed.

## Files

```
poisoned_banquet/
├── index.html      the page: title screen, game screen, journal, ending screen
├── css/style.css   all the styling and the phone layout
├── js/story.js     all the writing: places, actions, clues, suspects, endings
├── js/game.js      the logic: state, saving, showing scenes and dialogue
└── images/         backgrounds and character portraits
```

The story and the logic are in separate files, so the writing can be changed without touching the code.

## How it meets the requirements

**Scenes (6):** the Garden Party, the Jade Pavilion, Lishu’s Rooms, the Moat, the Garnet Pavilion, and Name the Poisoner, plus the title and ending screens.

**Interactive elements:** action buttons in each place, the "Go to" travel list, the Next/Continue dialogue button, the case journal pop-up (button or the J key), suspect cards, the final choice, and the ending buttons (choose again, new case, back to title).

**State-based interactions:**
- Places unlock based on what you've done (for example, the Moat only opens after you tell Jinshi who the poison was really for).
- New actions appear after earlier ones (talking to Lishu's food taster only shows up after you watch Lishu).
- Telling Jinshi who the target was has three different answers depending on which clues you have.
- Some lines change depending on the order you visit places (the honey lines at the Garnet Pavilion and in Lishu's rooms).
- Suspects only appear once you've met them.
- Accusing Fengming gives a different ending depending on whether you found the three clues that explain why.
- Progress is saved with localStorage, so you can close the tab and continue. Endings found are saved separately and stay after you start a new case.

**Multiple pathways:** after the garden party you can visit places in different orders, and there are six endings.

**Media:** 6 background images and 7 character portraits.

**Responsive:** two columns on desktop, one column on phones and tablets.

## Credits

*The Apothecary Diaries* is based on the light novels by Natsu Hyuuga. Story events follow the 2023 anime, Season 1, episodes 6 to 11. All character art and background images are screenshots from the anime and belong to their owners. This is a non-commercial student project.

Fonts: Yuji Syuku and Spectral from Google Fonts.
