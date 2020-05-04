trixElement = document.querySelector("trix-editor")
trixEditor = trixElement.editor

trixElement.addEventListener('trix-file-accept', function(e) {
  e.preventDefault()
})

delete Trix.config.blockAttributes.quote;
delete Trix.config.blockAttributes.heading1;
Trix.config.blockAttributes.code;
//delete Trix.config.blockAttributes.bulletList;
//delete Trix.config.blockAttributes.bullet;
//delete Trix.config.blockAttributes.numberList;
//delete Trix.config.blockAttributes.number;

Trix.config.blockAttributes.default = {tagName: 'div', parse: false };

Trix.config.blockAttributes.headline_kicker = { tagName: 'kicker', breakOnReturn: true, group: false, terminal: true };
Trix.config.blockAttributes.headline_subsection = { tagName: 'h1', breakOnReturn: true, group: false, terminal: true };
Trix.config.blockAttributes.headline_paragrah = { tagName: 'h2', breakOnReturn: true, group: false, terminal: true };

Trix.config.blockAttributes.big_block = { tagName: 'big', breakOnReturn: true, group: false, terminal: true };
Trix.config.blockAttributes.small_block = { tagName: 'small', breakOnReturn: true, group: false, terminal: true };

delete Trix.config.textAttributes.bold;
//delete Trix.config.textAttributes.italic;
//delete Trix.config.textAttributes.href;
delete Trix.config.textAttributes.strike;
delete Trix.config.textAttributes.frozen;

Trix.config.textAttributes.strong = { 
	tagName: 'strong',
	inheritable: true,
	parser: (element) => {
    style = window.getComputedStyle(element);
    return style["font-weight"] == "bold";
	}
}

Trix.config.textAttributes.smallcaps = { 
	tagName: 'smallcaps',
	inheritable: true,
	parser: (element) => {
    style = window.getComputedStyle(element);
    return style["font-variant"] == "small-caps";
	}
}

Trix.config.textAttributes.allsmallcaps = { 
	tagName: 'allsmallcaps', 
	inheritable: true, 
	parser: (element) => {
    style = window.getComputedStyle(element);
    return style["font-variant"] == "all-small-caps";
	}
}

document.addEventListener('trix-action-invoke', function(e) {
	if(e.actionName === "x-link") {
		if (trixEditor.attributeIsActive("href")) {
			trixEditor.deactivateAttribute("href");
		} else {
			// Returns null if user clicked Cancel
			selection = trixEditor.getSelectedRange()
		
			let url = prompt("Write your url:", "");
			
			// If user did not press cancel or URL is blank
			if (!(url == null || url == "")) {
				console.log("Activate")
				
				// If no protocoll, add http://
				if (url.indexOf(":") == -1) {
					url = "http://" + url;
				}
				
        trixEditor.activateAttribute("href", url);
			}
			trixEditor.setSelectedRange([selection[1], selection[1]]);
			trixEditor.insertString(" ");
			trixEditor.undoManager.undo();
			trixEditor.setSelectedRange(selection);
		}
	}
	
	e.stopPropagation();
});

trixElement.addEventListener("trix-selection-change", function() {
	selectedRange = trixEditor.getSelectedRange()
	isCollapsed = (selectedRange[0] == selectedRange[1])
	
	if (isCollapsed) {
		if(toptoolbar.style.display == "block")
			toptoolbar.style.display = "none"
    } else {
        if(toptoolbar.style.display == "none" || toptoolbar.style.display == "")
			toptoolbar.style.display = "block"
    }
})

var selectedRangeBeforePrint;
window.matchMedia("print").addListener(function() {
	if(trixElement.hasAttribute("contenteditable")) {
		selectedRangeBeforePrint = trixEditor.getSelectedRange()
		trixElement.removeAttribute("contenteditable")
	} else {
		trixElement.setAttribute("contenteditable", "")
		trixEditor.setSelectedRange(selectedRangeBeforePrint)
	}
	
})