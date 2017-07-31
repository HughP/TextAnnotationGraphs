class Word {
  constructor(val, idx, tag = null) {
    this.val = val;
    this.idx = idx;
    this.id = `(${this.val}, ${this.idx})`;

    this.h = 0; //num slots

    this.wh = texts.wordText.maxHeight + Config.textPaddingY*2; 
    this.leftX = 0;

    this.slotsL = []; //all the slots that links attached the left side of this word occupy
    this.slotsR = [];  //all the slots that links attached the left side of this word occupy

    this.parentsL = [];  //who connects to me and is attached to my left side
    this.parentsR = [];  //who connects to me and is attached to my right side
    this.parentsC = []; //who connects to me and is attached to the center (ie, for multilinks)

    let wh = getTextWidthAndHeight(val, texts.wordText.style);
    this.tw = wh.w; //width of text part of word, used also to determine minimum size of word rect
    this.th = wh.h;

    this.setTag(tag);

    this.percPos = 0.0; //this is used to indicate where along the row the word is positioned, used when resizing the browser's width, or when popping open a right panel.

    this.isSelected = false;
    this.isDragging = false;

    //variables created in first render...

    this.row = null; //this is a row object, for row num do: this.row.idx

    this.svg = null; // group element within which rect, text, and handles are nested
                    // TODO: transform this.svg instead of individual children

    this.bbox = null; //the bbox of the clickable rect
    this.underneathRect = null; //solid rect on which other word parts are placed (text, handles, clickable rect)
    this.text = null; //the svg text
    this.tagtext = null; //the svg text for a tag

    this.leftHandle = null; //the left draggable handle to resize word
    this.rightHandle = null; //the right draggable handle to resize word
         
    this.tempX = 0.0;
    this.tempW = 0.0;
    this.tempY = 0.0;
  }
  
  //take temp values and update actual svg values
  update() {
    this.underneathRect.x(this.tempX);
    this.underneathRect.width(this.tempW);

    this.bbox = this.underneathRect.bbox();

    this.text.x(this.tempX + this.tempW/2); 
    this.rightX = this.tempX + this.tempW;

    if (this.tag != null) {
      this.tagtext.x(this.tempX + this.tempW/2); 

      this.leftHandle.x(this.tempX);
      this.rightHandle.x(this.rightX - Config.handleW);
    }

    this.leftX = this.tempX; 

    this.percPos = (this.leftX-Config.edgePadding) / (Config.svgWidth-Config.edgePadding*2);
  }
  
  setTag(tag) {
    let tagw = tag === null ? 0 : getTextWidth(tag, texts.tagText.style);
    this.tw = Math.max(tagw, this.tw);
    this.tag = tag;
  }

  draw() {    


    let g = this.svg = draw.group().addClass('word');
    let x = this.leftX + this.defaultWidth/2;

    this.underneathRect = g.rect( this.defaultWidth, this.wh )
      .x( this.leftX )
      .y( this.wy )
      .addClass('word--underneath');

    this.text = g.text(this.val)
      .y(this.wy + Config.textPaddingY*2 - texts.wordText.descent)
      .x(x)
      .font(texts.wordText.style);

    this.bbox = this.underneathRect.bbox();
    this.rightX = this.underneathRect.bbox().x + this.underneathRect.bbox().w;
    this.percPos = (this.leftX-Config.edgePadding) / (Config.svgWidth-Config.edgePadding*2);

    if (this.tag != null) {

      //add in tag text, if the word has an associated tag
      this.tagtext = g.text(this.tag)
        .y(this.wy + Config.textPaddingY/2 - texts.wordText.descent)
        .x(x)
        .font(texts.tagText.style);

      this.leftHandle = g.rect(Config.handleW, Config.wordHeight)
        .x(this.leftX)
        .y( this.wy)
        .addClass('word--handle');

      this.rightHandle = g.rect(Config.handleW,Config.wordHeight)
        .x(this.rightX - (Config.handleW))
        .y( this.wy)
        .addClass('word--handle');

      //set up mouse interactions
      setUpLeftHandleDraggable(this);
      setUpRightHandleDraggable(this); 
    }

    setUpWordDraggable(this); 

    this.underneathRect.dblclick( () => {
      this.toggleHighlight();
      draw.fire('wordSelected', { arbitrary: this });
    });

    this.underneathRect.click(() => {
      draw.fire('wordClicked', { arbitrary: this });
    })
  }

  get wy() {
    if (this.row) {
      return this.row.ry + this.row.rh - (texts.wordText.maxHeight + Config.textPaddingY*2);
    }
    return 0;
  }

  get defaultWidth() {
    return this.tw + (Config.textPaddingX * 2)
  }

  get minWidth() { //min width is the maximum of: the word text, the tag text, or the size of the two handles + a little bit
    return Math.max(Config.minWordWidth, this.tw);
  }

  //maxWidth() must return a value less than row width - Config.edgePaddings, else will try to reposition long words forever!!!
  get maxWidth() {
    return (this.row.rect.width() - (Config.edgePadding*2)) / 3.1; 
  }

  get parents() {
    return [].concat(this.parentsL, this.parentsC, this.parentsR);
  }

  toggleHighlight(select) {
    if (select === undefined) {
      this.isSelected = !this.isSelected;
    }
    else {
      this.isSelected = select;
    }

    if (this.isSelected) {
      this.svg.addClass('selected');
    }
    else {
      this.svg.removeClass('selected');
    }
  }

  hover() {
    this.svg.addClass('hovered');
  }
  unhover() {
    this.svg.removeClass('hovered');
  }

  toString() {
    return this.id;
  }

  static testMe(val) {
    return '' + val + ''  + val;
  }
}