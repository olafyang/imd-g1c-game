import * as p5 from "./p5.js";

const btnDefaultStyle = {
  shape: "rect",
  normal: {
    strokeColor: "#000000",
    fillColor: "#cccccc",
    strokeWeight: 2,
    cornerRadius: 0,
    textLabel: "Normal",
    textFillColor: "#ffffff",
    textStrokeWeight: 0,
    textStrokeColor: "#ffffff",
    textSize: 15,
    textAlignH: "center",
    textAlignV: "center",
  },
  pressed: {
    strokeColor: "#000000",
    fillColor: "#303030",
    strokeWeight: 2,
    cornerRadius: 0,
    textLabel: "Pressed",
    textFillColor: "#ffffff",
    textStrokeWeight: 0,
    textStrokeColor: "#ffffff",
    textSize: 15,
    textAlignH: "center",
    textAlignV: "center",
  },
  hover: {
    strokeColor: "#000000",
    fillColor: "#aaaaaa",
    strokeWeight: 2,
    cornerRadius: 0,
    textLabel: "Hover",
    textFillColor: "#ffffff",
    textStrokeWeight: 0,
    textStrokeColor: "#ffffff",
    textSize: 15,
    textAlignH: "center",
    textAlignV: "center",
  },
  disabled: {
    strokeColor: "#000000",
    fillColor: "#000000",
    strokeWeight: 2,
    cornerRadius: 0,
    textLabel: "Hover",
    textFillColor: "#ffffff",
    textStrokeWeight: 0,
    textStrokeColor: "#ffffff",
    textSize: 15,
    textAlignH: "center",
    textAlignV: "center",
  },
};

const sliderDefaultStyle = {
  track: {
    endingType: "none",
    size: 50,
    strokeWeight: 2,
    strokeColor: "#000000",
    fillColor: "#ffffff",
    valFillColor: "#eb4034",
  },
};

function mergeStyle(style1, style2) {
  let newStyle = {};
  for (const key of Object.keys(style1)) {
    if (key in style2) {
      newStyle[key] = { ...style1[key], ...style2[key] };
    }
  }

  return newStyle;
}

export class UI {
  sketch;
  elements;

  constructor() {
    this.elements = {};
  }

  addElement(uiElement) {
    let id = 0;
    do {
      id = Math.floor(Math.random() * 1e6);
    } while (this.elements[id] != undefined);
    this.elements[id] = uiElement;
    return id;
  }

  removeElement(id) {
    if (this.elements[id] != undefined) {
      delete this.elements[id];
      return id;
    } else return 0;
  }

  activate() {
    Object.values(this.elements).forEach((element) => {
      element.activate();
    });
  }
}

export default class UIElementFactory {
  context;
  constructor(context) {
    // Assumes global mdoe if no context given
    if (!context) {
      this.context = window;
    } else {
      this.context = context;
    }
  }

  newButton(
    type,
    posX,
    posY,
    width,
    height,
    {
      onPressCallback = () => {},
      onReleaseCallback = () => {},
      isVisible = true,
      isEnabled = true,
      style = btnDefaultStyle,
    }
  ) {
    return new Button(
      this.context,
      type,
      posX,
      posY,
      onPressCallback,
      onReleaseCallback,
      width,
      height,
      isVisible,
      isEnabled,
      mergeStyle(btnDefaultStyle, style)
    );
  }

  newSlider(
    posX,
    posY,
    length,
    width,
    orientation,
    value,
    {
      thumbType = "roundBtn",
      onValueChangeCallback = (val, diff, valRaw, diffRaw) => {},
      style = sliderDefaultStyle,
      isVisible = true,
      isEnabled = true,
      allowDirectValueSet = true,
    }
  ) {
    return new Slider(
      this.context,
      posX,
      posY,
      length,
      width,
      orientation,
      value,
      thumbType,
      onValueChangeCallback,
      mergeStyle(sliderDefaultStyle, style),
      isVisible,
      isEnabled,
      allowDirectValueSet
    );
  }
}

class UIElement {
  context;
  constructor(context) {
    this.context = context;
  }
}

class Button extends UIElement {
  type;
  posX;
  posY;
  width;
  height;
  style;
  onPressCallback;
  onReleaseCallback;
  isMouseHover;
  isPressed;
  isVisible;

