
TODO
====

Sprint 0
--------

Goal: Research WYSIWYG-editors and setup clean Electron project

Sprint 1
--------

Goal: Basic file handling (open, save) and simple html editing out of the box.

### Features

- [x] Close old window when opening a new one if empty.
- [x] Starts in unsaved mode, when opening file.
- [x] Presentere filnavn i "Do you want to save 'filename'?"
- [x] Save window position med https://www.npmjs.com/package/electron-window-state

Sprint 2
--------

Goal: Nice and pretty. Basic custom text formatting with custom elements like kicker and small-caps.

### Bugs

- [x] Edited=false når du skriver en et tegn og trykker tilbake (og cntr+z, lim inn etter endring). 
- [x] Export to PDF uten å få med cursor

### Features/design

- [x] Print
- [x] Dokumentikon, gjerne med kul tekst som "Here are for the crazy ones"
- [x] Themes med kicker, h1-h2, big og small, small-caps and all-small-caps
- [x] Opened recently list

### Research

- [x] Sjekk om Windows åpner open og save i samme mappe og ikke "Mine Dokumenter" hver gang.


Backlog
-------

### Bugs
- [ ] Links not working in shortcut mode.
- [ ] Webpage clipboard: Dobbelt paragraf mellomrom
- [ ] Webpage clipboard: Mulig å kopiere inn bilder hvis man kopierer tekst fra en nettside.

### Research
- [ ] Look at Quill and Draft WYSIWYG editor. https://quilljs.com/ and https://draftjs.org/
- [ ] Use https://khan.github.io/KaTeX/ for Math

### Features
- [ ] Få tabs til å fungere.
- [ ] Gjøre om Save as to Duplicate (on mac) – after refactoring
- [ ] Recover documents if crash
- [ ] QuickView support, se https://aleksandrov.ws/2014/02/25/osx-quick-look-plugin-development/

### Refactoring
- [ ] Clean code
- [ ] Tests for å åpne og lukke filer, og skadelig filer.
- [ ] Typescript (TS)

### Trix
- [ ] Auto-linking with https://gist.github.com/javan/7b0c99f43e67080c2380e8d30707f773 

Someday maybe
-------------

- [ ] 

