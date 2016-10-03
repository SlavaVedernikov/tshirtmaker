(function( $ ) {
  
var mainHolder, colorHolder, colorBackgroundHolder, colorForegroundHolder, colorCurrentFillHolder, colorPatternHolder;
var fillMode = 'solid'; // solid or patters
var colorPickerMode = 'background'; // background or foreground
    
var btnRandom, btnClear, btnDownloadSVG, btnDownloadPNG;
var svgObject, svgOutline, svgColor, svgBackgroundColor, svgForegroundColor, svgPatterns, svgCustomPatterns;
var swatchUp, swatchDown;
var patternSwatches = [];
var fillSpeed = 0.15;
    
var closeOffset ;   
var data = [];
    
function svgPatternToBase64Image(svgPattern, width, heith) {
    var svg = $('<svg/>', {'xmlns': 'http://www.w3.org/2000/svg', 'width': width, 'height': heith, 'viewBox': '0 0 25 25'});
    svg[0].innerHTML = svgPattern.innerHTML.replace(/url\(#background_color\)/g, chosenFill.backgroundColor.value).replace(/url\(#foreground_color\)/g, chosenFill.foregroundColor.value);
    var b64 = window.btoa(svg[0].outerHTML);
    return 'data:image/svg+xml;base64,' + b64;
}

function colorSwatchClick(){
    if(colorPickerMode == 'background')
    {
        chosenFill.backgroundColor = $(this).data('color')
    }
    else if(colorPickerMode == 'foreground')
    {
        chosenFill.foregroundColor = $(this).data('color');
    }

    svgBackgroundColor.attr('stop-color', chosenFill.backgroundColor.value);
    svgForegroundColor.attr('stop-color', chosenFill.foregroundColor.value);
    
    $.each(patternSwatches, function() {
        var fill = 'background: url("' + svgPatternToBase64Image($(this, 25, 25).data('pattern')) + '");background-repeat: repeat;background-size: 25px 25px;';
        
        $(this).attr('style', fill);
      });
  }
    
function swatchMove(e){
    var moveTo = (e.type == 'mouseenter')? swatchUp: swatchDown;
    //var moveTo = (e.type == 'mouseenter')? swatchUp: swatchUp;
    TweenMax.to('.swatchHolder', 0.5, moveTo);
  }
  
function colorMe() {
    var fill;
    var currentFill = JSON.parse(JSON.stringify(chosenFill));
    if(fillMode == 'solid')
    {
        fill = chosenFill.backgroundColor.value;
        currentFill.pattern = null;
    }
    else if(fillMode == 'pattern')
    {
        var patternId = $(this).attr('id') + '_' + $(chosenFill.pattern).attr('id');
        currentFill.pattern = {id: $(chosenFill.pattern).attr('id')};
        
        var customPattern = $('#' + patternId, svgCustomPatterns);
        
        var customPatternMarkup = chosenFill.pattern.innerHTML.replace(/url\(#background_color\)/g, chosenFill.backgroundColor.value).replace(/url\(#foreground_color\)/g, chosenFill.foregroundColor.value);
        if(customPattern.length == 0)
        {
            //customPattern = $('<pattern/>', {'id': patternId}).appendTo(svgCustomPatterns);
            customPattern = createSVGElement('pattern');
            customPattern[0].setAttribute('id', patternId);
            svgCustomPatterns.appendChild(customPattern[0]);
            var attrpatternUnits = document.createAttribute("patternUnits");
            attrpatternUnits.value = "userSpaceOnUse";
            customPattern[0].setAttributeNode(attrpatternUnits); 
            customPattern[0].setAttribute('height', '25');
            customPattern[0].setAttribute('width', '25');
            customPattern[0].appendChild(parseSVG(customPatternMarkup));
            //customPattern[0].innerHTML = customPatternMarkup;
            
        }
        else
        {
            while (customPattern[0].firstChild) {
                customPattern[0].removeChild(customPattern[0].firstChild);
            }
            customPattern[0].appendChild(parseSVG(customPatternMarkup));
        }
        
        fill = 'url(#' + patternId + ')';
        //fill = 'url(#' + 'Checkerboard' + ')';
        
    }
      
    
    this.setAttributeNS(null, 'style', 'fill: ' + fill + ';' + getStrokeStyle(chosenFill.backgroundColor.value));
    
    console.log($(this).attr('id'));
  }

function getColorByValue(value)
{
    for(var i = 0; i < colors.length; i++)
    {
        if(colors[i].value == value)
        {
            return colors[i];
        }
    }
}
function parseSVG(s) {
    var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    var frag = document.createDocumentFragment();
    while (div.firstChild.firstChild)
        frag.appendChild(div.firstChild.firstChild);
    return frag;
}
    
function createSVGElement(element) {
    return $(document.createElementNS('http://www.w3.org/2000/svg', element));
}
    
function getStrokeStyle(color){
    return 'stroke:' + ColorLuminance(color, -0.25) + ';stroke-width:1;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4.0000000;stroke-//dasharray:none;strokeopacity:1.0000000;'
}
function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}

function swatchRollover(e){
    var rollover = (e.type == 'mouseenter')? {scale:1.2}:{scale:1};
    TweenMax.to($(this), 0.05, rollover); 
  }
    
function toggleFillMode(e){
    fillMode = (fillMode == 'solid')? 'pattern': 'solid';
    if(fillMode == 'pattern' || colorPickerMode == 'foreground')
    {
        colorPickerMode = 'background';
        updateColorPickerModeView();
    }
    updateFillModeView();
  }
    
function updateFillModeView(){
    var toggle = (fillMode == 'pattern')? {scale:1.3}: {scale:1};
    TweenMax.to($(colorPatternHolder), 0.05, toggle);
    
    updateCurrentFillHolder();
        
    $(colorForegroundHolder).css('visibility', (fillMode == 'pattern')? 'visible': 'hidden');
    $(colorBackgroundHolder).css('visibility', (fillMode == 'pattern')? 'visible': 'hidden');
  }
    
function toggleColorPickerMode(e){
        
    if(($(this).attr('name') == 'colorBackgroundHolder' && colorPickerMode == 'background') ||
        ($(this).attr('name') == 'colorForegroundHolder' && colorPickerMode == 'foreground')) return;
        
    colorPickerMode = (colorPickerMode == 'background')? 'foreground': 'background';
    updateColorPickerModeView();
  }
    
function updateColorPickerModeView(e){
        
    var toggleBackground = (colorPickerMode == 'background')? {scale:1.3}: {scale:1};
    TweenMax.to($(colorBackgroundHolder), 0.05, toggleBackground); 
        
    var toggleForeground = (colorPickerMode == 'foreground')? {scale:1.3}: {scale:1};
    TweenMax.to($(colorForegroundHolder), 0.05, toggleForeground); 
  }

function svgRandom() {
    $(svgColor).each(function(){
        var randomNum = Math.floor((Math.random() * colors.length));
        
        this.setAttributeNS(null, 'style', 'fill: ' + colors[randomNum].value + ';' + getStrokeStyle(colors[randomNum].value));
    })
  }
    
function svgClear() {
    $(svgColor).each(function(){
      //TweenMax.to(this, fillSpeed, { style: 'fill: "#EEE"' });
        this.setAttributeNS(null, 'style', 'fill: #FFF;' + getStrokeStyle('#FFF'));
    })
  }

function svgDownloadSVG() {
   var svgInfo = $("<div/>").append($(svgObject).clone()).html();
   $(this).attr({
            href:"data:image/svg+xml;utf8,"+svgInfo,
            download:'coloringBook.svg',
            target:"_blank"
    });
  }
    
$.fn.makeSwatches = function() {
    var swatchHolder = $('<ol/>', {'class': 'swatchHolder'}).appendTo(this);
        

    $.each(colors, function() {
        var swatch = $('<li/>', {'class': 'swatch'}).appendTo(swatchHolder);
        
        $(swatch).css('background-color', this.value);
        $(swatch).data('color', this);
        $(swatch).on('click', colorSwatchClick);
        $(swatch).on('mouseenter mouseleave', swatchRollover);
    })

    var menuHolder = $('<li/>').appendTo(swatchHolder);
    $('<p/>').html('&nbsp;').appendTo(menuHolder);
   
    var buttonToolbar = $('<div/>', {'class': 'center-block'}).appendTo(menuHolder);
    
    
    
    $('<button/>', {'id': 'btnRandom', 'type': 'button', 'class': 'btn btn-primary'}).html('<span class="glyphicon glyphicon-random"></span>').appendTo(buttonToolbar);
    $('<span/>').html('&nbsp;&nbsp;&nbsp;').appendTo(buttonToolbar);
    $('<button/>', {'id': 'btnClear', 'type': 'button', 'class': 'btn btn-danger'}).html('<span class="glyphicon glyphicon-remove"></span>').appendTo(buttonToolbar);
    
    $('#btnRandom').btnRandom();
    $('#btnClear').btnClear();
    
  } 

$.fn.makeSVGcolor = function(svgURL) {
    mainHolder = this;
    $(this).load(svgURL, function() {
      svgObject  = $('svg', this);
      svgColor   = $('g:nth-child(2)', svgObject).children();
      svgOutline = $('g:nth-child(1)', svgObject).children();
      
      svgBackgroundColor = $('stop', $('linearGradient#background_color', $('defs#colors', svgObject)));
      svgForegroundColor = $('stop', $('linearGradient#foreground_color', $('defs#colors', svgObject)));
        
      svgPatterns = $('defs#patterns', svgObject).children();
      chosenFill.pattern = svgPatterns[0];
        
      svgCustomPatterns = $('defs#custom_patterns', svgObject)[0];
      
      $(svgColor).on('click', colorMe);
        
      svgClear();
    });
  }

$.fn.btnRandom    = function() {
    btnRandom = this
    $(btnRandom).on('click', svgRandom)
  }

$.fn.btnClear     = function() {
    btnClear = this
    $(btnClear).on('click', svgClear)
  }

$.fn.btnDownload  = function(type) {
    if(type == 'PNG'){
      btnDownloadPNG = this
      $(this).on('mouseenter', svgDownloadPNG)
    } else {
      btnDownloadSVG = this
      $(this).on('mouseenter', svgDownloadSVG)
    }
  }
}( jQuery ));

var colors = [{id: 5, name: 'White', value: '#EEE'}, {id: 20, name: 'Cream', value: '#FDF5EE'}, {id: 26, name: 'Tan', value: '#D2B48C'}, {id: 2, name: 'Green', value: '#2E8B57'}, {id: 6, name: 'Yellow', value: '#FBEE34'}, {id: 13, name: 'Stone', value: '#8A807C'}, {id: 1, name: 'Red', value: '#CC0000'}, {id: 9, name: 'Pink', value: '#FF69B4'}, {id: 25, name: 'Beige', value: '#F7DAAF'}, {id: 33, name: 'Navy', value: '#003366'}, {id: 7, name: 'Orange', value: '#F16824'}, {id: 16, name: 'Grey', value: '#CECCCC'}, {id: 10, name: 'Brown', value: '#8B4513'}, {id: 3, name: 'Blue', value: '#1890CA'}, {id: 11, name: 'Gold', value: '#E89D5E'}, {id: 4, name: 'Balck', value: '#343433'}, {id: 8, name: 'Purple', value: '#5A499E'}, {id: 12, name: 'Silver', value: '#C0C0C0'}];

var chosenFill = {backgroundColor: colors[0], foregroundColor: colors[0], pattern: null};
var defaultFill = {backgroundColor: colors[0], foregroundColor: colors[0], pattern: null};

$('#svgContaine').makeSVGcolor('pirate.svg');//pirate, girl
$('#menuContainer').makeSwatches();