  constructor(
    context,
    type,
    posX,
    posY,
    onPressCallback,
    onReleaseCallback,
    width,
    height,
    isVisible,
    isEnabled,
    style
  ) {
    super(context);
    this.type = type;
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;
    this.onPressCallback = onPressCallback;
    this.onReleaseCallback = onReleaseCallback;
    this.isVisible = isVisible;
    this.isEnabled = isEnabled;
    this.style = style;
  }

  #drawBtn(btnType, btnWidth, btnHeight, style) {
    this.context.fill(style.fillColor);
    this.context.stroke(style.strokeColor);
    this.context.strokeWeight(style.strokeWeight);

    if (btnType === "rect") {
      this.context.rect(0, 0, btnWidth, btnHeight, style.cornerRadius);
    } else if (btnType === "ellipse") {
      this.context.ellipse(btnWidth / 2, btnHeight / 2, btnWidth, btnHeight);
    }

    let textPosX = 0;
    let textPosY = style.textSize;
    if (style.textLabel) {
      this.context.push();
      //
      switch (style.textAlignH.toLowerCase()) {
        case "left":
          style.textAlignH = this.context.LEFT;
          break;
        case "center":
          style.textAlignH = this.context.CENTER;
          break;
        case "right":
          style.textAlignH = this.context.RIGHT;
          break;
      }
      switch (style.textAlignV.toLowerCase()) {
        case "top":
          style.textAlignV = this.context.TOP;
          break;
        case "center":
          style.textAlignV = this.context.CENTER;
          break;
        case "bottom":
          style.textAlignV = this.context.BOTTOM;
          break;
        case "baseline":
          style.textAlignV = this.context.BASELINE;
      }

      this.context.fill(style.textFillColor);
      this.context.strokeWeight(style.textStrokeWeight);
      this.context.stroke(style.textStrokeColor);
      this.context.textAlign(style.textAlignH, style.textAlignV);
      this.context.textSize(style.textSize);
      this.context.text(style.textLabel, 0, 0, this.width, this.height);
      //
      this.context.pop();
    }
  }

  activate(offsetX = 0, offsetY = 0) {
    this.context.push();
    this.context.translate(this.posX, this.posY);

    //
    if (this.isEnabled) {
      if (
        this.context.mouseX > this.posX + offsetX &&
        this.context.mouseY > this.posY + offsetY &&
        this.context.mouseX < this.posX + offsetX + this.width &&
        this.context.mouseY < this.posY + offsetY + this.height
      ) {
        if (this.context.mouseIsPressed) {
          // Pressed State
          this.#drawBtn(this.type, this.width, this.height, this.style.pressed);
          this.isPressed = true;
          this.onPressCallback();
        } else {
          // Hover state
          this.#drawBtn(this.type, this.width, this.height, this.style.hover);
          if (this.isPressed) {
            this.onReleaseCallback();
            this.isPressed = false;
          }
        }
      } else {
        // Normal state
        this.#drawBtn(this.type, this.width, this.height, this.style.normal);
      }
    } else {
      this.#drawBtn(this.type, this.width, this.height, this.style.disabled);
    }
    //
    this.context.pop();
  }
}

class Slider extends UIElement {
  posX;
  posY;
  length;
  orientation;
  thumb;
  value;
  style;
  isVisible;
  isEnabled;
  onValueChangeCallback;
  style;
  #value;

  constructor(
    context,
    posX,
    posY,
    length,
    width,
    orientation,
    value,

    thumbType,
    onValueChangeCallback,
    style,
    isVisible,
    isEnabled,
    allowDirectValueSet
  ) {
    super(context);
    this.posX = posX;
    this.posY = posY;
    this.length = length;
    this.width = width;
    this.orientation = orientation.toLowerCase(orientation);
    this.onValueChangeCallback = onValueChangeCallback;
    this.style = mergeStyle(sliderDefaultStyle, style);
    this.isVisible = isVisible;
    this.isEnabled = isEnabled;
    this.#value = value > 1 ? value / 100 : value;

    if (thumbType == "roundBtn") {
      let thumbSize = 50;

      let [thumbX, thumbY] = this.#calcThumbPosition(thumbSize);
      this.thumb = new Button(
        this.context,
        "ellipse",
        thumbX,
        thumbY,
        () => {
          if (this.orientation.toLowerCase() === "horizontal") {
            let valRaw = this.context.mouseX;
            let diffRaw = this.context.mouseX - this.context.pmouseX;
            let diff = diffRaw / this.length;
            let val = this.#value + diff;
            this.setValue(val);
            this.onValueChangeCallback(val, diff, valRaw, diffRaw);
          } else {
            let valRaw = this.context.mouseY;
            let diffRaw = this.context.mouseY - this.context.pmouseY;
            let diff = diffRaw / this.length;
            let val = this.#value + diff;
            this.setValue(val);
            this.onValueChangeCallback(val, diff, valRaw, diffRaw);
          }
        },
        () => {},
        thumbSize,
        thumbSize,
        true,
        true,
        btnDefaultStyle
      );
    } else if (thumbType === "none") {
      this.thumb = undefined;
    }
  }

