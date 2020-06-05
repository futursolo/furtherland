let createTemplate = (s) => {
  let tpl = document.createElement("template");
  tpl.innerHTML = s;
  return tpl;
};

let createShadowDomOnlyElement = (elementName, tpl, jsInterface = HTMLElement, extendTag = null) => {
  class FlCustomElement extends jsInterface {
    connectedCallback() {
      if (!this.shadowRoot) {
        let shadowRoot = this.attachShadow({
          mode: "open"
        });
        shadowRoot.appendChild(tpl.content.cloneNode(true));
      }
    }
  }

  if (extendTag) {
    customElements.define(elementName, FlCustomElement, {
      extends: extendTag
    });
  } else {
    customElements.define(elementName, FlCustomElement);
  }
};

createShadowDomOnlyElement("fl-button", createTemplate(`
  <style>
    :host {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      flex-direction: row;

      border-radius: 500px;
      padding-left: 30px;
      padding-right: 30px;
      height: 40px;
      box-sizing: border-box;

      text-align: center;

      background-color: rgb(92, 184, 230);
      color: white;
      transition: background-color 0.20s;

      cursor: default;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    :host(:hover) {
      background-color: rgb(125, 198, 235);
    }

    :host(.fl-black) {
      background-color: rgb(5, 5, 5);
    }

    :host(.fl-black:hover) {
      background-color: rgb(50, 50, 50);
    }

    :host(.fl-red) {
      background-color: rgb(238, 82, 26);
    }

    :host(.fl-red:hover) {
      background-color: rgb(240, 99, 48);
    }

    :host(.fl-green) {
      background-color: rgb(50, 191, 50);
    }

    :host(.fl-green:hover) {
      background-color: rgb(91, 204, 91);
    }

    :host(.fl-yellow) {
      background-color: rgb(255, 193, 7);
    }

    :host(.fl-yellow:hover) {
      background-color: rgb(255, 205, 57);
    }
  </style>
  <slot></slot>`));

let flInputTpl = createTemplate(`
  <style>
    :host {
      height: 40px;

      display: inline-flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }

    input {
      height: 100%;
      flex-grow: 1;
      border-radius: 500px;
      border: 2px solid rgb(200, 200, 200);
      background-color: rgb(250, 250, 250);
      box-sizing: border-box;
      padding-left: 20px;
      padding-right: 20px;
      outline: 0;
      transition: border-color 0.20s, background-color 0.20s;
    }

    input:focus {
      border-color: rgb(125, 198, 235);
      background-color: rgb(255, 255, 255);
    }

    input:invalid {
      border: 2px solid rgb(238, 82, 26);
    }

    input:invalid:focus {
      border: 2px solid rgb(240, 99, 48);
      background-color: rgb(254, 237, 234);
    }
  </style>
  <input type="text">`);

