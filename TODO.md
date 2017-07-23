
TODO
====

Sprint 1
--------

### Bugs
[ ] Close old window when opening a new one if empty.
[ ] Starts in unsaved mode, when opening file.
[ ] Edited=false når du skriver en et tegn og trykker tilbake (og cntr+z, lim inn etter endring).
[x] Export to PDF uten å få med cursor

### Features
[ ] Presentere filnavn i "Do you want to save 'filename'?"
[ ] Save window position med https://www.npmjs.com/package/electron-window-state
[ ] Gjøre om Save as to Duplicate (on mac)
[ ] Recover documents if crash
[x] Print
[ ] QuickView support, se https://aleksandrov.ws/2014/02/25/osx-quick-look-plugin-development/
[x] Sjekk om Windows åpner open og save i samme mappe og ikke "Mine Dokumenter" hver gang.

### Refactoring
[ ] Clean code
[ ] Tests for å åpne og lukke filer, og skadelig filer.

### Design
[ ] Dokumentikon, gjerne med kul tekst som "Here are for the crazy ones"
[ ] Themes med h1-h4, big og small (og fungerende med The Economist)
[ ] Dokumenter vi kan bruke til promotering


Backlog
-------

### Bugs
[ ] Links not working in shortcut mode.
[ ] Webpage clipboard: Dobbelt paragraf mellomrom
[ ] Webpage clipboard: Mulig å kopiere inn bilder hvis man kopierer tekst fra en nettside.

### Research
[ ] Look at Quill and Draft WYSIWYG editor. https://quilljs.com/ and https://draftjs.org/
[ ] Use https://khan.github.io/KaTeX/ for Math

### Features
[ ] Få tabs til å fungere.
[ ] Opened recently list
[-] Quit and open where you left off. IKKE SLIK PÅ MAC LENGER. 

### Refactoring
[ ] Typescript (TS)

### Design

### Trix
[ ] Auto-linking with https://gist.github.com/javan/7b0c99f43e67080c2380e8d30707f773 