  #calcThumbPosition(thumbSize) {
    let thumbX;
    let thumbY;
    switch (this.orientation.toLowerCase()) {
      case "horizontal":
        thumbX = -thumbSize / 2 + this.#value * this.length;
        thumbY = -0.5 * thumbSize + this.width / 2;
        break;
      case "vertical":
        thumbX = -0.5 * thumbSize + this.width / 2;
        thumbY = -thumbSize / 2 + this.#value * this.length;
        break;
      // TODO: throw error if none above given
    }
    return [thumbX, thumbY];
  }

  setValue(val, timeToComplete) {
    if (val > 1) val = 1;
    if (val < 0) val = 0;

    //TODO implement timeToComplete
    this.#value = val;
  }

  getValue() {
    return this.#value;
  }

  setStyle(style) {
    this.style = mergeStyle(this.style, style);
  }

  #drawSlider() {
    this.context.fill(this.style.track.fillColor);
    this.context.stroke(this.style.track.strokeColor);
    this.context.strokeWeight(this.style.track.strokeWeight);

    if (this.orientation.toLowerCase() === "horizontal") {
      this.context.rect(0, 0, this.length, this.width);

      if (this.style.track.valFillColor != "none") {
        this.context.push();
        this.context.noStroke();
        this.context.fill(this.style.track.valFillColor);
        this.context.rect(
          0,
          this.style.track.strokeWeight / 2,
          this.length * this.#value,
          this.width - this.style.track.strokeWeight
        );
        this.context.pop();
      }

      if (this.style.track.endingType === "circle") {
        // TODO make ending reflect current slider value
        this.context.circle(0, this.width / 2, this.width);
        this.context.circle(this.length, this.width / 2, this.width);
        this.context.push();
        this.context.noStroke();
        this.context.rect(
          0,
          this.style.track.strokeWeight / 2,
          this.width,
          this.width - this.style.track.strokeWeight
        );
        this.context.rect(
          this.length - this.width,
          this.style.track.strokeWeight / 2,
          this.width,
          this.width - this.style.track.strokeWeight
        );
        this.context.pop();
      }
    } else {
      this.context.rect(0, 0, this.width, this.length);

      if (this.style.track.valFillColor !== "none") {
        this.context.push();
        this.context.noStroke();
        this.context.fill(this.style.track.valFillColor);
        this.context.rect(
          this.style.track.strokeWeight / 2,
          0,
          this.width - this.style.track.strokeWeight,
          this.length * this.#value
        );
        this.context.pop();
      }

      if (this.style.track.endingType === "circle") {
        // TODO make ending reflect current slider value
        circle(this.width / 2, 0, this.width);
        circle(this.width / 2, this.length, this.width);
        push();
        noStroke();
        rect(
          this.style.track.strokeWeight / 2,
          0,
          this.width - this.style.track.strokeWeight,
          this.width
        );
        rect(
          this.style.track.strokeWeight / 2,
          this.length - this.width,
          this.width - this.style.track.strokeWeight,
          this.width
        );
        pop();
      }
    }
    if (this.thumb) this.thumb.activate(this.posX, this.posY);
  }

  activate() {
    this.context.push();
    this.context.translate(this.posX, this.posY);
    //

    if (this.thumb) {
      let [thumbX, thumbY] = this.#calcThumbPosition(this.thumb.width);
      this.thumb.posX = thumbX;
      this.thumb.posY = thumbY;
    }
    this.#drawSlider();
    //
    this.context.pop();
  }
}
