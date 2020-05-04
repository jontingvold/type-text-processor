let toptoolbar = document.getElementById('toptoolbar')
let stylelist = document.getElementById('stylelist')

stylelist.addEventListener('click', function(e) {
	let selectedAttribute = e.srcElement.getAttribute('data-trix-attribute');
	
  // Do not hide
	e.stopPropagation();
});

document.addEventListener('click', function() {
  stylelist.style.display = 'none';
});

document.getElementById('stylesbutton').addEventListener('click', function(e) {
  e.stopPropagation();

  if (stylelist.style.display == 'none') {
    stylelist.style.display = 'block';
  } else {
    stylelist.style.display = 'none';
  }
});