customElements.define("fl-input", class extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      let shadowRoot = this.attachShadow({
        mode: "open"
      });
      shadowRoot.appendChild(flInputTpl.content.cloneNode(true));
      this.inputElement = shadowRoot.querySelector("input");
      shadowRoot.child
    }

    for (let i of this.constructor.observedAttributes) {
      this.attributeChangedCallback(i, "", this.getAttribute(i) || "");
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.inputElement) {
      return;
    }

    if (name == "disabled" || name == "required" || name == "readonly" || name == "autofocus") {
      let finalValue = "";
    } else if (name == "type") {
      if (newValue != "password") {
        let finalValue = "text";
      } else {
        let finalValue = "password";
      }
    } else {
      let finalValue = newValue || "";
    }

    if (this.hasAttribute(name)) {
      this.inputElement.setAttribute(name, newValue);
    } else {
      this.inputElement.removeAttribute(name);
    }
  }

  static get observedAttributes() {
    return [
      "maxlength", "minlength", "pattern", "placeholder", "readonly", "spellcheck",
      "autocorrect", "required", "autocomplete", "autofocus", "disabled", "form",
      "list", "name", "tabindex", "type", "value"
    ];
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(name) {
    this.setAttribute("name", name);
  }

  get type() {
    return this.getAttribute("type");
  }

  set type(name) {
    this.setAttribute("type", name);
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(val) {
    if (val) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  get autofocus() {
    return this.hasAttribute("autofocus");
  }

  set autofocus(val) {
    if (val) {
      this.setAttribute("autofocus", "");
    } else {
      this.removeAttribute("autofocus");
    }
  }

  get required() {
    return this.hasAttribute("required");
  }

  set required(val) {
    if (val) {
      this.setAttribute("required", "");
    } else {
      this.removeAttribute("required");
    }
  }

  get readOnly() {
    return this.hasAttribute("readonly");
  }

  set readOnly(val) {
    if (val) {
      this.setAttribute("readonly", "");
    } else {
      this.removeAttribute("readonly");
    }
  }

  get form() {
    return this.inputElement.form;
  }

  get value() {
    if (!this.inputElement) {
      return this.getAttribute("value") || "";
    }

    return this.inputElement.value;
  }

  set value(val) {
    if (!this.inputElement) {
      this.setAttribute("value", val);
    } else {
      this.inputElement.value = val;
    }
  }

  get validity() {
    if (!this.inputElement) {
      return false;
    }

    return this.inputElement.validity;
  }

  get validationMessage() {
    if (!this.inputElement) {
      return "";
    }

    return this.inputElement.validationMessage;
  }

  get willValidate() {
    if (!this.inputElement) {
      return this.hasAttribute("pattern") || this.hasAttribute("minlength") ||
        this.hasAttribute("maxlength");
    }

    return this.inputElement.willValidate;
  }

  get autocomplete() {
    return this.getAttribute("autocomplete");
  }

  set autocomplete(val) {
    this.setAttribute("autocomplete");
  }

  get maxLength() {
    return this.getAttribute("maxlength");
  }

  set maxLength(val) {
    this.setAttribute("maxlength");
  }

  get minLength() {
    return this.getAttribute("minlength");
  }

  set minLength(val) {
    this.setAttribute("minlength");
  }

  get pattern() {
    return this.getAttribute("pattern");
  }

  set pattern(val) {
    this.setAttribute("pattern");
  }

  get placeholder() {
    return this.getAttribute("placeholder");
  }

  set placeholder(val) {
    this.setAttribute("placeholder");
  }

  get selectionStart() {
    if (!this.inputElement) {
      return 0;
    }

    return this.inputElement.selectionStart;
  }

  set selectionStart(val) {
    if (!this.inputElement) {
      return;
    }

    this.inputElement.selectionStart = val;
  }

  get selectionEnd() {
    if (!this.inputElement) {
      return 0;
    }

    return this.inputElement.selectionEnd;
  }

  set selectionEnd(val) {
    if (!this.inputElement) {
      return;
    }

    this.inputElement.selectionEnd = val;
  }

  get selectionDirection() {
    if (!this.inputElement) {
      return "none";
    }

    return this.inputElement.selectionDirection;
  }

  set selectionDirection(val) {
    if (!this.inputElement) {
      return;
    }

    this.inputElement.selectionDirection = val;
  }
});

createShadowDomOnlyElement("fl-card", createTemplate(`
  <style>
    :host {
      display: block;
      border-radius: 10px;
      box-shadow: 0 0 10px 0 rgba(150, 150, 150, 0.8);
      background-color: white;
      box-sizing: border-box;
      padding: 20px;
      margin: 20px;
    }

    :host(.fl-no-shadow) {
      box-shadow: none;
    }

    :host(.fl-no-padding) {
      padding: 0;
    }

    :host(.fl-no-margin) {
      margin: 0;
    }

    @supports (backdrop-filter: blur(100px) saturate(180%)) or (-webkit-backdrop-filter: blur(100px) saturate(180%)) {
      :host {
        background-color: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(100px) saturate(180%);
        -webkit-backdrop-filter: blur(100px) saturate(180%)
      }
    }
  </style>
  <slot></slot>`));