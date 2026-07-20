// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e6, o5) {
    if (this._$cssResult$ = true, o5 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e6;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e6 = void 0 !== s4 && 1 === s4.length;
      e6 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e6 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e6) => {
  const o5 = 1 === t4.length ? t4[0] : e6.reduce((e7, s4, o6) => e7 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o6 + 1], t4[0]);
  return new n(o5, t4, s);
};
var S = (s4, o5) => {
  if (e) s4.adoptedStyleSheets = o5.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e6 of o5) {
    const o6 = document.createElement("style"), n4 = t.litNonce;
    void 0 !== n4 && o6.setAttribute("nonce", n4), o6.textContent = e6.cssText, s4.appendChild(o6);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e6 = "";
  for (const s4 of t5.cssRules) e6 += s4.cssText;
  return r(e6);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i7 = t4;
  switch (s4) {
    case Boolean:
      i7 = null !== t4;
      break;
    case Number:
      i7 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i7 = JSON.parse(t4);
      } catch (t5) {
        i7 = null;
      }
  }
  return i7;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i7 = Symbol(), h3 = this.getPropertyDescriptor(t4, i7, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i7) {
    const { get: e6, set: r4 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e6, set(s5) {
      const h3 = e6?.call(this);
      r4?.call(this, s5), this.requestUpdate(t4, h3, i7);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i7 of s4) this.createProperty(i7, t5[i7]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i7] of s4) this.elementProperties.set(t5, i7);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i7 = this._$Eu(t5, s4);
      void 0 !== i7 && this._$Eh.set(i7, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i7 = [];
    if (Array.isArray(s4)) {
      const e6 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e6) i7.unshift(c(s5));
    } else void 0 !== s4 && i7.push(c(s4));
    return i7;
  }
  static _$Eu(t4, s4) {
    const i7 = s4.attribute;
    return false === i7 ? void 0 : "string" == typeof i7 ? i7 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i7 of s4.keys()) this.hasOwnProperty(i7) && (t4.set(i7, this[i7]), delete this[i7]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i7) {
    this._$AK(t4, i7);
  }
  _$ET(t4, s4) {
    const i7 = this.constructor.elementProperties.get(t4), e6 = this.constructor._$Eu(t4, i7);
    if (void 0 !== e6 && true === i7.reflect) {
      const h3 = (void 0 !== i7.converter?.toAttribute ? i7.converter : u).toAttribute(s4, i7.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e6) : this.setAttribute(e6, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i7 = this.constructor, e6 = i7._$Eh.get(t4);
    if (void 0 !== e6 && this._$Em !== e6) {
      const t5 = i7.getPropertyOptions(e6), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e6;
      const r4 = h3.fromAttribute(s4, t5.type);
      this[e6] = r4 ?? this._$Ej?.get(e6) ?? r4, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i7, e6 = false, h3) {
    if (void 0 !== t4) {
      const r4 = this.constructor;
      if (false === e6 && (h3 = this[t4]), i7 ?? (i7 = r4.getPropertyOptions(t4)), !((i7.hasChanged ?? f)(h3, s4) || i7.useDefault && i7.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r4._$Eu(t4, i7)))) return;
      this.C(t4, s4, i7);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i7, reflect: e6, wrapped: h3 }, r4) {
    i7 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r4 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r4) || (this._$AL.has(t4) || (this.hasUpdated || i7 || (s4 = void 0), this._$AL.set(t4, s4)), true === e6 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i7] of t5) {
        const { wrapped: t6 } = i7, e6 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e6 || this.C(s5, void 0, i7, e6);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t5) => this._$ET(t5, this[t5]))), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i7, ...s4) => ({ _$litType$: t4, strings: i7, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i7) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i7) : i7;
}
var N = (t4, i7) => {
  const s4 = t4.length - 1, e6 = [];
  let n4, l3 = 2 === i7 ? "<svg>" : 3 === i7 ? "<math>" : "", c4 = v;
  for (let i8 = 0; i8 < s4; i8++) {
    const s5 = t4[i8];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n4 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n4 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n4 = void 0);
    const x2 = c4 === p2 && t4[i8 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e6.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i8 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i7 ? "</svg>" : 3 === i7 ? "</math>" : "")), e6];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i7 }, e6) {
    let r4;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i7);
    if (this.el = _S.createElement(f3, e6), P.currentNode = this.el.content, 2 === i7 || 3 === i7) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r4 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r4.nodeType) {
        if (r4.hasAttributes()) for (const t5 of r4.getAttributeNames()) if (t5.endsWith(h2)) {
          const i8 = v2[a3++], s4 = r4.getAttribute(t5).split(o3), e7 = /([.?@])?(.*)/.exec(i8);
          d3.push({ type: 1, index: l3, name: e7[2], strings: s4, ctor: "." === e7[1] ? I : "?" === e7[1] ? L : "@" === e7[1] ? z : H }), r4.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r4.removeAttribute(t5));
        if (y2.test(r4.tagName)) {
          const t5 = r4.textContent.split(o3), i8 = t5.length - 1;
          if (i8 > 0) {
            r4.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i8; s4++) r4.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r4.append(t5[i8], c3());
          }
        }
      } else if (8 === r4.nodeType) if (r4.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r4.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i7) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i7, s4 = t4, e6) {
  if (i7 === E) return i7;
  let h3 = void 0 !== e6 ? s4._$Co?.[e6] : s4._$Cl;
  const o5 = a2(i7) ? void 0 : i7._$litDirective$;
  return h3?.constructor !== o5 && (h3?._$AO?.(false), void 0 === o5 ? h3 = void 0 : (h3 = new o5(t4), h3._$AT(t4, s4, e6)), void 0 !== e6 ? (s4._$Co ?? (s4._$Co = []))[e6] = h3 : s4._$Cl = h3), void 0 !== h3 && (i7 = M(t4, h3._$AS(t4, i7.values), h3, e6)), i7;
}
var R = class {
  constructor(t4, i7) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i7;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i7 }, parts: s4 } = this._$AD, e6 = (t4?.creationScope ?? l2).importNode(i7, true);
    P.currentNode = e6;
    let h3 = P.nextNode(), o5 = 0, n4 = 0, r4 = s4[0];
    for (; void 0 !== r4; ) {
      if (o5 === r4.index) {
        let i8;
        2 === r4.type ? i8 = new k(h3, h3.nextSibling, this, t4) : 1 === r4.type ? i8 = new r4.ctor(h3, r4.name, r4.strings, this, t4) : 6 === r4.type && (i8 = new Z(h3, this, t4)), this._$AV.push(i8), r4 = s4[++n4];
      }
      o5 !== r4?.index && (h3 = P.nextNode(), o5++);
    }
    return P.currentNode = l2, e6;
  }
  p(t4) {
    let i7 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i7), i7 += s4.strings.length - 2) : s4._$AI(t4[i7])), i7++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i7, s4, e6) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i7, this._$AM = s4, this.options = e6, this._$Cv = e6?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i7 = this._$AM;
    return void 0 !== i7 && 11 === t4?.nodeType && (t4 = i7.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i7 = this) {
    t4 = M(this, t4, i7), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i7, _$litType$: s4 } = t4, e6 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e6) this._$AH.p(i7);
    else {
      const t5 = new R(e6, this), s5 = t5.u(this.options);
      t5.p(i7), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i7 = C.get(t4.strings);
    return void 0 === i7 && C.set(t4.strings, i7 = new S2(t4)), i7;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i7 = this._$AH;
    let s4, e6 = 0;
    for (const h3 of t4) e6 === i7.length ? i7.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i7[e6], s4._$AI(h3), e6++;
    e6 < i7.length && (this._$AR(s4 && s4._$AB.nextSibling, e6), i7.length = e6);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i7, s4, e6, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i7, this._$AM = e6, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i7 = this, s4, e6) {
    const h3 = this.strings;
    let o5 = false;
    if (void 0 === h3) t4 = M(this, t4, i7, 0), o5 = !a2(t4) || t4 !== this._$AH && t4 !== E, o5 && (this._$AH = t4);
    else {
      const e7 = t4;
      let n4, r4;
      for (t4 = h3[0], n4 = 0; n4 < h3.length - 1; n4++) r4 = M(this, e7[s4 + n4], i7, n4), r4 === E && (r4 = this._$AH[n4]), o5 || (o5 = !a2(r4) || r4 !== this._$AH[n4]), r4 === A ? t4 = A : t4 !== A && (t4 += (r4 ?? "") + h3[n4 + 1]), this._$AH[n4] = r4;
    }
    o5 && !e6 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i7, s4, e6, h3) {
    super(t4, i7, s4, e6, h3), this.type = 5;
  }
  _$AI(t4, i7 = this) {
    if ((t4 = M(this, t4, i7, 0) ?? A) === E) return;
    const s4 = this._$AH, e6 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e6);
    e6 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i7, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i7, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var j = { M: h2, P: o3, A: n3, C: 1, L: N, R, D: d2, V: M, I: k, H, N: L, U: z, B: I, F: Z };
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.2");
var D = (t4, i7, s4) => {
  const e6 = s4?.renderBefore ?? i7;
  let h3 = e6._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e6._$litPart$ = h3 = new k(i7.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t4 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t4.firstChild), t4;
  }
  update(t4) {
    const r4 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r4, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// node_modules/lit-html/directive.js
var e4 = (t4) => (...e6) => ({ _$litDirective$: t4, values: e6 });
var i5 = class {
  constructor(t4) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t4, e6, i7) {
    this._$Ct = t4, this._$AM = e6, this._$Ci = i7;
  }
  _$AS(t4, e6) {
    return this.update(t4, e6);
  }
  update(t4, e6) {
    return this.render(...e6);
  }
};

// node_modules/lit-html/directive-helpers.js
var { I: t3 } = j;
var m2 = {};
var p3 = (o5, t4 = m2) => o5._$AH = t4;

// node_modules/lit-html/directives/keyed.js
var i6 = e4(class extends i5 {
  constructor() {
    super(...arguments), this.key = A;
  }
  render(r4, t4) {
    return this.key = r4, t4;
  }
  update(r4, [t4, e6]) {
    return t4 !== this.key && (p3(r4), this.key = t4), e6;
  }
});

// src/celestial-positions.ts
var PI = Math.PI;
var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var asin = Math.asin;
var atan2 = Math.atan2;
var rad = PI / 180;
var dayMs = 1e3 * 60 * 60 * 24;
var J1970 = 2440588;
var J2000 = 2451545;
function toJulian(date) {
  return date.valueOf() / dayMs - 0.5 + J1970;
}
function toDays(date) {
  return toJulian(date) - J2000;
}
var e5 = rad * 23.4397;
function rightAscension(l3, b3) {
  return atan2(sin(l3) * cos(e5) - tan(b3) * sin(e5), cos(l3));
}
function declination(l3, b3) {
  return asin(sin(b3) * cos(e5) + cos(b3) * sin(e5) * sin(l3));
}
function altitude(H2, phi, dec) {
  return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H2));
}
function siderealTime(d3, lw) {
  return rad * (280.16 + 360.9856235 * d3) - lw;
}
function solarMeanAnomaly(d3) {
  return rad * (357.5291 + 0.98560028 * d3);
}
function eclipticLongitude(M2) {
  const C2 = rad * (1.9148 * sin(M2) + 0.02 * sin(2 * M2) + 3e-4 * sin(3 * M2));
  const P2 = rad * 102.9372;
  return M2 + C2 + P2 + PI;
}
function sunCoords(d3) {
  const M2 = solarMeanAnomaly(d3);
  const L2 = eclipticLongitude(M2);
  return {
    dec: declination(L2, 0),
    ra: rightAscension(L2, 0)
  };
}
function solarAltitudeDegrees(latDeg, lonDeg, when) {
  const lw = rad * -lonDeg;
  const phi = rad * latDeg;
  const d3 = toDays(when);
  const c4 = sunCoords(d3);
  const H2 = siderealTime(d3, lw) - c4.ra;
  return altitude(H2, phi, c4.dec) / rad;
}
var SUNRISE_SET_THRESHOLD_DEG = -0.833;

// src/celestial-curve-layout.ts
function midpointMs(startIso, endIso) {
  const a3 = new Date(startIso).getTime();
  const b3 = new Date(endIso).getTime();
  if (!Number.isFinite(a3) || !Number.isFinite(b3)) {
    return Number.NaN;
  }
  return (a3 + b3) / 2;
}
function unitArcToY(u3, plotTop, baselineY) {
  const span = baselineY - plotTop;
  const margin = span * 0.05;
  const usable = Math.max(span - 2 * margin, 1);
  const t4 = Math.max(0, Math.min(1, u3));
  return baselineY - margin - t4 * usable;
}
var CELESTIAL_SUBSTEPS = 28;
function densifySampleChord(row, unitAtMs, plotTop, baselineY) {
  if (row.length === 0) {
    return [];
  }
  if (row.length === 1) {
    return [
      {
        x: row[0].x,
        y: unitArcToY(unitAtMs(row[0].midMs), plotTop, baselineY),
        ms: row[0].midMs
      }
    ];
  }
  const out = [];
  const lastI = row.length - 2;
  for (let i7 = 0; i7 <= lastI; i7 += 1) {
    const a3 = row[i7];
    const b3 = row[i7 + 1];
    const jStart = i7 === 0 ? 0 : 1;
    for (let j2 = jStart; j2 < CELESTIAL_SUBSTEPS; j2 += 1) {
      const t4 = j2 / (CELESTIAL_SUBSTEPS - 1);
      const ms = a3.midMs + (b3.midMs - a3.midMs) * t4;
      const x2 = a3.x + (b3.x - a3.x) * t4;
      out.push({ x: x2, y: unitArcToY(unitAtMs(ms), plotTop, baselineY), ms });
    }
  }
  return out;
}
function buildLinearPolylinePath(points) {
  if (points.length === 0) {
    return null;
  }
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }
  let d3 = `M ${points[0].x} ${points[0].y}`;
  for (let i7 = 1; i7 < points.length; i7 += 1) {
    d3 += ` L ${points[i7].x} ${points[i7].y}`;
  }
  return d3;
}
function buildCatmullRomBezierPath(points) {
  const n4 = points.length;
  if (n4 === 0) {
    return null;
  }
  if (n4 < 3) {
    return buildLinearPolylinePath(points);
  }
  let d3 = `M ${points[0].x} ${points[0].y}`;
  for (let i7 = 0; i7 < n4 - 1; i7 += 1) {
    const p0 = points[i7 === 0 ? 0 : i7 - 1];
    const p1 = points[i7];
    const p22 = points[i7 + 1];
    const p32 = points[i7 + 2] ?? points[i7 + 1];
    const cp1x = p1.x + (p22.x - p0.x) / 6;
    const cp1y = p1.y + (p22.y - p0.y) / 6;
    const cp2x = p22.x - (p32.x - p1.x) / 6;
    const cp2y = p22.y - (p32.y - p1.y) / 6;
    d3 += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p22.x} ${p22.y}`;
  }
  return d3;
}
function appendSmoothSegment(acc, segment) {
  const p4 = buildCatmullRomBezierPath(segment);
  if (p4) {
    acc.push(p4);
  }
}
function appendLinearSegment(acc, segment) {
  const p4 = buildLinearPolylinePath(segment);
  if (p4) {
    acc.push(p4);
  }
}
function appendSunSegment(acc, points) {
  if (points.length === 0) {
    return;
  }
  appendSmoothSegment(acc, points);
}
function buildCelestialTrackLayout(series, bars, plotTop, baselineY, observer, panelKey) {
  if (series.points.length === 0 || bars.length !== series.points.length) {
    return null;
  }
  const { latitude: lat, longitude: lon } = observer;
  const samples = [];
  for (let i7 = 0; i7 < series.points.length; i7 += 1) {
    const pt = series.points[i7];
    const bar = bars[i7];
    const mid = midpointMs(pt.start, pt.end);
    if (!Number.isFinite(mid)) {
      return null;
    }
    const when = new Date(mid);
    const x2 = bar.x + bar.width / 2;
    samples.push({
      x: x2,
      midMs: mid,
      sun: solarAltitudeDegrees(lat, lon, when)
    });
  }
  const thr = SUNRISE_SET_THRESHOLD_DEG;
  const sunAltsPositive = samples.map((s4) => s4.sun).filter((a3) => a3 > 0);
  const maxSunPositive = sunAltsPositive.length > 0 ? Math.max(...sunAltsPositive, 12) : 12;
  const sunVisualScaleDeg = Math.max(56, maxSunPositive);
  function sunElevationUnitAtMs(ms) {
    const alt = Math.max(0, solarAltitudeDegrees(lat, lon, new Date(ms)));
    return Math.min(1, alt / sunVisualScaleDeg);
  }
  const sunFragments = [];
  const moonFragments = [];
  const nightDepths = samples.map((s4) => Math.max(0, thr - s4.sun)).filter((v2) => v2 > 0);
  const maxNightDepth = nightDepths.length > 0 ? Math.max(...nightDepths, 10) : 10;
  function nightDepthUnitAtMs(ms) {
    const alt = solarAltitudeDegrees(lat, lon, new Date(ms));
    const depth = Math.max(0, thr - alt);
    return Math.min(1, depth / Math.max(16, maxNightDepth));
  }
  let moonRunSamples = [];
  const flushMoonRun = () => {
    if (moonRunSamples.length === 0) {
      return;
    }
    const nightRun = densifySampleChord(moonRunSamples, nightDepthUnitAtMs, plotTop, baselineY);
    appendLinearSegment(moonFragments, nightRun);
    moonRunSamples = [];
  };
  let sunRunSamples = [];
  const flushSunRun = () => {
    if (sunRunSamples.length === 0) {
      return;
    }
    const sunRun = densifySampleChord(sunRunSamples, sunElevationUnitAtMs, plotTop, baselineY);
    appendSunSegment(sunFragments, sunRun);
    sunRunSamples = [];
  };
  for (let i7 = 0; i7 < samples.length; i7 += 1) {
    const s4 = samples[i7];
    if (s4.sun < thr) {
      if (sunRunSamples.length > 0) {
        flushSunRun();
      }
      moonRunSamples.push(s4);
    } else {
      if (moonRunSamples.length > 0) {
        flushMoonRun();
      }
      sunRunSamples.push(s4);
    }
  }
  if (moonRunSamples.length > 0) {
    flushMoonRun();
  }
  if (sunRunSamples.length > 0) {
    flushSunRun();
  }
  const sunPath = sunFragments.length > 0 ? sunFragments.join(" ") : null;
  const moonPath = moonFragments.length > 0 ? moonFragments.join(" ") : null;
  if (!sunPath && !moonPath) {
    return null;
  }
  return {
    sunPath,
    moonPath,
    sunGradientId: `celestial-sun-stroke-${panelKey}`,
    moonGradientId: `celestial-moon-stroke-${panelKey}`
  };
}

// src/temperature-colors.ts
var TEMPERATURE_GRADIENT_STOPS = [
  { tempF: 0, base: "#1D4D96", top: "#4A7BC8", bottom: "#173E79" },
  { tempF: 5, base: "#2256A0", top: "#5285D1", bottom: "#194481" },
  { tempF: 10, base: "#2860AA", top: "#5A8FDB", bottom: "#1E4A8A" },
  { tempF: 15, base: "#2E69B4", top: "#6298E4", bottom: "#245193" },
  { tempF: 20, base: "#3472BE", top: "#6AA1EC", bottom: "#2A589B" },
  { tempF: 25, base: "#3A7BC8", top: "#72AAF0", bottom: "#315FA4" },
  { tempF: 30, base: "#4185D1", top: "#79B3EE", bottom: "#386AAD" },
  { tempF: 35, base: "#4A92D6", top: "#81BDEB", bottom: "#4176B3" },
  { tempF: 40, base: "#56A0D8", top: "#89C6E7", bottom: "#4C82B7" },
  { tempF: 45, base: "#63ADD7", top: "#91CEE3", bottom: "#588EBA" },
  { tempF: 50, base: "#71B9D4", top: "#99D5DE", bottom: "#659ABD" },
  { tempF: 55, base: "#7CC4CF", top: "#A0DAD7", bottom: "#73A6BB" },
  { tempF: 60, base: "#63C7C0", top: "#7FD3CD", bottom: "#55B2AB" },
  { tempF: 65, base: "#63C79F", top: "#7FD3B3", bottom: "#55B18D" },
  { tempF: 70, base: "#78C685", top: "#92D19C", bottom: "#67B175" },
  { tempF: 75, base: "#A9C85D", top: "#BED374", bottom: "#93B14F" },
  { tempF: 80, base: "#D8C650", top: "#E2D16B", bottom: "#BFAD45" },
  { tempF: 85, base: "#F2AF5C", top: "#F6C37C", bottom: "#D89850" },
  { tempF: 90, base: "#EF7D45", top: "#F39A68", bottom: "#D56D3B" },
  { tempF: 95, base: "#E55A3C", top: "#EB7B60", bottom: "#CB4D34" },
  { tempF: 100, base: "#D94C34", top: "#E06D59", bottom: "#C0432D" },
  { tempF: 105, base: "#CF422F", top: "#D86556", bottom: "#BA3B2A" },
  { tempF: 110, base: "#C43A2B", top: "#CE5D50", bottom: "#B03627" },
  { tempF: 115, base: "#B93429", top: "#C55A4D", bottom: "#A52F25" }
];
function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}
function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16)
  ];
}
function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}
function interpolateHex(startHex, endHex, ratio) {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);
  return rgbToHex(
    start[0] + (end[0] - start[0]) * ratio,
    start[1] + (end[1] - start[1]) * ratio,
    start[2] + (end[2] - start[2]) * ratio
  );
}
function midpointHex(startHex, endHex) {
  return interpolateHex(startHex, endHex, 0.5);
}
function resolveTemperatureGradientColors(tempF) {
  const boundedTemp = clamp(
    Number.isFinite(tempF) ? tempF : TEMPERATURE_GRADIENT_STOPS[0].tempF,
    TEMPERATURE_GRADIENT_STOPS[0].tempF,
    TEMPERATURE_GRADIENT_STOPS[TEMPERATURE_GRADIENT_STOPS.length - 1].tempF
  );
  const upperIndex = TEMPERATURE_GRADIENT_STOPS.findIndex((stop) => boundedTemp <= stop.tempF);
  if (upperIndex <= 0) {
    const first = TEMPERATURE_GRADIENT_STOPS[0];
    return { base: first.base, top: first.top, bottom: first.bottom };
  }
  const upper = TEMPERATURE_GRADIENT_STOPS[upperIndex];
  const lower = TEMPERATURE_GRADIENT_STOPS[upperIndex - 1];
  if (boundedTemp === upper.tempF) {
    return { base: upper.base, top: upper.top, bottom: upper.bottom };
  }
  const ratio = (boundedTemp - lower.tempF) / (upper.tempF - lower.tempF);
  return {
    base: interpolateHex(lower.base, upper.base, ratio),
    top: interpolateHex(lower.top, upper.top, ratio),
    bottom: interpolateHex(lower.bottom, upper.bottom, ratio)
  };
}
function resolveTemperatureGradientFillColors(tempF) {
  const colors = resolveTemperatureGradientColors(tempF);
  const edgeMidpoint = midpointHex(colors.top, colors.bottom);
  return {
    top: colors.top,
    // Bias the visible transition toward the top/bottom blend so the bars
    // read more like a vertical edge-to-edge temperature gradient.
    transition: interpolateHex(edgeMidpoint, colors.base, 0.3),
    bottom: colors.bottom
  };
}

// src/utils.ts
var WEATHER_RISK_BRIDGE_SENSOR_PREFIX = "sensor.weather_risk_bridge_";
var WEATHER_RISK_BRIDGE_WEATHER_PREFIX = "weather.weather_risk_bridge_";
function normalizeLocationKey(location) {
  return location.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function baseEntityIdForLocation(location) {
  const locationKey = normalizeLocationKey(location);
  return locationKey ? `${WEATHER_RISK_BRIDGE_SENSOR_PREFIX}${locationKey}` : "";
}
function chartEntityIdForLocation(location, rangeHours) {
  const baseEntityId = baseEntityIdForLocation(location);
  return baseEntityId ? entityIdForRange(baseEntityId, rangeHours) : "";
}
function weatherEntityIdForLocation(location) {
  const locationKey = normalizeLocationKey(location);
  return locationKey ? `${WEATHER_RISK_BRIDGE_WEATHER_PREFIX}${locationKey}` : "";
}
function fingerprintHassEntity(entity) {
  if (!entity) {
    return "missing";
  }
  const attrs = entity.attributes ?? {};
  return [
    entity.state ?? "",
    entity.last_updated ?? "",
    entity.last_changed ?? "",
    String(attrs.generated_at ?? "")
  ].join("|");
}
function fingerprintWeatherRiskHassData(input) {
  const states = input.hass?.states ?? {};
  const normalizedLocation = input.location ? normalizeLocationKey(input.location) : "";
  const baseEntityId = normalizedLocation ? baseEntityIdForLocation(normalizedLocation) : input.entity ? deriveBaseEntityId(input.entity) : "";
  const chartEntityId = normalizedLocation ? chartEntityIdForLocation(normalizedLocation, input.selectedRange) : input.entity ? entityIdForRange(baseEntityId, input.selectedRange) : "";
  const weatherEntityId = input.weatherEntity || (normalizedLocation ? weatherEntityIdForLocation(normalizedLocation) : chartEntityId ? deriveWeatherEntityId(chartEntityId) : "");
  const strategicContextId = input.selectedRange === 1 && baseEntityId ? entityIdForRange(baseEntityId, 4) : "";
  return [
    chartEntityId,
    fingerprintHassEntity(states[chartEntityId]),
    weatherEntityId,
    fingerprintHassEntity(states[weatherEntityId]),
    strategicContextId,
    strategicContextId ? fingerprintHassEntity(states[strategicContextId]) : ""
  ].join("::");
}
function deriveLocationKeyFromEntityId(entityId) {
  const baseEntityId = deriveBaseEntityId(entityId);
  if (!baseEntityId.startsWith(WEATHER_RISK_BRIDGE_SENSOR_PREFIX)) {
    return "";
  }
  return baseEntityId.slice(WEATHER_RISK_BRIDGE_SENSOR_PREFIX.length);
}
function deriveWeatherEntityId(chartEntityId) {
  const baseEntityId = deriveBaseEntityId(chartEntityId);
  return baseEntityId.replace(
    /^sensor\.weather_risk_bridge_/,
    WEATHER_RISK_BRIDGE_WEATHER_PREFIX
  );
}
function fahrenheitToCelsius(temperatureF) {
  return (temperatureF - 32) / 1.8;
}
function formatTemperatureValue(temperatureF, options = {}) {
  const roundedF = Math.round(temperatureF);
  const fahrenheitLabel = options.includeUnit === false ? `${roundedF}\xB0` : `${roundedF}\xB0F`;
  if (!options.includeCelsius) {
    return fahrenheitLabel;
  }
  const roundedC = Math.round(fahrenheitToCelsius(temperatureF));
  return `${fahrenheitLabel} (${roundedC}\xB0C)`;
}
function formatTemperatureRange(minTemperatureF, maxTemperatureF) {
  const roundedMin = Math.round(minTemperatureF);
  const roundedMax = Math.round(maxTemperatureF);
  if (roundedMin === roundedMax) {
    return `${roundedMin}\xB0F`;
  }
  return `${roundedMin}\xB0-${roundedMax}\xB0F`;
}
function deriveBaseEntityId(entityId) {
  return entityId.replace(/_chart_(1|4|12|24|48)h$/, "");
}
function entityIdForRange(baseEntityId, rangeHours) {
  return `${baseEntityId}_chart_${rangeHours}h`;
}
function rangeValues() {
  return [1, 4, 12, 24, 48];
}
function strategicRangeValues() {
  return [4, 12, 24, 48];
}
function cardEntityOptions(states) {
  return Object.keys(states).filter((entityId) => /^sensor\.weather_risk_bridge_.+_chart_4h$/.test(entityId)).sort();
}
function cardLocationOptions(states) {
  return cardEntityOptions(states).map((entityId) => {
    const key = deriveLocationKeyFromEntityId(entityId);
    const friendlyName = String(states[entityId]?.attributes?.friendly_name ?? "").trim();
    const label = friendlyName.replace(/\s+chart\s+4h$/i, "").trim() || key.split("_").filter(Boolean).map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" ");
    return {
      key,
      label: label || key,
      entityId,
      weatherEntityId: deriveWeatherEntityId(entityId)
    };
  });
}

// src/chart-layout.ts
var BASE_SVG_WIDTH = 640;
var SHORT_RANGE_SVG_WIDTH = 420;
var SVG_HEIGHT = 272;
var PLOT_TOP = 32;
var PLOT_RIGHT = 28;
var PLOT_BOTTOM = 48;
var PLOT_LEFT_WITH_AXIS_MIN = 36;
var PLOT_LEFT_NO_AXIS = 28;
var AXIS_LABEL_END_GAP = 4;
var AXIS_LABEL_OUTER_PADDING = 8;
function resolveValueLabelX(centerX, plotLeft, width, plotRight, count) {
  const inset = count <= 12 ? 12 : count <= 24 ? 16 : 18;
  return clamp2(centerX, plotLeft + inset, width - plotRight - inset);
}
function roundTick(value) {
  if (value >= 100) {
    return Math.round(value / 10) * 10;
  }
  if (value >= 25) {
    return Math.round(value / 5) * 5;
  }
  if (value >= 10) {
    return Math.round(value / 2) * 2;
  }
  return Math.max(Math.round(value), 0);
}
function estimateAxisLabelWidth(label) {
  let width = 0;
  for (const char of label) {
    if (char >= "0" && char <= "9") {
      width += 7.25;
      continue;
    }
    switch (char) {
      case ".":
      case ",":
        width += 3.5;
        break;
      case "-":
        width += 4.75;
        break;
      case "\xB0":
        width += 4.5;
        break;
      case "%":
      case "F":
        width += 7;
        break;
      default:
        width += 6.5;
        break;
    }
  }
  return width;
}
function resolvePlotLeft(axis, showYAxisLabels) {
  if (!showYAxisLabels) {
    return PLOT_LEFT_NO_AXIS;
  }
  const widestLabel = axis.ticks.reduce((maxWidth, tick) => {
    const label = formatAxisValue(axis, tick);
    return Math.max(maxWidth, estimateAxisLabelWidth(label));
  }, 0);
  return Math.max(
    PLOT_LEFT_WITH_AXIS_MIN,
    Math.ceil(widestLabel + AXIS_LABEL_END_GAP + AXIS_LABEL_OUTER_PADDING)
  );
}
var PRECIPITATION_AXIS_CEILINGS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100];
function nextPrecipitationAxisCeiling(value) {
  const clamped = Math.max(0, Math.min(100, value));
  for (const ceiling of PRECIPITATION_AXIS_CEILINGS) {
    if (clamped <= ceiling) {
      return ceiling;
    }
  }
  return 100;
}
function precipitationAxisMaxForMode(mode, peak) {
  const finitePeak = Number.isFinite(peak) ? Math.max(0, peak) : 0;
  switch (mode) {
    case "fixed_10":
      return 10;
    case "fixed_25":
      return 25;
    case "fixed_50":
      return 50;
    case "fixed_100":
      return 100;
    case "auto":
      return nextPrecipitationAxisCeiling(Math.max(finitePeak, 5));
    case "adaptive":
    default: {
      if (finitePeak <= 0) return 5;
      const paddedPeak = finitePeak <= 5 ? finitePeak * 1.35 + 0.75 : finitePeak <= 20 ? finitePeak * 1.25 : finitePeak <= 50 ? finitePeak * 1.15 : finitePeak * 1.08;
      return nextPrecipitationAxisCeiling(Math.max(5, Math.min(paddedPeak, 100)));
    }
  }
}
function probabilityAxisMaxForMode(mode, peak, profile) {
  if (profile === "precipitation") {
    const axisMax = precipitationAxisMaxForMode(mode, peak);
    return mode === "adaptive" || mode === "auto" ? Math.max(50, axisMax) : axisMax;
  }
  switch (mode) {
    case "fixed_10":
      return 10;
    case "fixed_25":
      return 25;
    case "fixed_50":
      return 50;
    case "fixed_100":
      return 100;
    case "auto":
      return Math.max(roundTick(peak), 5);
    case "adaptive":
    default:
      if (peak <= 2) {
        return 10;
      }
      if (peak <= 10) {
        return 25;
      }
      if (peak <= 30) {
        return 50;
      }
      return 100;
  }
}
function precipitationProbabilityTicks(axisMax) {
  const step = axisMax <= 5 ? 1 : axisMax <= 10 ? 2 : axisMax <= 25 ? 5 : axisMax <= 50 ? 10 : 20;
  const ticks = [];
  for (let value = axisMax; value > 0; value -= step) {
    ticks.push(value);
  }
  ticks.push(0);
  return [...new Set(ticks.map((value) => Math.max(0, Math.round(value))))].sort((a3, b3) => b3 - a3);
}
function probabilityTicks(axisMax, profile) {
  if (profile === "precipitation") {
    return precipitationProbabilityTicks(axisMax);
  }
  if (axisMax <= 25) {
    return [axisMax, axisMax / 2, 0].map((value) => roundTick(value));
  }
  if (axisMax <= 50) {
    return [axisMax, 25, 0];
  }
  return [axisMax, axisMax * 0.75, axisMax * 0.5, axisMax * 0.25, 0].map(
    (value) => roundTick(value)
  );
}
function descendingTicks(max, min, step) {
  const ticks = [];
  for (let value = max; value >= min; value -= step) {
    ticks.push(Number(value.toFixed(2)));
  }
  if (ticks[ticks.length - 1] !== min) {
    ticks.push(Number(min.toFixed(2)));
  }
  return ticks;
}
function expandTemperatureBounds(min, max) {
  return [min - 10, max + 10];
}
function formatAxisValue(axis, value) {
  return `${value.toFixed(axis.decimals)}${axis.unitSuffix}`;
}
function shouldShowCompactLabel(index, total) {
  if (total > 48) {
    return index % 10 === 0 || index === total - 1;
  }
  if (total > 36) {
    return index % 6 === 0 || index === total - 1;
  }
  if (total > 24) {
    return index % 4 === 0 || index === total - 1;
  }
  if (total <= 16) {
    return true;
  }
  return index % 2 === 0;
}
function formatXAxisLabel(value, mode, index, total) {
  if (mode === "off") {
    return "";
  }
  if (mode === "compact" && !shouldShowCompactLabel(index, total)) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  if (mode === "full") {
    return date.toLocaleTimeString([], {
      weekday: "short",
      hour: "numeric",
      hour12: true
    });
  }
  return date.toLocaleTimeString([], {
    hour: "numeric",
    hour12: true
  });
}
function buildAxisSpec(series, options) {
  if (series.key === "temperature") {
    const actualValues = series.points.map((point) => Number(point.value ?? 0));
    const apparentValues = series.points.map(
      (point) => typeof point.apparent_value === "number" && !Number.isNaN(point.apparent_value) ? Number(point.apparent_value) : null
    ).filter((value) => value !== null);
    const values2 = [...actualValues, ...apparentValues];
    const minValue = Math.min(...values2);
    const maxValue = Math.max(...values2);
    if (options.temperatureAxisMode === "fixed_span_20f") {
      const [expandedMin2, expandedMax2] = expandTemperatureBounds(maxValue - 10, maxValue + 10);
      const axisMin = Math.floor(expandedMin2 / 10) * 10;
      const axisMax2 = Math.ceil(expandedMax2 / 10) * 10;
      return {
        min: axisMin,
        max: axisMax2,
        ticks: descendingTicks(axisMax2, axisMin, 10),
        unitSuffix: "\xB0F",
        decimals: 0
      };
    }
    const [expandedMin, expandedMax] = expandTemperatureBounds(minValue, maxValue);
    const step = 10;
    const resolvedAxisMin = Math.floor(expandedMin / step) * step;
    const resolvedAxisMax = Math.ceil(expandedMax / step) * step;
    return {
      min: resolvedAxisMin,
      max: resolvedAxisMax,
      ticks: descendingTicks(resolvedAxisMax, resolvedAxisMin, step),
      unitSuffix: "\xB0F",
      decimals: step % 1 === 0 ? 0 : 1
    };
  }
  const sampleValues = options.axisSampleValues && options.axisSampleValues.length > 0 ? options.axisSampleValues : series.points.map((point) => Number(point.value ?? 0));
  const values = sampleValues.filter((value) => Number.isFinite(value));
  const peak = Math.max(...values, 0);
  const probabilityAxisProfile = options.probabilityAxisProfile ?? "default";
  const axisMax = probabilityAxisMaxForMode(
    options.probabilityAxisMode,
    peak,
    probabilityAxisProfile
  );
  return {
    min: 0,
    max: axisMax,
    ticks: probabilityTicks(axisMax, probabilityAxisProfile),
    unitSuffix: "%",
    decimals: 0
  };
}
function scaleY(value, axis, plotTop, baselineY) {
  const span = Math.max(axis.max - axis.min, 1);
  const normalized = (value - axis.min) / span;
  return baselineY - normalized * (baselineY - plotTop);
}
function clamp2(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function resolveSeriesCadenceMinutes(series) {
  if (series.points.length < 2) return null;
  const first = new Date(series.points[0].start).getTime();
  const second = new Date(series.points[1].start).getTime();
  if (Number.isNaN(first) || Number.isNaN(second)) return null;
  const minutes = Math.round((second - first) / 6e4);
  return minutes > 0 ? minutes : null;
}
function formatMinuteTimelineXAxisLabel(mode, index, total, cadenceMinutes) {
  if (mode === "off") return "";
  const elapsedMinutes = Math.round(index * cadenceMinutes);
  const horizonMinutes = Math.round((index + 1) * cadenceMinutes);
  const isAnchor = index === 0 || index === total - 1 || elapsedMinutes % 15 === 0;
  if (mode === "compact" && !isAnchor) return "";
  if (index === 0) return "Now";
  if (index === total - 1) return `${horizonMinutes}m`;
  return `${elapsedMinutes}m`;
}
function shouldUseMinuteTimelineLabels(series, cadenceMinutes) {
  if (!cadenceMinutes || cadenceMinutes > 5) return false;
  if (series.key === "rain_nowcast") return true;
  return series.points.length >= 24;
}
function buildSvgChartModel(series, options) {
  const axis = buildAxisSpec(series, options);
  const resolvedPlotLeft = resolvePlotLeft(axis, options.showYAxisLabels);
  const plotLeft = Math.max(resolvedPlotLeft, options.minPlotLeft ?? resolvedPlotLeft);
  const plotRight = Math.max(PLOT_RIGHT, options.minPlotRight ?? PLOT_RIGHT);
  const count = Math.max(options.horizontalSlotCount ?? series.points.length, 1);
  const cadenceMinutes = resolveSeriesCadenceMinutes(series);
  const isMinuteTimelineSeries = shouldUseMinuteTimelineLabels(series, cadenceMinutes);
  const baselineY = SVG_HEIGHT - PLOT_BOTTOM;
  const gap = isMinuteTimelineSeries ? 3 : count <= 4 ? 14 : count <= 6 ? 12 : 10;
  const denseBarWidth = isMinuteTimelineSeries ? 12 : count <= 12 ? null : count <= 24 ? 32 : 28;
  const width = count <= 4 ? SHORT_RANGE_SVG_WIDTH : denseBarWidth ? Math.max(BASE_SVG_WIDTH, plotLeft + plotRight + count * denseBarWidth + gap * (count - 1)) : BASE_SVG_WIDTH;
  const usableWidth = width - plotLeft - plotRight;
  const minBarWidth = isMinuteTimelineSeries ? 6 : 8;
  const barWidth = Math.max((usableWidth - gap * (count - 1)) / count, minBarWidth);
  const ticks = axis.ticks.map((tick) => ({
    value: tick,
    label: formatAxisValue(axis, tick),
    y: scaleY(tick, axis, PLOT_TOP, baselineY)
  }));
  const bars = series.points.map((point, index) => {
    const value = Number(point.value ?? 0);
    const x2 = plotLeft + index * (barWidth + gap);
    const rawY = scaleY(value, axis, PLOT_TOP, baselineY);
    const height = Math.max(baselineY - rawY, value > axis.min ? 6 : 0);
    const y3 = baselineY - height;
    const label = isMinuteTimelineSeries && cadenceMinutes ? formatMinuteTimelineXAxisLabel(options.xAxisLabels, index, series.points.length, cadenceMinutes) : formatXAxisLabel(point.start, options.xAxisLabels, index, series.points.length);
    const centerX = x2 + barWidth / 2;
    return {
      index,
      value,
      label,
      x: x2,
      y: y3,
      width: barWidth,
      height,
      valueX: resolveValueLabelX(centerX, plotLeft, width, plotRight, count),
      valueY: clamp2(y3 - 10, PLOT_TOP + 10, baselineY - 10),
      xLabelX: centerX,
      xLabelY: SVG_HEIGHT - 10
    };
  });
  return {
    width,
    height: SVG_HEIGHT,
    plotLeft,
    plotRight,
    plotTop: PLOT_TOP,
    plotBottom: PLOT_BOTTOM,
    baselineY,
    axis,
    ticks,
    bars
  };
}
function resolveChartSvgWidthStyle(pointCount, modelWidth) {
  if (pointCount <= 4) {
    return `width:100%;max-width:${Math.max(modelWidth, SHORT_RANGE_SVG_WIDTH)}px;display:block;margin-inline:auto;`;
  }
  return `width:max(100%, ${Math.max(modelWidth, BASE_SVG_WIDTH)}px);display:block;`;
}
function findCurrentPointIndex(series, referenceTime = /* @__PURE__ */ new Date()) {
  const now = referenceTime.getTime();
  let nearestIndex = 0;
  let nearestDelta = Number.POSITIVE_INFINITY;
  for (let index = 0; index < series.points.length; index += 1) {
    const point = series.points[index];
    const start = new Date(point.start).getTime();
    const end = new Date(point.end).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && start <= now && now < end) {
      return index;
    }
    if (!Number.isNaN(start)) {
      const delta = Math.abs(start - now);
      if (delta < nearestDelta) {
        nearestDelta = delta;
        nearestIndex = index;
      }
    }
  }
  return series.points.length > 0 ? nearestIndex : null;
}
function buildFeelsLikeMarkers(series, model) {
  if (series.key !== "temperature") {
    return [];
  }
  return series.points.flatMap((point, index) => {
    const apparentValue = Number(point.apparent_value);
    if (Number.isNaN(apparentValue)) {
      return [];
    }
    const actualValue = Number(point.value ?? 0);
    if (Math.abs(apparentValue - actualValue) < 0.01) {
      return [];
    }
    const bar = model.bars[index];
    const inset = Math.min(Math.max(bar.width * 0.14, 6), 12);
    const markerY = clamp2(
      scaleY(apparentValue, model.axis, model.plotTop, model.baselineY),
      model.plotTop + 4,
      model.baselineY - 4
    );
    const labelY = apparentValue > actualValue ? clamp2(markerY - 14, model.plotTop + 16, model.baselineY - 14) : clamp2(markerY + 24, model.plotTop + 16, model.baselineY - 6);
    return [
      {
        index,
        x1: bar.x + inset,
        x2: bar.x + bar.width - inset,
        y: markerY,
        labelX: bar.x + bar.width / 2,
        labelY,
        value: apparentValue,
        direction: apparentValue > actualValue ? "higher" : "lower"
      }
    ];
  });
}
function buildTopRoundedBarPath(bar) {
  if (bar.height <= 0 || bar.width <= 0) {
    return "";
  }
  const x2 = bar.x;
  const y3 = bar.y;
  const width = bar.width;
  const height = bar.height;
  const bottom = y3 + height;
  const radius = Math.min(6, width / 2, height / 2);
  if (radius <= 0.5) {
    return `M ${x2} ${bottom} L ${x2} ${y3} L ${x2 + width} ${y3} L ${x2 + width} ${bottom} Z`;
  }
  return [
    `M ${x2} ${bottom}`,
    `L ${x2} ${y3 + radius}`,
    `Q ${x2} ${y3} ${x2 + radius} ${y3}`,
    `L ${x2 + width - radius} ${y3}`,
    `Q ${x2 + width} ${y3} ${x2 + width} ${y3 + radius}`,
    `L ${x2 + width} ${bottom}`,
    "Z"
  ].join(" ");
}

// src/forecast-temperature.ts
function formatForecastTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const hasMinutes = date.getMinutes() !== 0;
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: hasMinutes ? "2-digit" : void 0,
    hour12: true
  });
}
function formatForecastWindow(point) {
  const startLabel = formatForecastTime(point.start);
  const endLabel = formatForecastTime(point.end);
  if (startLabel && endLabel) {
    return `${startLabel}-${endLabel}`;
  }
  if (startLabel) {
    return startLabel;
  }
  return "current forecast hour";
}

// src/card-pipeline.ts
function resolveEntityBundle(locationKey, entityId, weatherEntityIdOverride, hass, selectedRange) {
  const issues = [];
  const normalizedLocation = locationKey ? normalizeLocationKey(locationKey) : "";
  const baseEntityId = normalizedLocation ? baseEntityIdForLocation(normalizedLocation) : deriveBaseEntityId(entityId);
  const chartEntityId = normalizedLocation ? chartEntityIdForLocation(normalizedLocation, selectedRange) : entityIdForRange(baseEntityId, selectedRange);
  const strategicContextChartEntityId = selectedRange === 1 ? entityIdForRange(baseEntityId, 4) : null;
  const resolvedWeatherId = weatherEntityIdOverride ?? (normalizedLocation ? weatherEntityIdForLocation(normalizedLocation) : deriveWeatherEntityId(entityId));
  const inferredKey = normalizedLocation || baseEntityId.replace(/^sensor\.weather_risk_bridge_/, "").replace(/_chart_\d+h$/, "");
  const resolved = {
    chartEntityId,
    weatherEntityId: resolvedWeatherId,
    locationKey: inferredKey
  };
  const chartEntity = hass.states[chartEntityId] ?? null;
  if (!chartEntity) {
    issues.push({
      severity: "error",
      stage: "source",
      code: "entity_missing",
      message: `Chart entity not found in hass.states: ${chartEntityId}`
    });
    return {
      bundle: {
        resolved,
        chartEntityState: "missing",
        chartEntityAttributes: {},
        strategicContextChartEntityAttributes: null,
        weatherEntityAttributes: null,
        entityStatus: "missing"
      },
      issues
    };
  }
  let entityStatus = "ok";
  if (chartEntity.state === "unavailable") {
    entityStatus = "unavailable";
    issues.push({
      severity: "error",
      stage: "source",
      code: "entity_unavailable",
      message: `Chart entity is unavailable: ${chartEntityId}`
    });
  } else if (chartEntity.state === "unknown") {
    entityStatus = "unknown";
    issues.push({
      severity: "error",
      stage: "source",
      code: "entity_unknown",
      message: `Chart entity state is unknown: ${chartEntityId}`
    });
  }
  const weatherEntity = hass.states[resolvedWeatherId] ?? null;
  const strategicContextChartEntity = strategicContextChartEntityId ? hass.states[strategicContextChartEntityId] ?? null : null;
  if (!weatherEntity) {
    issues.push({
      severity: "warning",
      stage: "source",
      code: "weather_entity_missing",
      message: `Weather entity not found (conditions/alerts unavailable): ${resolvedWeatherId}`
    });
  }
  return {
    bundle: {
      resolved,
      chartEntityState: chartEntity.state,
      chartEntityAttributes: chartEntity.attributes,
      strategicContextChartEntityAttributes: strategicContextChartEntity?.attributes ?? null,
      weatherEntityAttributes: weatherEntity ? {
        ...weatherEntity.attributes,
        state: weatherEntity.state
      } : null,
      entityStatus
    },
    issues
  };
}
function parseMs(iso) {
  if (typeof iso !== "string" || !iso) return 0;
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}
function parseRawTemperaturePoint(raw, index) {
  const temperatureF = Number(raw.value);
  if (Number.isNaN(temperatureF)) return null;
  const startISO = typeof raw.start === "string" ? raw.start : "";
  const endISO = typeof raw.end === "string" ? raw.end : "";
  const apparentF = Number(raw.apparent_value);
  return {
    nodeId: `pt-temperature-${index}`,
    index,
    startISO,
    endISO,
    startMs: parseMs(startISO),
    endMs: parseMs(endISO),
    temperatureF,
    apparentTemperatureF: Number.isNaN(apparentF) ? null : apparentF,
    condition: typeof raw.condition === "string" ? raw.condition.trim().toLowerCase() : null
  };
}
function parseRawRiskPoint(raw, index, riskKey) {
  const probability = Number(raw.value ?? 0);
  if (Number.isNaN(probability)) return null;
  const startISO = typeof raw.start === "string" ? raw.start : "";
  const endISO = typeof raw.end === "string" ? raw.end : "";
  return {
    nodeId: `pt-${riskKey}-${index}`,
    index,
    startISO,
    endISO,
    startMs: parseMs(startISO),
    endMs: parseMs(endISO),
    probability: Math.max(0, Math.min(100, probability))
  };
}
function isKnownRiskKind(key) {
  return ["rain", "storm", "strong_wind", "hail", "tornado"].includes(key);
}
function resolveRiskDisplayLabel(key, rawLabel) {
  switch (key) {
    case "storm":
      return "Thunderstorms";
    case "strong_wind":
      return "Strong Winds";
    default:
      return rawLabel.trim() || key.replace(/_/g, " ").replace(/\b\w/g, (c4) => c4.toUpperCase());
  }
}
function resolveRiskIcon(key) {
  switch (key) {
    case "rain":
      return "mdi:weather-rainy";
    case "storm":
      return "mdi:weather-lightning-rainy";
    case "strong_wind":
      return "mdi:weather-windy";
    case "hail":
      return "mdi:weather-hail";
    case "tornado":
      return "mdi:weather-tornado";
    default:
      return "mdi:weather-cloudy";
  }
}
function alertSeverityRank(severity) {
  switch (severity.trim().toLowerCase()) {
    case "extreme":
      return 4;
    case "severe":
      return 3;
    case "moderate":
      return 2;
    case "minor":
      return 1;
    default:
      return 0;
  }
}
function computeAlertIsInEffect(startMs, endMs, urgency) {
  const now = Date.now();
  if (startMs !== null && now < startMs) return false;
  if (endMs !== null && now >= endMs) return false;
  if (startMs !== null || endMs !== null) return true;
  const normalized = urgency.trim().toLowerCase();
  return normalized === "immediate" || normalized === "expected";
}
function parseRawAlert(raw, index) {
  const event = typeof raw.event === "string" ? raw.event.trim() : "";
  const headline = typeof raw.headline === "string" ? raw.headline.trim() : "";
  const severity = typeof raw.severity === "string" ? raw.severity.trim() : "";
  const urgency = typeof raw.urgency === "string" ? raw.urgency.trim() : "";
  const startISO = typeof raw.start === "string" && raw.start ? raw.start : null;
  const endISO = typeof raw.end === "string" && raw.end ? raw.end : null;
  const startMs = startISO ? parseMs(startISO) : null;
  const endMs = endISO ? parseMs(endISO) : null;
  return {
    nodeId: `alert-${index}`,
    index,
    event,
    headline,
    severity,
    severityRank: alertSeverityRank(severity),
    urgency,
    startISO,
    endISO,
    startMs: startMs !== null && startMs > 0 ? startMs : null,
    endMs: endMs !== null && endMs > 0 ? endMs : null,
    isInEffect: computeAlertIsInEffect(
      startMs !== null && startMs > 0 ? startMs : null,
      endMs !== null && endMs > 0 ? endMs : null,
      urgency
    )
  };
}
function parseChartObserver(chartEntityAttributes) {
  const raw = chartEntityAttributes.source_status;
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const st = raw;
  const lat = Number(st.latitude);
  const lon = Number(st.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }
  return { latitude: lat, longitude: lon };
}
function parseCurrentConditions(attrs) {
  const windSpeed = Number(attrs.wind_speed);
  const humidity = Number(attrs.humidity);
  const dewPointRaw = attrs.dew_point === null || attrs.dew_point === void 0 ? attrs.dew_point_f : attrs.dew_point;
  const dewPointF = dewPointRaw === null || dewPointRaw === void 0 ? null : Number(dewPointRaw);
  const uvIndex = attrs.uv_index === null || attrs.uv_index === void 0 ? null : Number(attrs.uv_index);
  const uvPeakToday = attrs.uv_index_peak_today === null || attrs.uv_index_peak_today === void 0 ? null : Number(attrs.uv_index_peak_today);
  const windUnit = typeof attrs.wind_speed_unit === "string" && attrs.wind_speed_unit.trim() ? attrs.wind_speed_unit.trim() : "mph";
  return {
    condition: typeof attrs.state === "string" ? attrs.state.trim().toLowerCase() : "",
    windSpeed: Number.isNaN(windSpeed) ? null : windSpeed,
    windUnit,
    humidity: Number.isNaN(humidity) ? null : humidity,
    dewPointF: dewPointF === null || Number.isNaN(dewPointF) ? null : dewPointF,
    uvIndex: uvIndex === null || Number.isNaN(uvIndex) ? null : uvIndex,
    uvPeakToday: uvPeakToday === null || Number.isNaN(uvPeakToday) ? null : uvPeakToday,
    daytime: typeof attrs.daytime === "boolean" ? attrs.daytime : null,
    shortForecast: typeof attrs.short_forecast === "string" ? attrs.short_forecast.trim() : null
  };
}
function resolveCurrentTemperatureWindow(series) {
  const now = Date.now();
  let nearestIndex = 0;
  let nearestDelta = Number.POSITIVE_INFINITY;
  let currentIndex = null;
  for (let i7 = 0; i7 < series.points.length; i7++) {
    const pt2 = series.points[i7];
    if (pt2.startMs > 0 && pt2.endMs > 0 && pt2.startMs <= now && now < pt2.endMs) {
      currentIndex = i7;
      break;
    }
    if (pt2.startMs > 0) {
      const delta = Math.abs(pt2.startMs - now);
      if (delta < nearestDelta) {
        nearestDelta = delta;
        nearestIndex = i7;
      }
    }
  }
  const index = currentIndex ?? (series.points.length > 0 ? nearestIndex : null);
  if (index === null) return null;
  const pt = series.points[index];
  return {
    index,
    temperatureF: pt.temperatureF,
    apparentTemperatureF: pt.apparentTemperatureF,
    startISO: pt.startISO,
    endISO: pt.endISO,
    condition: pt.condition
  };
}
function buildCardDomainModel(bundle, options) {
  const issues = [];
  if (bundle.entityStatus !== "ok") {
    return { domain: null, issues };
  }
  const rawSeriesArray = Array.isArray(bundle.chartEntityAttributes.series) ? bundle.chartEntityAttributes.series : [];
  if (rawSeriesArray.length === 0) {
    issues.push({
      severity: "warning",
      stage: "domain",
      code: "no_series",
      message: "Chart entity attributes contain no series data"
    });
  }
  let temperatureSeries = null;
  const riskSeries = [];
  for (const rawSeries of rawSeriesArray) {
    const key = typeof rawSeries.key === "string" ? rawSeries.key : "";
    const rawPoints = Array.isArray(rawSeries.points) ? rawSeries.points : [];
    if (key === "temperature") {
      const points = [];
      for (let i7 = 0; i7 < rawPoints.length; i7++) {
        const pt = parseRawTemperaturePoint(rawPoints[i7], i7);
        if (pt !== null) {
          points.push(pt);
        } else {
          issues.push({
            severity: "warning",
            stage: "domain",
            code: "invalid_temperature_point",
            message: `Temperature point at index ${i7} has an unparseable value; skipped`
          });
        }
      }
      if (points.length === 0) {
        issues.push({
          severity: "warning",
          stage: "domain",
          code: "empty_temperature_series",
          message: "Temperature series contains no valid points after parsing"
        });
      } else {
        const temps = points.map((p4) => p4.temperatureF);
        const apparentTemps = points.map((p4) => p4.apparentTemperatureF).filter((t4) => t4 !== null);
        temperatureSeries = {
          kind: "temperature",
          points,
          windowCount: points.length,
          minTemperatureF: Math.min(...temps),
          maxTemperatureF: Math.max(...temps),
          hasApparentTemperature: apparentTemps.length > 0,
          minApparentF: apparentTemps.length > 0 ? Math.min(...apparentTemps) : null,
          maxApparentF: apparentTemps.length > 0 ? Math.max(...apparentTemps) : null
        };
      }
    } else if (key === "hail") {
      continue;
    } else {
      const points = [];
      for (let i7 = 0; i7 < rawPoints.length; i7++) {
        const pt = parseRawRiskPoint(rawPoints[i7], i7, key);
        if (pt !== null) {
          points.push(pt);
        }
      }
      const riskKind = isKnownRiskKind(key) ? key : "unknown";
      const peak = points.length > 0 ? Math.max(...points.map((p4) => p4.probability)) : 0;
      riskSeries.push({
        kind: "risk",
        riskKey: key,
        riskKind,
        displayLabel: resolveRiskDisplayLabel(
          key,
          typeof rawSeries.label === "string" ? rawSeries.label : ""
        ),
        icon: resolveRiskIcon(key),
        points,
        windowCount: points.length,
        peakProbability: peak
      });
    }
  }
  const rawAlerts = Array.isArray(bundle.chartEntityAttributes.alerts) ? bundle.chartEntityAttributes.alerts : [];
  const alerts = rawAlerts.map(
    (raw, i7) => parseRawAlert(raw, i7)
  );
  const weatherAttrs = bundle.weatherEntityAttributes;
  let currentConditions = null;
  if (weatherAttrs) {
    currentConditions = parseCurrentConditions(weatherAttrs);
  }
  const currentPrecipitation = parseCurrentPrecipitation(
    bundle.chartEntityAttributes
  );
  const nextHourPrecipitation = parseNextHourPrecipitation(
    bundle.chartEntityAttributes
  );
  const nearTermStrategicPrecipContext = options.selectedRange === 1 ? parseNearTermStrategicPrecipContext(
    bundle.strategicContextChartEntityAttributes
  ) : null;
  const currentTemperatureWindow = temperatureSeries ? resolveCurrentTemperatureWindow(temperatureSeries) : null;
  const fallbackSummary = typeof bundle.chartEntityAttributes.summary === "string" ? bundle.chartEntityAttributes.summary : "";
  const observer = parseChartObserver(bundle.chartEntityAttributes);
  const hailSignal = parseHailSignal(bundle.chartEntityAttributes);
  return {
    domain: {
      locationKey: bundle.resolved.locationKey,
      selectedRange: options.selectedRange,
      temperatureSeries,
      riskSeries,
      hailSignal,
      currentConditions,
      currentPrecipitation,
      nextHourPrecipitation,
      nearTermStrategicPrecipContext,
      alerts,
      currentTemperatureWindow,
      observer,
      fallbackSummary
    },
    issues
  };
}
var HUMIDITY_BAND_LABELS = {
  dry: "Dry & Comfortable",
  ideal: "Ideal",
  sticky: "OK to Sticky",
  oppressive: "Oppressive",
  saturated: "Saturated"
};
function resolveHumidityComfortBand(humidityPercent) {
  if (humidityPercent < 30) return "dry";
  if (humidityPercent < 50) return "ideal";
  if (humidityPercent < 65) return "sticky";
  if (humidityPercent < 80) return "oppressive";
  return "saturated";
}
function resolveHumidityAccent(humidityPercent) {
  return `humidity-${resolveHumidityComfortBand(humidityPercent)}`;
}
function resolveDewPointComfortBand(dewPointF) {
  if (dewPointF <= 55) return "dry";
  if (dewPointF < 65) return "sticky";
  if (dewPointF < 70) return "oppressive";
  return "saturated";
}
function resolveDewPointAccent(dewPointF) {
  return `humidity-${resolveDewPointComfortBand(dewPointF)}`;
}
function titleCaseKey(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c4) => c4.toUpperCase());
}
function alertSearchText(alert) {
  return `${alert.event} ${alert.headline}`.trim().toLowerCase();
}
function compactAlertText(text) {
  const base = text.replace(/\s+/g, " ").trim();
  if (!base) return "Alert";
  return base.replace(/\bWarning\b/gi, "").replace(/\bStatement\b/gi, "").replace(/\s{2,}/g, " ").trim();
}
function alertChipSignatureFromText(text) {
  return compactAlertText(text).toLowerCase();
}
function selectBestAlert(alerts, scoreAlert) {
  return alerts.reduce(
    (best, alert) => {
      const score = scoreAlert(alert);
      if (score === 0) return best;
      if (!best) return { alert, score };
      if (score !== best.score)
        return score > best.score ? { alert, score } : best;
      const inEffect = alert.isInEffect;
      const bestInEffect = best.alert.isInEffect;
      if (inEffect !== bestInEffect) return inEffect ? { alert, score } : best;
      if (alert.severityRank !== best.alert.severityRank) {
        return alert.severityRank > best.alert.severityRank ? { alert, score } : best;
      }
      return best;
    },
    null
  );
}
function formatAlertDateTime(isoString) {
  if (!isoString) return null;
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
function formatAlertDuration(alert) {
  const startLabel = formatAlertDateTime(alert.startISO);
  const endLabel = formatAlertDateTime(alert.endISO);
  if (startLabel && endLabel)
    return `Expected duration: ${startLabel} to ${endLabel}`;
  if (endLabel) return `Expected through ${endLabel}`;
  if (startLabel) return `Expected from ${startLabel}`;
  return null;
}
function buildAlertPillViewModel(nodeId, kind, label, value, alert, badgeTone) {
  const eventLabel = (alert.event || alert.headline || label).trim();
  const normalizedSeverity = alert.severity ? titleCaseKey(alert.severity.toLowerCase()) : null;
  const titleSegments = [eventLabel];
  if (normalizedSeverity) titleSegments.push(normalizedSeverity);
  if (alert.isInEffect) titleSegments.push("In effect");
  const detailText = formatAlertDuration(alert) ?? "Expected duration unavailable";
  return {
    nodeId,
    kind,
    label,
    value,
    title: titleSegments.join(" | "),
    ariaLabel: `${value}. ${detailText}`,
    icon: null,
    badgeTone,
    accent: "default",
    detailText,
    isInteractive: true,
    scale: null,
    representedAlertSignatures: [
      alertChipSignatureFromText(alert.event || alert.headline || label)
    ]
  };
}
function buildFireAlertPills(alerts) {
  const redFlagMatch = selectBestAlert(
    alerts,
    (a3) => alertSearchText(a3).includes("red flag warning") ? 1 : 0
  );
  const fireWatchMatch = selectBestAlert(alerts, (a3) => {
    const text = alertSearchText(a3);
    return text.includes("fire weather watch") || text.includes("fire watch") ? 1 : 0;
  });
  if (redFlagMatch && fireWatchMatch) {
    const redDuration = formatAlertDuration(redFlagMatch.alert) ?? "Expected duration unavailable";
    const watchDuration = formatAlertDuration(fireWatchMatch.alert) ?? "Expected duration unavailable";
    const detailText = `Red Flag Warning: ${redDuration}. Fire Weather Watch: ${watchDuration}`;
    return [
      {
        nodeId: "pill-fire-alert",
        kind: "fire_alert",
        label: "Fire alert",
        value: "Red Flag + Watch",
        title: "Red Flag Warning | Fire Weather Watch",
        ariaLabel: `Red Flag Warning and Fire Weather Watch. ${detailText}`,
        icon: null,
        badgeTone: "warning",
        accent: "default",
        detailText,
        isInteractive: true,
        scale: null,
        representedAlertSignatures: [
          alertChipSignatureFromText(
            redFlagMatch.alert.event || redFlagMatch.alert.headline || "Red Flag"
          ),
          alertChipSignatureFromText(
            fireWatchMatch.alert.event || fireWatchMatch.alert.headline || "Fire Watch"
          )
        ]
      }
    ];
  }
  const pills = [
    redFlagMatch ? buildAlertPillViewModel(
      "pill-fire-alert",
      "fire_alert",
      "Fire alert",
      "Red Flag",
      redFlagMatch.alert,
      "warning"
    ) : null,
    fireWatchMatch ? buildAlertPillViewModel(
      "pill-fire-watch",
      "fire_alert",
      "Fire alert",
      "Fire Watch",
      fireWatchMatch.alert,
      fireWatchMatch.alert.isInEffect ? "warning" : "watch"
    ) : null
  ];
  return pills.filter((p4) => p4 !== null);
}
function normalizeConditionKey(condition) {
  return condition.trim().toLowerCase().replace(/-/g, "_");
}
function displayConditionLabel(condition) {
  const normalized = normalizeConditionKey(condition);
  const labelMap = {
    sunny: "Sunny",
    clear: "Clear",
    clear_night: "Clear",
    cloudy: "Cloudy",
    partlycloudy: "Partly cloudy",
    rainy: "Rain",
    pouring: "Heavy rain",
    lightning: "Lightning",
    lightning_rainy: "Storms",
    snowy: "Snow",
    snowy_rainy: "Wintry mix",
    windy: "Windy",
    windy_variant: "Windy",
    fog: "Fog",
    hail: "Hail",
    exceptional: "Exceptional"
  };
  return labelMap[normalized] ?? titleCaseKey(normalized.replace(/_/g, " "));
}
function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function formatUvIndexDisplay(value) {
  if (value === null) return "--";
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}
function buildHumidityPill(conditions) {
  const humidity = conditions?.humidity === null || conditions?.humidity === void 0 ? null : conditions.humidity;
  const value = humidity === null ? "--" : `${Math.round(humidity)}%`;
  const band = humidity === null ? null : resolveHumidityComfortBand(humidity);
  const bandLabel = band ? HUMIDITY_BAND_LABELS[band] : null;
  const rounded = humidity === null ? null : Math.round(humidity);
  return {
    nodeId: "pill-humidity",
    kind: "humidity",
    label: "Humidity",
    value,
    title: value === "--" ? "Humidity unavailable" : `Humidity ${rounded} percent \xB7 ${bandLabel}`,
    ariaLabel: value === "--" ? "Humidity unavailable" : `Humidity: ${value}, ${bandLabel}`,
    icon: "mdi:water-percent",
    badgeTone: null,
    accent: humidity === null ? "default" : resolveHumidityAccent(humidity),
    detailText: null,
    isInteractive: false,
    scale: null
  };
}
function buildDewPointPill(conditions) {
  const dewPointF = conditions?.dewPointF === null || conditions?.dewPointF === void 0 ? null : conditions.dewPointF;
  const rounded = dewPointF === null ? null : Math.round(dewPointF);
  const value = rounded === null ? "--" : `${rounded}\xB0`;
  const band = dewPointF === null ? null : resolveDewPointComfortBand(dewPointF);
  const bandLabel = band ? HUMIDITY_BAND_LABELS[band] : null;
  return {
    nodeId: "pill-dew-point",
    kind: "dew_point",
    label: "Dew point",
    value,
    title: value === "--" ? "Dew point unavailable" : `Dew point ${rounded}\xB0F \xB7 ${bandLabel}`,
    ariaLabel: value === "--" ? "Dew point unavailable" : `Dew point: ${rounded} degrees Fahrenheit, ${bandLabel}`,
    icon: "mdi:thermometer-water",
    badgeTone: null,
    accent: dewPointF === null ? "default" : resolveDewPointAccent(dewPointF),
    detailText: null,
    isInteractive: false,
    scale: null
  };
}
function supplementalAlertIcon(alert) {
  const text = alertSearchText(alert);
  if (isHydrologyAlertText(text)) {
    return "mdi:waves";
  }
  if (text.includes("thunderstorm") || text.includes("tornado") || text.includes("hail")) {
    return "mdi:weather-lightning";
  }
  if (text.includes("heat") || text.includes("freeze") || text.includes("frost") || text.includes("cold") || text.includes("wind chill")) {
    return "mdi:thermometer-alert";
  }
  return "mdi:alert-outline";
}
function isHydrologyAlertText(text) {
  return text.includes("flash flood") || text.includes("areal flood") || text.includes("river flood") || text.includes("flood watch") || text.includes("flood warning") || text.includes("flood advisory") || text.includes("hydrologic") || text.includes("hydrology");
}
function supplementalAlertKind(alert) {
  const text = alertSearchText(alert);
  if (isHydrologyAlertText(text)) {
    return "flood_alert";
  }
  if (text.includes("thunderstorm") || text.includes("tornado") || text.includes("hail")) {
    return "storm_alert";
  }
  if (text.includes("heat") || text.includes("freeze") || text.includes("frost") || text.includes("cold") || text.includes("wind chill")) {
    return "temperature_alert";
  }
  return null;
}
function supplementalAlertBadgeTone(alert, kind) {
  if (kind !== "flood_alert") return null;
  if (alert.severityRank >= 3) return "warning";
  if (alert.isInEffect || alert.severityRank >= 1) return "watch";
  return null;
}
function compactSupplementalAlertText(text) {
  const compact = compactAlertText(text).replace(/\bSevere Thunderstorm\b/gi, "Storm").replace(/\bThunderstorm\b/gi, "Storm").replace(/\bFlash Flood\b/gi, "Flash Flood").replace(/\bAreal Flood\b/gi, "Areal Flood").replace(/\bHydrologic\b/gi, "Hydrology").replace(/\bExcessive Heat\b/gi, "Heat").replace(/\bWinter Weather\b/gi, "Winter").replace(/\bSpecial Weather\b/gi, "Weather").replace(/\s{2,}/g, " ").trim();
  return compact || "Alert";
}
function buildSupplementalAlertPills(alerts) {
  return alerts.map((alert) => {
    const kind = supplementalAlertKind(alert);
    if (!kind) return null;
    const rawText = alert.event || alert.headline || "Alert";
    const value = compactSupplementalAlertText(rawText);
    const detailText = formatAlertDuration(alert) ?? "Expected duration unavailable";
    return {
      nodeId: `pill-alert-${alert.index}`,
      kind,
      label: "Alert",
      value,
      title: rawText,
      ariaLabel: `${value}. ${detailText}`,
      icon: supplementalAlertIcon(alert),
      badgeTone: supplementalAlertBadgeTone(alert, kind),
      accent: "default",
      detailText,
      isInteractive: true,
      scale: null,
      representedAlertSignatures: [alertChipSignatureFromText(rawText)]
    };
  }).filter((pill) => pill !== null);
}
function windAlertScore(alert) {
  const text = alertSearchText(alert);
  if (!text) return 0;
  if (text.includes("high wind warning")) return 3;
  if (text.includes("wind advisory")) return 2;
  if (text.includes("high wind watch")) return 1;
  return 0;
}
function buildWindPill(conditions, alerts) {
  const windAlert = selectBestAlert(alerts, windAlertScore);
  const hasWind = conditions?.windSpeed !== null && conditions?.windSpeed !== void 0;
  const baseTitle = hasWind ? `Wind ${Math.round(conditions.windSpeed)} ${conditions.windUnit}` : "Wind unavailable";
  const titleSegments = [baseTitle];
  let detailText;
  let accent = "default";
  let advisorySuffix = "";
  if (windAlert) {
    const eventLabel = (windAlert.alert.event || windAlert.alert.headline || "Wind alert").trim();
    titleSegments.push(eventLabel);
    if (windAlert.alert.severity) {
      titleSegments.push(titleCaseKey(windAlert.alert.severity.toLowerCase()));
    }
    if (windAlert.alert.isInEffect) titleSegments.push("In effect");
    detailText = formatAlertDuration(windAlert.alert) ?? "Expected duration unavailable";
    accent = "alert";
    const alertText = alertSearchText(windAlert.alert);
    advisorySuffix = alertText.includes("high wind warning") ? " Warning" : alertText.includes("high wind watch") ? " Watch" : alertText.includes("wind advisory") ? " Advisory" : "";
  }
  const value = hasWind ? `${Math.round(conditions.windSpeed)} ${conditions.windUnit}${advisorySuffix}` : "--";
  return {
    nodeId: "pill-wind",
    kind: "wind",
    label: "Wind",
    value,
    title: titleSegments.join(" | "),
    ariaLabel: detailText ? `${value}. ${detailText}` : value,
    icon: "mdi:weather-windy",
    badgeTone: null,
    accent,
    detailText: detailText ?? null,
    isInteractive: Boolean(detailText),
    scale: null,
    representedAlertSignatures: windAlert ? [
      alertChipSignatureFromText(
        windAlert.alert.event || windAlert.alert.headline || "Wind alert"
      )
    ] : void 0
  };
}
function buildUviPill(conditions) {
  const value = conditions?.uvIndex ?? null;
  const peakValue = conditions?.uvPeakToday ?? null;
  const displayValue = formatUvIndexDisplay(value);
  const displayPeakValue = formatUvIndexDisplay(peakValue);
  const peakSuffix = peakValue === null ? "" : ` | Today's peak ${displayPeakValue} on a 0 to 12 scale`;
  const ariaPeakSuffix = peakValue === null ? "" : `. Today's peak UV index ${displayPeakValue}`;
  return {
    nodeId: "pill-uvi",
    kind: "uvi",
    label: "UVI",
    value: `${displayValue} UVI`,
    title: value === null ? `UVI unavailable${peakSuffix}` : `UV index ${displayValue} on a 0 to 12 scale${peakSuffix}`,
    ariaLabel: value === null ? `UV index unavailable${ariaPeakSuffix}` : `UV index ${displayValue} on a 0 to 12 scale${ariaPeakSuffix}`,
    icon: "mdi:sun-wireless",
    badgeTone: null,
    accent: "default",
    detailText: null,
    isInteractive: false,
    scale: {
      min: 0,
      max: 12,
      value,
      position: value === null ? null : clampValue(value / 12, 0, 1),
      peakValue,
      peakPosition: peakValue === null ? null : clampValue(peakValue / 12, 0, 1)
    }
  };
}
function shouldShowUviPill(conditions) {
  if (!conditions) return false;
  const daytime = inferDaytime(
    conditions.condition ?? "",
    conditions.daytime ?? null
  );
  return daytime !== false;
}
function buildDefaultDetailPills(conditions, alerts) {
  const pills = [
    buildWindPill(conditions, alerts),
    buildHumidityPill(conditions),
    buildDewPointPill(conditions)
  ];
  if (shouldShowUviPill(conditions)) {
    pills.push(buildUviPill(conditions));
  }
  return pills;
}
function parseHailSignal(attrs) {
  const raw = attrs.hail_signal;
  if (!raw || typeof raw !== "object") return null;
  const signal = raw;
  const active = signal.active === true;
  if (!active) return null;
  const nwsLargeHailHours = Number(signal.nws_large_hail_hours);
  const forecastMentionsHail = signal.forecast_mentions_hail === true;
  const spcRaw = signal.spc_outlook_percent;
  const spcOutlookPercent = typeof spcRaw === "number" && Number.isFinite(spcRaw) && spcRaw > 0 ? spcRaw : null;
  return {
    active: true,
    nwsLargeHailHours: Number.isFinite(nwsLargeHailHours) ? Math.max(0, nwsLargeHailHours) : 0,
    forecastMentionsHail,
    spcOutlookPercent
  };
}
function buildHailOutlookPill(hailSignal) {
  if (!hailSignal?.active) return null;
  const detailParts = [];
  if (hailSignal.nwsLargeHailHours > 0) {
    detailParts.push(
      hailSignal.nwsLargeHailHours === 1 ? "NWS forecast grid flags large hail in the next hour" : `NWS forecast grid flags large hail in ${hailSignal.nwsLargeHailHours} upcoming hours`
    );
  } else if (hailSignal.forecastMentionsHail) {
    detailParts.push("Hourly forecast text mentions hail");
  }
  if (hailSignal.spcOutlookPercent !== null) {
    detailParts.push(
      `SPC day-1/2 outlook includes a ${hailSignal.spcOutlookPercent.toFixed(0)}% hail risk area near this location (regional context, not hourly probability)`
    );
  }
  if (detailParts.length === 0) {
    detailParts.push("Hail signals are active for this horizon");
  }
  const value = hailSignal.nwsLargeHailHours > 0 ? "Large hail" : hailSignal.forecastMentionsHail ? "Hail mentioned" : "Outlook";
  return {
    nodeId: "pill-hail-outlook",
    kind: "hail_outlook",
    label: "Hail",
    value,
    title: detailParts.join(" \xB7 "),
    ariaLabel: `${value}. ${detailParts.join(". ")}`,
    icon: "mdi:weather-hail",
    badgeTone: hailSignal.nwsLargeHailHours > 0 ? "warning" : "watch",
    accent: "alert",
    detailText: detailParts.join(" \xB7 "),
    isInteractive: true,
    scale: null
  };
}
function buildExtraDetailPills(alerts) {
  return [
    ...buildFireAlertPills(alerts),
    ...buildSupplementalAlertPills(
      alerts.filter((alert) => {
        const text = alertSearchText(alert);
        return !text.includes("red flag warning") && !text.includes("fire weather watch") && !text.includes("fire watch") && windAlertScore(alert) === 0;
      })
    )
  ];
}
function resolveTemperatureHeaderCondition(domain) {
  const nowcastCondition = resolveNowcastAtmosphereCondition(domain);
  if (nowcastCondition) return nowcastCondition;
  return domain.currentTemperatureWindow?.condition ?? domain.currentConditions?.condition ?? null;
}
function buildCurrentTemperatureMetric(win) {
  const windowLabel = formatForecastWindow({
    start: win.startISO,
    end: win.endISO
  });
  return {
    nodeId: "metric-temperature",
    label: "Temperature",
    value: formatTemperatureValue(Math.round(win.temperatureF), {
      includeCelsius: true
    }),
    title: `Temperature for ${windowLabel}`
  };
}
function buildFeelsLikeMetric(win) {
  if (win.apparentTemperatureF === null) return null;
  const feelsLike = Math.round(win.apparentTemperatureF);
  const windowLabel = formatForecastWindow({
    start: win.startISO,
    end: win.endISO
  });
  return {
    nodeId: "metric-feels-like",
    label: "Feels like",
    numericValue: feelsLike,
    value: formatTemperatureValue(feelsLike, { includeCelsius: true }),
    title: `Feels like for ${windowLabel}`
  };
}
function inferDaytime(condition, explicitDaytime) {
  if (explicitDaytime !== null) return explicitDaytime;
  const normalized = normalizeConditionKey(condition);
  if (normalized === "clear_night") return false;
  if (normalized === "sunny" || normalized === "clear") return true;
  return null;
}
var AMBIENT_RAIN_SCENE_MIN_PROBABILITY = 15;
var AMBIENT_STORM_SCENE_MIN_PROBABILITY = 35;
function precipitationTypeToConditionKey(type, intensity = null) {
  switch (type) {
    case "storm":
      return "lightning_rainy";
    case "rain":
      return intensity === "heavy" ? "pouring" : "rainy";
    case "snow":
      return "snowy";
    case "mix":
      return "snowy_rainy";
    default:
      return null;
  }
}
function resolveNowcastAtmosphereCondition(domain) {
  const current = domain.currentPrecipitation;
  if (current?.isKnown && current.isActive) {
    return precipitationTypeToConditionKey(current.type, current.intensity);
  }
  const nextHour = domain.nextHourPrecipitation;
  if (!nextHour || assessOneHourNowcastMode(nextHour) !== "ready") return null;
  if (nextHour.nextStartMinutes !== null && nextHour.nextStartMinutes <= 20) {
    return precipitationTypeToConditionKey(
      nextHour.nextType,
      nextHour.peakIntensity
    );
  }
  if ((nextHour.stormPeakProbability ?? 0) >= AMBIENT_STORM_SCENE_MIN_PROBABILITY) {
    return "lightning_rainy";
  }
  if ((nextHour.peakProbability ?? 0) >= 55) {
    return "rainy";
  }
  return null;
}
function resolveAmbientTransitionPhase(domain, daytime) {
  const startMs = parseMs(domain.currentTemperatureWindow?.startISO ?? "");
  if (startMs <= 0) return null;
  const localHour = new Date(startMs).getHours();
  if (daytime === true) {
    if (localHour >= 5 && localHour < 8) return "dawn";
    if (localHour >= 17 && localHour < 20) return "dusk";
    return null;
  }
  if (daytime === false && (localHour >= 20 && localHour < 22 || localHour >= 4 && localHour < 5)) {
    return "blue_hour";
  }
  return null;
}
function resolveAmbientScenePreset(condition, daytime, transitionPhase) {
  const normalized = normalizeConditionKey(condition);
  const isNight = daytime === false;
  if (transitionPhase === "dawn") {
    switch (normalized) {
      case "sunny":
      case "clear":
      case "clear_night":
        return "sunrise_clear";
      case "partlycloudy":
        return "sunrise_partly_cloudy";
      case "cloudy":
        return "sunrise_overcast";
      case "fog":
        return "sunrise_fog";
      case "rainy":
      case "pouring":
      case "snowy_rainy":
        return "sunrise_light_rain";
      default:
        break;
    }
  }
  if (transitionPhase === "dusk") {
    switch (normalized) {
      case "sunny":
      case "clear":
        return "sunset_clear";
      case "partlycloudy":
        return "sunset_partly_cloudy";
      case "cloudy":
      case "fog":
        return "sunset_overcast";
      default:
        break;
    }
  }
  if (transitionPhase === "blue_hour") {
    switch (normalized) {
      case "clear_night":
      case "clear":
      case "sunny":
      case "partlycloudy":
        return "twilight_blue_hour_clear";
      default:
        break;
    }
  }
  switch (normalized) {
    case "clear_night":
      return "clear_night";
    case "sunny":
    case "clear":
      return isNight ? "clear_night" : "clear_day";
    case "partlycloudy":
      return isNight ? "partly_cloudy_night" : "partly_cloudy_day";
    case "cloudy":
      return isNight ? "cloudy_night" : "cloudy";
    case "rainy":
    case "pouring":
      return isNight ? "rain_night" : "rain";
    case "lightning":
    case "lightning_rainy":
    case "hail":
      return isNight ? "storm_night" : "storm";
    case "fog":
      return isNight ? "fog_night" : "fog";
    case "snowy":
    case "snowy_rainy":
      return isNight ? "snow_night" : "snow";
    default:
      return isNight ? "cloudy_night" : "cloudy";
  }
}
function resolveAmbientRiskOverlayTone(alerts) {
  if (alerts.some((alert) => alert.severityRank >= 3)) return "warning";
  if (alerts.some((alert) => alert.severityRank >= 1)) return "watch";
  return "none";
}
function isStormLikeCondition(condition) {
  const normalized = normalizeConditionKey(condition);
  return normalized === "lightning" || normalized === "lightning_rainy" || normalized === "hail";
}
function isRainLikeCondition(condition) {
  const normalized = normalizeConditionKey(condition);
  return normalized === "rainy" || normalized === "pouring" || normalized === "snowy_rainy";
}
function hasInEffectConvectiveAlert(alerts) {
  return alerts.some((alert) => {
    if (!alert.isInEffect) return false;
    const text = alertSearchText(alert);
    return text.includes("thunderstorm") || text.includes("lightning") || text.includes("tornado") || text.includes("hail");
  });
}
function resolveNearTermStormPeak(domain, pointCount = 3) {
  const stormSeries = domain.riskSeries.find(
    (series) => series.riskKey === "storm"
  );
  if (!stormSeries) return 0;
  if (stormSeries.points.length === 0)
    return Number(stormSeries.peakProbability ?? 0);
  return stormSeries.points.slice(0, pointCount).reduce((peak, point) => Math.max(peak, Number(point.probability ?? 0)), 0);
}
function resolveNearTermRainPeak(domain, pointCount = 3) {
  const rainSeries = domain.riskSeries.find(
    (series) => series.riskKey === "rain"
  );
  if (!rainSeries) return 0;
  if (rainSeries.points.length === 0)
    return Number(rainSeries.peakProbability ?? 0);
  return rainSeries.points.slice(0, pointCount).reduce((peak, point) => Math.max(peak, Number(point.probability ?? 0)), 0);
}
function resolveNextHourRainPeak(domain) {
  if (assessOneHourNowcastMode(domain.nextHourPrecipitation) !== "ready")
    return 0;
  const peak = domain.nextHourPrecipitation?.peakProbability;
  return typeof peak === "number" && Number.isFinite(peak) ? peak : 0;
}
function resolveNextHourStormPeak(domain) {
  if (assessOneHourNowcastMode(domain.nextHourPrecipitation) !== "ready")
    return 0;
  const peak = domain.nextHourPrecipitation?.stormPeakProbability;
  return typeof peak === "number" && Number.isFinite(peak) ? peak : 0;
}
function hasActivePrecipitationSignal(domain) {
  const current = domain.currentPrecipitation;
  return Boolean(current?.isKnown && current.isActive);
}
function hasMeaningfulRainBackdropSignal(domain) {
  if (hasActivePrecipitationSignal(domain)) return true;
  const rainPeak = Math.max(
    resolveNearTermRainPeak(domain),
    resolveNextHourRainPeak(domain)
  );
  return rainPeak >= AMBIENT_RAIN_SCENE_MIN_PROBABILITY;
}
function resolveAmbientAtmosphereCondition(domain, preferredCondition) {
  const nowcastCondition = resolveNowcastAtmosphereCondition(domain);
  if (nowcastCondition) return nowcastCondition;
  const currentWindowCondition = normalizeConditionKey(
    domain.currentTemperatureWindow?.condition ?? ""
  );
  if (currentWindowCondition) return currentWindowCondition;
  const currentCondition = normalizeConditionKey(
    domain.currentConditions?.condition ?? ""
  );
  if (currentCondition) return currentCondition;
  const normalizedPreferred = normalizeConditionKey(preferredCondition ?? "");
  if (normalizedPreferred) return normalizedPreferred;
  return "cloudy";
}
function shouldEscalateStormBackdrop(domain, atmosphereCondition) {
  if (!isStormLikeCondition(atmosphereCondition)) return false;
  if (domain.currentPrecipitation?.isKnown && domain.currentPrecipitation.isActive && domain.currentPrecipitation.type === "storm") {
    return true;
  }
  const windowCondition = normalizeConditionKey(
    domain.currentTemperatureWindow?.condition ?? ""
  );
  const currentCondition = normalizeConditionKey(
    domain.currentConditions?.condition ?? ""
  );
  const nowcastCondition = normalizeConditionKey(
    resolveNowcastAtmosphereCondition(domain) ?? ""
  );
  const windowStormLike = isStormLikeCondition(windowCondition);
  const currentStormLike = isStormLikeCondition(currentCondition);
  const nowcastStormLike = isStormLikeCondition(nowcastCondition);
  const convectiveAlertInEffect = hasInEffectConvectiveAlert(domain.alerts);
  const strongNearTermConvectiveSignal = Math.max(
    resolveNearTermStormPeak(domain),
    resolveNextHourStormPeak(domain)
  ) >= AMBIENT_STORM_SCENE_MIN_PROBABILITY;
  if (nowcastStormLike && strongNearTermConvectiveSignal) return true;
  if (windowStormLike && currentStormLike) return true;
  if ((windowStormLike || currentStormLike) && convectiveAlertInEffect)
    return true;
  if ((windowStormLike || currentStormLike) && strongNearTermConvectiveSignal)
    return true;
  return false;
}
function resolveAmbientSceneCondition(domain, atmosphereCondition, daytime) {
  const normalizedAtmosphere = normalizeConditionKey(atmosphereCondition);
  if (!isStormLikeCondition(normalizedAtmosphere)) {
    if (isRainLikeCondition(normalizedAtmosphere) && !hasMeaningfulRainBackdropSignal(domain)) {
      return daytime === false ? "cloudy_night" : "cloudy";
    }
    return normalizedAtmosphere;
  }
  if (shouldEscalateStormBackdrop(domain, normalizedAtmosphere))
    return normalizedAtmosphere;
  if (hasMeaningfulRainBackdropSignal(domain)) return "rainy";
  if (normalizedAtmosphere === "hail") {
    return daytime === false ? "cloudy_night" : "cloudy";
  }
  return daytime === false ? "cloudy_night" : "cloudy";
}
function buildDailyRangeMetric(domain) {
  if (!domain.temperatureSeries) return null;
  const rangeValue = formatTemperatureRange(
    domain.temperatureSeries.minTemperatureF,
    domain.temperatureSeries.maxTemperatureF
  );
  return {
    nodeId: "metric-range",
    label: "Range",
    value: rangeValue,
    title: `Temperature range ${rangeValue}`
  };
}
function buildAmbientSceneViewModel(domain, condition) {
  const atmosphereCondition = resolveAmbientAtmosphereCondition(
    domain,
    condition
  );
  const daytime = inferDaytime(
    atmosphereCondition,
    domain.currentConditions?.daytime ?? null
  );
  const sceneCondition = resolveAmbientSceneCondition(
    domain,
    atmosphereCondition,
    daytime
  );
  const transitionPhase = resolveAmbientTransitionPhase(domain, daytime);
  const preset = resolveAmbientScenePreset(
    sceneCondition,
    daytime,
    transitionPhase
  );
  const conditionLabel = displayConditionLabel(sceneCondition);
  return {
    nodeId: "ambient-scene",
    preset,
    conditionLabel,
    alertTone: resolveAmbientRiskOverlayTone(domain.alerts),
    uvIntensity: domain.currentConditions?.uvIndex === null || domain.currentConditions?.uvIndex === void 0 ? null : clampValue(domain.currentConditions.uvIndex / 12, 0, 1),
    title: `${conditionLabel} atmospheric scene`
  };
}
function buildTemperatureHeaderViewModel(domain) {
  if (!domain.currentTemperatureWindow) return null;
  const currentTemperature = buildCurrentTemperatureMetric(
    domain.currentTemperatureWindow
  );
  const feelsLike = buildFeelsLikeMetric(domain.currentTemperatureWindow);
  const headerCondition = resolveTemperatureHeaderCondition(domain);
  const ambientScene = buildAmbientSceneViewModel(domain, headerCondition);
  return {
    currentTemperature,
    feelsLike,
    dailyRange: buildDailyRangeMetric(domain),
    conditionLabel: ambientScene?.conditionLabel ?? (headerCondition ? displayConditionLabel(headerCondition) : null),
    defaultDetails: buildDefaultDetailPills(
      domain.currentConditions,
      domain.alerts
    ),
    extraDetails: buildExtraDetailPills(domain.alerts),
    ambientScene
  };
}
function precipitationTypeLabel(type, options = {}) {
  const base = (() => {
    switch (type) {
      case "storm":
        return "storms";
      case "snow":
        return "snow";
      case "mix":
        return "wintry mix";
      case "rain":
        return "rain";
      default:
        return "rain";
    }
  })();
  if (!options.capitalized) return base;
  return base.charAt(0).toUpperCase() + base.slice(1);
}
function precipitationIntensityLabel(intensity) {
  switch (intensity) {
    case "light":
      return "Light";
    case "moderate":
      return "Moderate";
    case "heavy":
      return "Heavy";
    default:
      return "";
  }
}
function formatApproxMinutes(value) {
  return `~${Math.round(value)} min`;
}
function oneHourNowcastModeCopy(mode) {
  switch (mode) {
    case "unsupported":
      return "Minute nowcast unavailable for this location";
    case "stale":
      return "Minute nowcast data is stale";
    case "missing_data":
      return "Minute nowcast data is incomplete";
    default:
      return "Minute nowcast active";
  }
}
var NOWCAST_NEAR_ZERO_PROBABILITY_THRESHOLD = 2;
var PRECIPITATION_PANEL_MIN_PEAK_PERCENT = 5;
var STRATEGIC_CONTEXT_MEANINGFUL_THRESHOLD = 5;
var STRATEGIC_CONTEXT_ELEVATED_THRESHOLD = 25;
var STRATEGIC_CONTEXT_HIGH_THRESHOLD = 45;
function describeNowcastStrategicDivergence(nextHour, context) {
  if (nextHour.peakProbability === null || nextHour.peakProbability > NOWCAST_NEAR_ZERO_PROBABILITY_THRESHOLD) {
    return null;
  }
  if (!context) return null;
  const strategicPeak = Math.max(
    context.rainPeakProbability ?? 0,
    context.stormPeakProbability ?? 0
  );
  if (strategicPeak < STRATEGIC_CONTEXT_MEANINGFUL_THRESHOLD) return null;
  if ((context.stormPeakProbability ?? 0) >= STRATEGIC_CONTEXT_HIGH_THRESHOLD) {
    return "strongest storm risk later this hour";
  }
  if ((context.rainPeakProbability ?? 0) >= STRATEGIC_CONTEXT_HIGH_THRESHOLD) {
    return "strongest rain chance later in the hour";
  }
  if (strategicPeak >= STRATEGIC_CONTEXT_ELEVATED_THRESHOLD) {
    return "broader forecast risk later this hour";
  }
  return "forecast hints at later development";
}
function normalizePrecipitationRateUnitForDisplay(unit) {
  if (!unit) return null;
  const normalized = unit.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "mm/h" || normalized === "mm/hr" || normalized === "mmph")
    return "mm/hr";
  if (normalized === "in/h" || normalized === "in/hr" || normalized === "inch/hr" || normalized === "inches/hr") {
    return "in/hr";
  }
  return unit.trim();
}
function formatPrecipitationRateValue(rate) {
  const magnitude = Math.abs(rate);
  if (magnitude >= 10) return rate.toFixed(0);
  if (magnitude >= 1) return rate.toFixed(1);
  return rate.toFixed(2);
}
function formatPrecipitationRate(rate, rateUnit) {
  if (typeof rate !== "number" || !Number.isFinite(rate)) return null;
  const displayUnit = normalizePrecipitationRateUnitForDisplay(rateUnit);
  if (!displayUnit) return null;
  return `${formatPrecipitationRateValue(rate)} ${displayUnit}`;
}
function describeCurrentPrecipitationRate(current, fallbackRateUnit) {
  if (!current?.isKnown || !current.isActive) return null;
  return formatPrecipitationRate(
    current.rate,
    current.rateUnit ?? fallbackRateUnit ?? null
  );
}
function describeCurrentPrecipitationTruthWithRate(current, options = {}) {
  const truth = describeCurrentPrecipitationTruth(current);
  if (!truth) return null;
  const rate = describeCurrentPrecipitationRate(
    current,
    options.fallbackRateUnit ?? null
  );
  if (!rate) return truth;
  return options.includeRatePrefix ? `${truth} \xB7 Rate ${rate}` : `${truth} \xB7 ${rate}`;
}
function describeCurrentPrecipitationTruth(current) {
  if (!current?.isKnown) return null;
  if (!current.isActive) return "Dry now";
  const intensity = precipitationIntensityLabel(current.intensity);
  const type = precipitationTypeLabel(current.type);
  if (type === "storms") {
    return intensity ? `${intensity} storms now` : "Storms now";
  }
  const normalizedType = type.charAt(0).toUpperCase() + type.slice(1);
  return intensity ? `${intensity} ${type} now` : `${normalizedType} now`;
}
function describeOneHourTrend(nextHour, nearTermStrategicContext, current) {
  if (nextHour.nextStopMinutes !== null) {
    return `ending in ${formatApproxMinutes(nextHour.nextStopMinutes)}`;
  }
  if (nextHour.nextStartMinutes !== null && nextHour.nextStartMinutes <= 60) {
    return `${precipitationTypeLabel(nextHour.nextType, { capitalized: true })} starts in ${formatApproxMinutes(nextHour.nextStartMinutes)}`;
  }
  const divergenceCopy = describeNowcastStrategicDivergence(
    nextHour,
    nearTermStrategicContext
  );
  if (divergenceCopy) {
    return divergenceCopy;
  }
  const hasActiveNowPrecip = Boolean(current?.isKnown && current.isActive);
  const stormPeak = nextHour.stormPeakProbability ?? 0;
  const rainPeak = nextHour.peakProbability ?? 0;
  if (hasActiveNowPrecip) {
    if (stormPeak >= 35) return "stronger risk continues through the hour";
    if (rainPeak >= STRATEGIC_CONTEXT_ELEVATED_THRESHOLD)
      return "broader risk remains elevated";
    return null;
  }
  if (stormPeak >= 35) return "storm potential this hour";
  if (rainPeak >= STRATEGIC_CONTEXT_ELEVATED_THRESHOLD)
    return "rain chance this hour";
  return null;
}
function capitalizeSentenceStart(copy) {
  if (!copy) return copy;
  return copy.charAt(0).toUpperCase() + copy.slice(1);
}
function buildOneHourSummaryText(domain) {
  const current = domain.currentPrecipitation;
  const nextHour = domain.nextHourPrecipitation;
  if (!nextHour) return null;
  const mode = assessOneHourNowcastMode(nextHour);
  const truth = describeCurrentPrecipitationTruthWithRate(current, {
    fallbackRateUnit: nextHour.rateUnit ?? null
  });
  if (mode !== "ready") {
    const unavailableCopy = oneHourNowcastModeCopy(mode);
    return truth ? `${truth}; ${unavailableCopy}` : unavailableCopy;
  }
  const trend = describeOneHourTrend(
    nextHour,
    domain.nearTermStrategicPrecipContext,
    current
  );
  if (truth && trend) return `${truth}; ${trend}`;
  if (truth) return truth;
  if (trend) return capitalizeSentenceStart(trend);
  return "Minute nowcast active; current precipitation state unknown";
}
function buildSummaryText(domain, lowRiskThreshold) {
  if (domain.selectedRange === 1) {
    const oneHourSummary = buildOneHourSummaryText(domain);
    if (oneHourSummary) return oneHourSummary;
  }
  const activeNowTruth = describeCurrentPrecipitationTruthWithRate(
    domain.currentPrecipitation,
    {
      fallbackRateUnit: domain.nextHourPrecipitation?.rateUnit ?? null
    }
  );
  const hasActiveNowPrecip = Boolean(
    domain.currentPrecipitation?.isKnown && domain.currentPrecipitation.isActive && activeNowTruth
  );
  const significantRisk = domain.riskSeries.filter(
    (s4) => s4.peakProbability > lowRiskThreshold && s4.riskKey !== "hail" && s4.riskKey !== "tornado"
  );
  if (significantRisk.length > 0) {
    const riskSummary = significantRisk.map((s4) => `${s4.displayLabel} ${s4.peakProbability.toFixed(0)}%`).join(", ");
    return hasActiveNowPrecip ? `${activeNowTruth}; ${riskSummary}` : riskSummary;
  }
  if (domain.temperatureSeries) {
    const { minTemperatureF, maxTemperatureF } = domain.temperatureSeries;
    const baseSummary = `No disruptive weather expected; temperature ${formatTemperatureRange(minTemperatureF, maxTemperatureF)}`;
    return hasActiveNowPrecip ? `${activeNowTruth}; ${baseSummary}` : baseSummary;
  }
  return hasActiveNowPrecip ? `${activeNowTruth}; ${domain.fallbackSummary}` : domain.fallbackSummary;
}
function splitSummaryText(summary) {
  const normalized = summary.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return { primary: "Conditions unavailable", secondary: null };
  }
  const semicolonIndex = normalized.indexOf(";");
  if (semicolonIndex >= 0) {
    const primary = normalized.slice(0, semicolonIndex).trim();
    const secondary = normalized.slice(semicolonIndex + 1).trim();
    return {
      primary: primary || normalized,
      secondary: secondary || null
    };
  }
  const commaIndex = normalized.indexOf(",");
  if (commaIndex >= 0 && normalized.length > 44) {
    const primary = normalized.slice(0, commaIndex).trim();
    const secondary = normalized.slice(commaIndex + 1).trim();
    return {
      primary: primary || normalized,
      secondary: secondary || null
    };
  }
  return { primary: normalized, secondary: null };
}
function buildQuietHazardChipViewModels(domain, config) {
  if (config.selectedRange === 1) return [];
  if (config.lowRiskBehavior !== "icons") return [];
  const threshold = config.lowRiskThreshold;
  const quietKeys = ["tornado"];
  return quietKeys.map((key) => {
    const series = domain.riskSeries.find((s4) => s4.riskKey === key);
    const peak = series?.peakProbability ?? 0;
    const label = series?.displayLabel ?? resolveRiskDisplayLabel(key, "");
    return {
      nodeId: `quiet-chip-${key}`,
      riskKey: key,
      label,
      icon: resolveRiskIcon(key),
      peakProbability: peak,
      title: peak > 0 ? `${label}: minimal signal, max ${peak.toFixed(0)}%` : `${label}: no meaningful signal`,
      ariaLabel: peak > 0 ? `${label}: minimal signal, max ${peak.toFixed(0)} percent` : `${label}: no meaningful signal`
    };
  }).filter((chip) => chip.peakProbability <= threshold);
}
function buildRiskSeriesBridge(series) {
  return {
    key: series.riskKey,
    label: series.displayLabel,
    unit: "%",
    points: series.points.map((pt) => ({
      start: pt.startISO,
      end: pt.endISO,
      value: pt.probability
    }))
  };
}
function parsePrecipitationType(raw) {
  const normalized = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (normalized === "rain" || normalized === "storm" || normalized === "snow" || normalized === "mix" || normalized === "none") {
    return normalized;
  }
  return "none";
}
function parsePrecipitationIntensity(raw) {
  const normalized = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (normalized === "none" || normalized === "light" || normalized === "moderate" || normalized === "heavy") {
    return normalized;
  }
  return "none";
}
function parseOptionalMinutes(raw) {
  if (raw === null || raw === void 0) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded >= 0 ? rounded : null;
}
function parsePrecipitationRateUnit(raw) {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim();
  return normalized ? normalized : null;
}
function parseCurrentPrecipitation(attrs) {
  const precipNowKnown = typeof attrs.precip_now_known === "boolean" ? attrs.precip_now_known : null;
  const precipNow = typeof attrs.precip_now === "boolean" ? attrs.precip_now : false;
  const rateRaw = attrs.precip_rate_now;
  const rate = rateRaw === null || rateRaw === void 0 ? null : Number(rateRaw);
  if (precipNowKnown === null && attrs.precip_type_now === void 0 && attrs.precip_intensity_now === void 0) {
    return null;
  }
  return {
    isKnown: precipNowKnown ?? false,
    isActive: Boolean(precipNowKnown && precipNow),
    type: parsePrecipitationType(attrs.precip_type_now),
    intensity: parsePrecipitationIntensity(attrs.precip_intensity_now),
    rate: Number.isFinite(rate) ? rate : null,
    rateUnit: parsePrecipitationRateUnit(attrs.precip_rate_unit)
  };
}
function parseMinuteNowcastPoint(raw, index) {
  const startISO = typeof raw.start === "string" ? raw.start : "";
  const endISO = typeof raw.end === "string" ? raw.end : "";
  const precipProbability = Number(raw.precip_probability);
  if (!Number.isFinite(precipProbability)) return null;
  const precipRate = raw.precip_rate === null || raw.precip_rate === void 0 ? null : Number(raw.precip_rate);
  const stormProbability = raw.storm_probability === null || raw.storm_probability === void 0 ? null : Number(raw.storm_probability);
  const sourceConfidence = raw.source_confidence === null || raw.source_confidence === void 0 ? null : Number(raw.source_confidence);
  return {
    nodeId: `pt-nowcast-${index}`,
    index,
    startISO,
    endISO,
    startMs: parseMs(startISO),
    endMs: parseMs(endISO),
    precipProbability: Math.max(0, Math.min(100, precipProbability)),
    precipIntensity: parsePrecipitationIntensity(raw.precip_intensity),
    precipRate: Number.isFinite(precipRate) ? precipRate : null,
    precipType: parsePrecipitationType(raw.precip_type),
    stormProbability: Number.isFinite(stormProbability) ? Math.max(0, Math.min(100, stormProbability)) : null,
    sourceConfidence: Number.isFinite(sourceConfidence) ? sourceConfidence : null
  };
}
function parseNextHourPrecipitation(attrs) {
  const hasNowcastShape = attrs.supports_minute_nowcast !== void 0 || attrs.source_kind !== void 0 || attrs.minute_series !== void 0;
  if (!hasNowcastShape) return null;
  const supportsNowcast = Boolean(attrs.supports_minute_nowcast);
  const sourceKindRaw = typeof attrs.source_kind === "string" ? attrs.source_kind.trim().toLowerCase() : "";
  const sourceKind = sourceKindRaw === "observed+nowcast" ? "observed+nowcast" : "forecast-only";
  const status = typeof attrs.nowcast_status === "string" && attrs.nowcast_status.trim() ? attrs.nowcast_status.trim() : supportsNowcast ? "ok" : "unsupported_location";
  const reason = typeof attrs.nowcast_reason === "string" && attrs.nowcast_reason.trim() ? attrs.nowcast_reason.trim() : null;
  const rawMinuteSeries = Array.isArray(attrs.minute_series) ? attrs.minute_series : [];
  const minutePoints = [];
  for (let i7 = 0; i7 < rawMinuteSeries.length; i7 += 1) {
    const point = parseMinuteNowcastPoint(rawMinuteSeries[i7], i7);
    if (point) minutePoints.push(point);
  }
  const peakProbability = minutePoints.length > 0 ? Math.max(...minutePoints.map((p4) => p4.precipProbability)) : null;
  const stormPeakProbability = minutePoints.some(
    (p4) => p4.stormProbability !== null
  ) ? Math.max(...minutePoints.map((p4) => p4.stormProbability ?? 0)) : null;
  return {
    supportsNowcast,
    sourceKind,
    status,
    reason,
    rateUnit: parsePrecipitationRateUnit(attrs.precip_rate_unit),
    minutePoints,
    nextStartMinutes: parseOptionalMinutes(attrs.next_precip_start_minutes),
    nextStopMinutes: parseOptionalMinutes(attrs.next_precip_stop_minutes),
    nextType: attrs.next_precip_type === null || attrs.next_precip_type === void 0 ? null : parsePrecipitationType(attrs.next_precip_type),
    peakIntensity: attrs.next_precip_intensity_peak === null || attrs.next_precip_intensity_peak === void 0 ? null : parsePrecipitationIntensity(attrs.next_precip_intensity_peak),
    peakProbability,
    stormPeakProbability
  };
}
var STRATEGIC_CONTEXT_WINDOW_MINUTES = 60;
function parseNearTermStrategicRiskPeak(attrs, riskKey, windowStartMs, windowEndMs) {
  if (!attrs) return null;
  const rawSeriesArray = Array.isArray(attrs.series) ? attrs.series : [];
  const rawSeries = rawSeriesArray.find(
    (series) => typeof series.key === "string" && series.key === riskKey
  );
  if (!rawSeries || !Array.isArray(rawSeries.points)) return null;
  const rawPoints = rawSeries.points;
  const probabilities = [];
  for (let i7 = 0; i7 < rawPoints.length; i7 += 1) {
    const point = parseRawRiskPoint(rawPoints[i7], i7, riskKey);
    if (!point || point.startMs <= 0 || point.endMs <= point.startMs) continue;
    if (point.endMs <= windowStartMs || point.startMs >= windowEndMs) continue;
    probabilities.push(point.probability);
  }
  if (probabilities.length === 0) return null;
  return Math.max(...probabilities);
}
function parseNearTermStrategicPrecipContext(attrs) {
  if (!attrs) return null;
  const windowStartMs = Date.now();
  const windowEndMs = windowStartMs + STRATEGIC_CONTEXT_WINDOW_MINUTES * 6e4;
  const rainPeakProbability = parseNearTermStrategicRiskPeak(
    attrs,
    "rain",
    windowStartMs,
    windowEndMs
  );
  const stormPeakProbability = parseNearTermStrategicRiskPeak(
    attrs,
    "storm",
    windowStartMs,
    windowEndMs
  );
  if (rainPeakProbability === null && stormPeakProbability === null)
    return null;
  return {
    sourceRangeHours: 4,
    windowMinutes: STRATEGIC_CONTEXT_WINDOW_MINUTES,
    rainPeakProbability,
    stormPeakProbability
  };
}
var NOWCAST_MIN_VALID_POINTS = 12;
var NOWCAST_MAX_STALE_MS = 6 * 60 * 1e3;
var NOWCAST_MAX_FUTURE_OFFSET_MS = 20 * 60 * 1e3;
var NOWCAST_MAX_GAP_MS = 15 * 60 * 1e3;
var NOWCAST_UNSUPPORTED_STATUS_KEYWORDS = [
  "unsupported",
  "unavailable",
  "source_unavailable",
  "not_configured",
  "disabled",
  "error"
];
var NOWCAST_STALE_STATUS_KEYWORDS = ["stale", "expired"];
function normalizeNowcastStatus(status) {
  return status.trim().toLowerCase();
}
function hasNowcastStatusKeyword(status, keywords) {
  const normalized = normalizeNowcastStatus(status);
  return keywords.some((keyword) => normalized.includes(keyword));
}
function hasSaneNowcastCadence(points) {
  if (points.length < 2) return true;
  for (let i7 = 1; i7 < points.length; i7 += 1) {
    const gap = points[i7].startMs - points[i7 - 1].startMs;
    if (!Number.isFinite(gap) || gap <= 0 || gap > NOWCAST_MAX_GAP_MS) {
      return false;
    }
  }
  return true;
}
function assessOneHourNowcastMode(nextHour) {
  if (!nextHour) return "missing_data";
  if (hasNowcastStatusKeyword(nextHour.status, NOWCAST_STALE_STATUS_KEYWORDS)) {
    return "stale";
  }
  if (!nextHour.supportsNowcast || nextHour.sourceKind !== "observed+nowcast") {
    return "unsupported";
  }
  if (hasNowcastStatusKeyword(
    nextHour.status,
    NOWCAST_UNSUPPORTED_STATUS_KEYWORDS
  )) {
    return "unsupported";
  }
  const validPoints = nextHour.minutePoints.filter(
    (point) => point.startMs > 0 && point.endMs > point.startMs && Number.isFinite(point.precipProbability)
  ).sort((left, right) => left.startMs - right.startMs);
  if (validPoints.length < NOWCAST_MIN_VALID_POINTS) {
    return "missing_data";
  }
  if (!hasSaneNowcastCadence(validPoints)) {
    return "missing_data";
  }
  const now = Date.now();
  const earliestStart = validPoints[0]?.startMs ?? 0;
  const latestEnd = validPoints.reduce(
    (peak, point) => Math.max(peak, point.endMs),
    0
  );
  if (latestEnd < now - NOWCAST_MAX_STALE_MS) {
    return "stale";
  }
  if (earliestStart > now + NOWCAST_MAX_FUTURE_OFFSET_MS) {
    return "missing_data";
  }
  return "ready";
}
function assessOneHourNowcastModeFromAttributes(attrs) {
  return assessOneHourNowcastMode(parseNextHourPrecipitation(attrs));
}
function resolveNowcastCurrentBucketIndex(points) {
  if (points.length === 0) return null;
  const now = Date.now();
  let nearestIndex = 0;
  let nearestDelta = Number.POSITIVE_INFINITY;
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    if (point.startMs > 0 && point.endMs > point.startMs && point.startMs <= now && now < point.endMs) {
      return index;
    }
    if (point.startMs > 0) {
      const delta = Math.abs(point.startMs - now);
      if (delta < nearestDelta) {
        nearestDelta = delta;
        nearestIndex = index;
      }
    }
  }
  return nearestIndex;
}
function resolveOneHourNowcastCurrentBucketDisplayState(nextHour, current) {
  if (!nextHour || nextHour.minutePoints.length === 0) return null;
  const pointIndex = resolveNowcastCurrentBucketIndex(nextHour.minutePoints);
  if (pointIndex === null) return null;
  const point = nextHour.minutePoints[pointIndex];
  const probabilityLabel = `Chance ${formatProbabilityValue(point.precipProbability)}`;
  if (!current?.isKnown || !current.isActive) {
    return {
      pointIndex,
      mode: "chance",
      observedLabel: null,
      observedRateLabel: null,
      probabilityLabel
    };
  }
  const observedLabel = describeCurrentPrecipitationTruth(current) ?? "Observed precipitation now";
  const observedRate = describeCurrentPrecipitationRate(
    current,
    nextHour.rateUnit ?? null
  );
  return {
    pointIndex,
    mode: "observed_active",
    observedLabel,
    observedRateLabel: observedRate ? `Rate ${observedRate}` : null,
    probabilityLabel
  };
}
function buildAlignedRiskSeriesBridge(source, target) {
  const byStart = new Map(
    target.points.map((pt) => [pt.startISO, pt.probability])
  );
  return {
    key: target.riskKey,
    label: target.displayLabel,
    unit: "%",
    points: source.points.map((pt, index) => ({
      start: pt.startISO,
      end: pt.endISO,
      value: byStart.get(pt.startISO) ?? target.points[index]?.probability ?? 0
    }))
  };
}
var FIRST_OVERLAP_STRATEGIC_WEIGHT = 0.7;
var FIRST_OVERLAP_NOWCAST_WEIGHT = 0.3;
function resolveNowcastCoverageWindow(nextHour) {
  const validPoints = nextHour.minutePoints.filter(
    (point) => point.startMs > 0 && point.endMs > point.startMs
  );
  if (validPoints.length === 0) return null;
  return {
    startMs: validPoints.reduce(
      (start, point) => Math.min(start, point.startMs),
      Number.POSITIVE_INFINITY
    ),
    endMs: validPoints.reduce((end, point) => Math.max(end, point.endMs), 0)
  };
}
function resolveFirstOverlappingRiskPointIndex(series, nowcastWindow) {
  for (let index = 0; index < series.points.length; index += 1) {
    const point = series.points[index];
    if (point.startMs <= 0 || point.endMs <= point.startMs) continue;
    if (point.endMs <= nowcastWindow.startMs) continue;
    if (point.startMs >= nowcastWindow.endMs) continue;
    return index;
  }
  return null;
}
function blendStrategicAndNowcastBucketProbability(strategicProbability, nowcastProbability) {
  return clampValue(
    strategicProbability * FIRST_OVERLAP_STRATEGIC_WEIGHT + nowcastProbability * FIRST_OVERLAP_NOWCAST_WEIGHT,
    0,
    100
  );
}
function reconcileFirstOverlappingStrategicBucket(series, nowcastWindow, nowcastPeakProbability) {
  if (!series) return null;
  const overlapIndex = resolveFirstOverlappingRiskPointIndex(
    series,
    nowcastWindow
  );
  if (overlapIndex === null) return series;
  const nowcastPeak = typeof nowcastPeakProbability === "number" && Number.isFinite(nowcastPeakProbability) ? nowcastPeakProbability : 0;
  const originalProbability = series.points[overlapIndex]?.probability ?? 0;
  const reconciledProbability = blendStrategicAndNowcastBucketProbability(
    originalProbability,
    nowcastPeak
  );
  if (Math.abs(reconciledProbability - originalProbability) < 0.01)
    return series;
  const points = series.points.map(
    (point, index) => index === overlapIndex ? { ...point, probability: reconciledProbability } : point
  );
  return {
    ...series,
    points,
    peakProbability: points.reduce(
      (peak, point) => Math.max(peak, point.probability),
      0
    )
  };
}
function reconcileStrategicPrecipitationWithNowcast(rainSeries, stormSeries, nextHour) {
  if (!nextHour || assessOneHourNowcastMode(nextHour) !== "ready") {
    return { rainSeries, stormSeries };
  }
  const nowcastWindow = resolveNowcastCoverageWindow(nextHour);
  if (!nowcastWindow) return { rainSeries, stormSeries };
  return {
    rainSeries: reconcileFirstOverlappingStrategicBucket(
      rainSeries,
      nowcastWindow,
      nextHour.peakProbability
    ),
    stormSeries: reconcileFirstOverlappingStrategicBucket(
      stormSeries,
      nowcastWindow,
      nextHour.stormPeakProbability
    )
  };
}
function formatPrecipitationPeakDisplay(rainPeak, stormPeak) {
  const hasRain = typeof rainPeak === "number";
  const hasStorm = typeof stormPeak === "number";
  const rainPositive = hasRain && rainPeak > 0;
  const stormPositive = hasStorm && stormPeak > 0;
  if (rainPositive && stormPositive) {
    return `Rain ${rainPeak.toFixed(0)}% \xB7 Storm ${stormPeak.toFixed(0)}%`;
  }
  if (rainPositive) return `Rain ${rainPeak.toFixed(0)}%`;
  if (stormPositive) return `Storm ${stormPeak.toFixed(0)}%`;
  if (hasRain && !hasStorm) return `Rain ${rainPeak.toFixed(0)}%`;
  if (hasStorm && !hasRain) return `Storm ${stormPeak.toFixed(0)}%`;
  if (hasRain && hasStorm) {
    return `Rain ${rainPeak.toFixed(0)}% \xB7 Storm ${stormPeak.toFixed(0)}%`;
  }
  return "No precipitation signal";
}
function isPositivePrecipitationPeak(value) {
  return typeof value === "number" && value > 0;
}
function resolveCurrentPrecipitationState(current, condition) {
  if (current?.isKnown) {
    if (!current.isActive) return "known_dry";
    if (current.type === "storm") return "storm";
    if (current.type === "rain") return "rain";
    return "active_other";
  }
  const normalized = normalizeConditionKey(condition ?? "");
  if (!normalized) return null;
  if (normalized === "lightning" || normalized === "lightning_rainy" || normalized === "hail") {
    return "storm";
  }
  if (normalized === "rainy" || normalized === "pouring" || normalized === "snowy_rainy") {
    return "rain";
  }
  return null;
}
var BROADER_PRECIP_MEANINGFUL_THRESHOLD = 10;
var BROADER_PRECIP_ELEVATED_THRESHOLD = 30;
function collectTimingCandidates(series, kind) {
  if (!series) return [];
  return series.points.map((point, index) => ({
    kind,
    index,
    probability: Number(point.value ?? NaN),
    startISO: point.start
  })).filter(
    (candidate) => Number.isFinite(candidate.probability) && candidate.probability > 0
  );
}
function selectStrongestTimingCandidate(candidates) {
  if (candidates.length === 0) return null;
  return candidates.reduce((best, candidate) => {
    if (candidate.probability !== best.probability) {
      return candidate.probability > best.probability ? candidate : best;
    }
    return candidate.index < best.index ? candidate : best;
  });
}
function formatStrongestBucketTiming(startISO) {
  const startMs = parseMs(startISO);
  if (startMs <= 0) return null;
  const start = new Date(startMs);
  const includeMinutes = start.getMinutes() !== 0;
  const label = start.toLocaleTimeString([], {
    hour: "numeric",
    minute: includeMinutes ? "2-digit" : void 0
  });
  return `near ${label.toLowerCase()}`;
}
function strongestLaterTimingCopy(strongestLater) {
  if (!strongestLater) return null;
  if (strongestLater.probability < BROADER_PRECIP_MEANINGFUL_THRESHOLD)
    return null;
  const timing = formatStrongestBucketTiming(strongestLater.startISO);
  const chanceLabel = strongestLater.kind === "storm" ? "storm risk" : "rain chance";
  if (timing) return `strongest ${chanceLabel} ${timing}`;
  return `strongest ${chanceLabel} later`;
}
function resolvePrecipitationHelperCopy(precipitation, options = {}) {
  const rainPositive = isPositivePrecipitationPeak(
    precipitation?.rainPeak ?? null
  );
  const stormPositive = isPositivePrecipitationPeak(
    precipitation?.stormPeak ?? null
  );
  const currentState = resolveCurrentPrecipitationState(
    options.currentPrecipitation ?? null,
    options.currentCondition ?? null
  );
  const strongestAny = selectStrongestTimingCandidate([
    ...collectTimingCandidates(options.rainSeries, "rain"),
    ...collectTimingCandidates(options.stormSeries, "storm")
  ]);
  const strongestLater = strongestAny && strongestAny.index > 0 ? strongestAny : null;
  const strongestLaterCopy = strongestLaterTimingCopy(strongestLater);
  const broaderPeak = Math.max(
    precipitation?.rainPeak ?? 0,
    precipitation?.stormPeak ?? 0
  );
  if (currentState === "known_dry") {
    if (strongestLaterCopy) return `Dry now; ${strongestLaterCopy}`;
    if (strongestAny && strongestAny.index === 0 && broaderPeak >= BROADER_PRECIP_MEANINGFUL_THRESHOLD) {
      return "Dry now; broader forecast risk in this window";
    }
    if (broaderPeak >= BROADER_PRECIP_ELEVATED_THRESHOLD) {
      return "Dry now; forecast risk increases later";
    }
    if (broaderPeak >= BROADER_PRECIP_MEANINGFUL_THRESHOLD) {
      return "Dry now; broader forecast risk later";
    }
    return "Dry now; low precipitation risk in this window";
  }
  if (currentState === "storm") {
    if (strongestLaterCopy)
      return "Storms now; strongest risk continues into the next few hours";
    return broaderPeak >= BROADER_PRECIP_MEANINGFUL_THRESHOLD ? "Storms now; broader risk remains elevated" : "Storms now; risk eases later";
  }
  if (currentState === "rain") {
    if (strongestLaterCopy) return `Rain now; ${strongestLaterCopy}`;
    return broaderPeak >= BROADER_PRECIP_MEANINGFUL_THRESHOLD ? "Rain now; broader risk remains elevated" : "Rain now; risk eases later";
  }
  if (currentState === "active_other") {
    return broaderPeak >= BROADER_PRECIP_MEANINGFUL_THRESHOLD ? "Precipitation now; broader risk remains elevated" : "Precipitation now; lower risk later";
  }
  if (strongestLaterCopy) return `Forecast ${strongestLaterCopy}`;
  if (rainPositive && stormPositive)
    return "Rain chance with storm potential later";
  if (stormPositive) return "Storm chance across the selected window";
  if (rainPositive) return "Rain chance across the selected window";
  return "Low precipitation risk in this window";
}
function resolveNextHourPrecipitationHelperCopy(nextHour, current, nearTermStrategicContext = null) {
  if (!nextHour) return "Minute nowcast data is incomplete";
  const currentTruth = describeCurrentPrecipitationTruth(current);
  const mode = assessOneHourNowcastMode(nextHour);
  if (mode !== "ready") {
    const modeCopy = oneHourNowcastModeCopy(mode);
    return currentTruth ? `${currentTruth}; ${modeCopy}` : modeCopy;
  }
  if (current?.isKnown && current.isActive && nextHour.nextStopMinutes !== null) {
    return currentTruth ? `${currentTruth}; ending in ${formatApproxMinutes(nextHour.nextStopMinutes)}` : `Ending in ${formatApproxMinutes(nextHour.nextStopMinutes)}`;
  }
  const trend = describeOneHourTrend(
    nextHour,
    nearTermStrategicContext,
    current
  );
  if (currentTruth && trend) return `${currentTruth}; ${trend}`;
  if (currentTruth) return currentTruth;
  if (trend) return capitalizeSentenceStart(trend);
  return "Minute nowcast active";
}
function buildChartPanelViewModels(domain, config) {
  const issues = [];
  const threshold = config.lowRiskThreshold;
  const significantRisk = domain.riskSeries.filter(
    (s4) => s4.peakProbability > threshold
  );
  const hasSignificantRisk = significantRisk.length > 0;
  const isOneHourNowcastRange = config.selectedRange === 1;
  const panels = [];
  if (!isOneHourNowcastRange && domain.temperatureSeries && (config.temperatureDisplay === "always" || !hasSignificantRisk)) {
    const ts = domain.temperatureSeries;
    panels.push({
      nodeId: "panel-temperature",
      panelKey: "temperature",
      label: "Temperature",
      peakDisplay: formatTemperatureValue(ts.maxTemperatureF),
      isTemperature: true,
      _seriesBridge: {
        key: "temperature",
        label: "Temperature",
        unit: "degF",
        points: ts.points.map((pt) => ({
          start: pt.startISO,
          end: pt.endISO,
          value: pt.temperatureF,
          apparent_value: pt.apparentTemperatureF ?? void 0
        }))
      },
      _observer: domain.observer
    });
  }
  if (config.selectedRange === 1 && domain.nextHourPrecipitation) {
    const nowcast = domain.nextHourPrecipitation;
    const current = domain.currentPrecipitation;
    const nearTermStrategicContext = domain.nearTermStrategicPrecipContext;
    const nowcastMode = assessOneHourNowcastMode(nowcast);
    const nowcastPeak = Math.max(
      nowcast.peakProbability ?? 0,
      nowcast.stormPeakProbability ?? 0
    );
    const hasActiveObservedPrecip = Boolean(
      current?.isKnown && current.isActive
    );
    const shouldRenderNowcastPrecipitation = nowcastMode !== "ready" || hasActiveObservedPrecip || nowcastPeak > PRECIPITATION_PANEL_MIN_PEAK_PERCENT;
    if (shouldRenderNowcastPrecipitation) {
      const currentTruth = describeCurrentPrecipitationTruthWithRate(current, {
        fallbackRateUnit: nowcast.rateUnit ?? null
      });
      const nowcastCurrentBucketDisplay = resolveOneHourNowcastCurrentBucketDisplayState(nowcast, current);
      const rainLikeSeries = {
        key: "rain_nowcast",
        label: "Now / 1h nowcast",
        unit: "%",
        points: nowcast.minutePoints.map((point) => ({
          start: point.startISO,
          end: point.endISO,
          value: point.precipProbability,
          precip_intensity: point.precipIntensity,
          precip_rate: point.precipRate,
          precip_rate_unit: nowcast.rateUnit ?? void 0,
          precip_type: point.precipType,
          storm_probability: point.stormProbability,
          source_confidence: point.sourceConfidence
        }))
      };
      const stormPoints = nowcast.minutePoints.map(
        (point) => point.stormProbability ?? 0
      );
      const hasStormOverlay = stormPoints.some((value) => value > 0);
      const stormOverlaySeries = hasStormOverlay ? {
        key: "storm",
        label: "Storm",
        unit: "%",
        points: nowcast.minutePoints.map((point) => ({
          start: point.startISO,
          end: point.endISO,
          value: point.stormProbability ?? 0
        }))
      } : null;
      const peakDisplay = currentTruth ?? (nowcastMode === "ready" && nowcast.peakProbability !== null ? nowcast.peakProbability <= NOWCAST_NEAR_ZERO_PROBABILITY_THRESHOLD ? "Nowcast dry" : `Peak ${nowcast.peakProbability.toFixed(0)}%` : oneHourNowcastModeCopy(nowcastMode));
      panels.push({
        nodeId: "panel-precipitation",
        panelKey: "precipitation",
        label: "Now / 1h nowcast",
        peakDisplay,
        isTemperature: false,
        _seriesBridge: rainLikeSeries,
        _stormSeriesBridge: stormOverlaySeries,
        _axisSampleValues: [
          ...nowcast.minutePoints.map((point) => point.precipProbability),
          ...stormOverlaySeries ? stormPoints : []
        ].filter((value) => Number.isFinite(value)),
        _precipitationPrimaryRisk: "rain",
        _precipitationRainPeak: nowcast.peakProbability,
        _precipitationStormPeak: nowcast.stormPeakProbability,
        _precipitationMode: "nowcast",
        _nextHourPrecipitation: nowcast,
        _currentPrecipitation: current,
        _nearTermStrategicPrecipContext: nearTermStrategicContext,
        _nowcastCurrentBucketDisplay: nowcastCurrentBucketDisplay,
        _observer: null
      });
    }
  }
  if (config.selectedRange !== 1) {
    const rawRainSeries = domain.riskSeries.find((s4) => s4.riskKey === "rain") ?? null;
    const rawStormSeries = domain.riskSeries.find((s4) => s4.riskKey === "storm") ?? null;
    const reconciled = reconcileStrategicPrecipitationWithNowcast(
      rawRainSeries,
      rawStormSeries,
      domain.nextHourPrecipitation
    );
    const rainSeries = reconciled.rainSeries;
    const stormSeries = reconciled.stormSeries;
    const rainPeak = rainSeries?.peakProbability ?? 0;
    const stormPeak = stormSeries?.peakProbability ?? 0;
    const currentCondition = domain.currentConditions?.condition ?? domain.currentTemperatureWindow?.condition ?? null;
    const precipitationPeak = Math.max(rainPeak, stormPeak);
    const hasRainSignal = rainPeak > 0;
    const hasStormSignal = stormPeak > 0;
    const hasAnyPrecipitationSeries = Boolean(rainSeries || stormSeries);
    const shouldRenderPrecipitation = hasAnyPrecipitationSeries && precipitationPeak > PRECIPITATION_PANEL_MIN_PEAK_PERCENT;
    if (shouldRenderPrecipitation && hasAnyPrecipitationSeries) {
      const rainSeriesBridge = rainSeries ? buildRiskSeriesBridge(rainSeries) : null;
      const stormSeriesBridge = stormSeries ? buildRiskSeriesBridge(stormSeries) : null;
      const useRainAsPrimary = Boolean(rainSeries) && (hasRainSignal || !stormSeries || !hasStormSignal || config.lowRiskBehavior === "show");
      const primarySeries = useRainAsPrimary ? rainSeries ?? stormSeries : stormSeries ?? rainSeries;
      const stormOverlaySeries = useRainAsPrimary && rainSeries && stormSeries ? buildAlignedRiskSeriesBridge(rainSeries, stormSeries) : null;
      const axisSampleValues = [
        ...primarySeries.points.map((pt) => pt.probability),
        ...stormOverlaySeries ? stormOverlaySeries.points.map((pt) => Number(pt.value ?? 0)) : []
      ].filter((value) => Number.isFinite(value));
      panels.push({
        nodeId: "panel-precipitation",
        panelKey: "precipitation",
        label: "Precipitation risk",
        peakDisplay: formatPrecipitationPeakDisplay(
          rainSeries ? rainPeak : null,
          stormSeries ? stormPeak : null
        ),
        isTemperature: false,
        _seriesBridge: buildRiskSeriesBridge(primarySeries),
        _stormSeriesBridge: stormOverlaySeries,
        _axisSampleValues: axisSampleValues,
        _precipitationPrimaryRisk: useRainAsPrimary ? "rain" : "storm",
        _precipitationRainPeak: rainSeries ? rainPeak : null,
        _precipitationStormPeak: stormSeries ? stormPeak : null,
        _precipitationRainSeriesBridge: rainSeriesBridge,
        _precipitationStormSeriesBridge: stormSeriesBridge,
        _precipitationMode: "risk",
        _currentCondition: currentCondition,
        _currentPrecipitation: domain.currentPrecipitation,
        _observer: null
      });
    }
  }
  for (const rs of domain.riskSeries) {
    if (rs.riskKey === "rain" || rs.riskKey === "storm" || rs.riskKey === "hail")
      continue;
    if (isOneHourNowcastRange && rs.riskKey === "tornado") {
      continue;
    }
    const isSignificant = rs.peakProbability > threshold;
    if (!isSignificant && config.lowRiskBehavior !== "show") continue;
    panels.push({
      nodeId: `panel-${rs.riskKey}`,
      panelKey: rs.riskKey,
      label: rs.displayLabel,
      peakDisplay: `${rs.peakProbability.toFixed(0)}%`,
      isTemperature: false,
      _seriesBridge: buildRiskSeriesBridge(rs),
      _observer: null
    });
  }
  if (panels.length === 0 && domain.temperatureSeries) {
    const ts = domain.temperatureSeries;
    panels.push({
      nodeId: "panel-temperature",
      panelKey: "temperature",
      label: "Temperature",
      peakDisplay: formatTemperatureValue(ts.maxTemperatureF),
      isTemperature: true,
      _seriesBridge: {
        key: "temperature",
        label: "Temperature",
        unit: "degF",
        points: ts.points.map((pt) => ({
          start: pt.startISO,
          end: pt.endISO,
          value: pt.temperatureF,
          apparent_value: pt.apparentTemperatureF ?? void 0
        }))
      },
      _observer: domain.observer
    });
  }
  if (panels.length === 0) {
    issues.push({
      severity: "error",
      stage: "viewmodel",
      code: "no_renderable_panels",
      message: "No renderable chart panels after applying visibility rules"
    });
  }
  return { panels, issues };
}
function buildAlertChipViewModels(alerts, maxAlerts, excludedTexts = /* @__PURE__ */ new Set()) {
  return alerts.map((alert) => {
    const compactText = compactAlertText(
      alert.event || alert.headline || "Alert"
    );
    return {
      nodeId: `alert-chip-${alert.index}`,
      text: alert.event || alert.headline || "Alert",
      compactText,
      title: alert.headline || alert.event || "Alert",
      tone: alert.severityRank >= 3 ? "warning" : alert.severityRank >= 1 ? "watch" : "default",
      signature: compactText.toLowerCase()
    };
  }).filter((chip) => !excludedTexts.has(chip.signature)).slice(0, maxAlerts).map(({ signature, ...chip }) => chip);
}
function representedAlertChipSignatures(temperatureHeader) {
  const signatures = /* @__PURE__ */ new Set();
  if (!temperatureHeader) return signatures;
  const pills = [
    ...temperatureHeader.defaultDetails,
    ...temperatureHeader.extraDetails
  ];
  for (const pill of pills) {
    for (const signature of pill.representedAlertSignatures ?? []) {
      signatures.add(signature);
    }
  }
  return signatures;
}
function normalizeRuntimeRangeOptions(rangeOptions) {
  const canonical = rangeValues();
  const requested = Array.isArray(rangeOptions) ? rangeOptions : canonical;
  const requestedSet = new Set(
    requested.filter(
      (value) => canonical.includes(value)
    )
  );
  const normalized = canonical.filter((value) => requestedSet.has(value));
  if (normalized.length > 0) return normalized;
  return strategicRangeValues();
}
function resolveSelectedRangeOption(selectedRange, rangeOptions) {
  if (rangeOptions.includes(selectedRange)) return selectedRange;
  if (rangeOptions.includes(4)) return 4;
  return rangeOptions[0] ?? 4;
}
function buildCardViewModel(domain, config) {
  const issues = [];
  const rangeOptions = normalizeRuntimeRangeOptions(config.rangeOptions);
  const selectedRange = resolveSelectedRangeOption(
    config.selectedRange,
    rangeOptions
  );
  const selectedDomain = domain.selectedRange === selectedRange ? domain : {
    ...domain,
    selectedRange
  };
  const effectiveConfig = {
    ...config,
    selectedRange,
    rangeOptions
  };
  const { panels, issues: panelIssues } = buildChartPanelViewModels(
    selectedDomain,
    effectiveConfig
  );
  issues.push(...panelIssues);
  const hailPill = buildHailOutlookPill(selectedDomain.hailSignal);
  let temperatureHeader = selectedDomain.temperatureSeries ? buildTemperatureHeaderViewModel(selectedDomain) : null;
  if (hailPill) {
    temperatureHeader = temperatureHeader ? {
      ...temperatureHeader,
      extraDetails: [...temperatureHeader.extraDetails, hailPill]
    } : {
      currentTemperature: null,
      feelsLike: null,
      dailyRange: null,
      conditionLabel: null,
      defaultDetails: [],
      extraDetails: [hailPill],
      ambientScene: null
    };
  }
  const quietHazards = buildQuietHazardChipViewModels(
    selectedDomain,
    effectiveConfig
  );
  const representedAlertTexts = representedAlertChipSignatures(temperatureHeader);
  const alertChips = config.showAlerts ? buildAlertChipViewModels(
    selectedDomain.alerts,
    config.maxAlerts,
    representedAlertTexts
  ) : [];
  const summary = buildSummaryText(selectedDomain, config.lowRiskThreshold);
  return {
    viewModel: {
      title: config.title,
      summary,
      header: {
        summary: splitSummaryText(summary),
        alertChips,
        quietHazards,
        temperature: temperatureHeader
      },
      selectedRange,
      rangeOptions,
      panels,
      seriesLayout: config.seriesLayout,
      seriesColumns: config.seriesColumns,
      showAlerts: config.showAlerts
    },
    issues
  };
}
function clampLayout(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function resolveBarValueLabelY(bar, marker, plotTop) {
  if (!marker) return bar.valueY;
  if (marker.direction === "higher") return Math.max(plotTop + 12, bar.y + 18);
  let resolved = bar.valueY;
  if (Math.abs(marker.labelY - resolved) < 16) resolved -= 10;
  if (Math.abs(marker.y - resolved) < 12) resolved = marker.y - 14;
  return Math.max(plotTop + 12, resolved);
}
function resolveTemperatureDensityMode(bars, pointCount) {
  const minBarWidth = Math.min(...bars.map((bar) => bar.width));
  if (pointCount >= 36 || minBarWidth < 16) return "stress";
  if (pointCount >= 24 || minBarWidth < 22) return "dense";
  if (pointCount > 12 || minBarWidth < 30) return "compact";
  return "comfortable";
}
function resolveTemperatureLabelCadence(densityMode, minBarWidth) {
  switch (densityMode) {
    case "comfortable":
      return 1;
    case "compact":
      return 2;
    case "dense":
      return minBarWidth >= 28 ? 2 : 3;
    case "stress":
      return minBarWidth >= 24 ? 3 : 4;
    default:
      return 2;
  }
}
function resolveTemperatureLabelVisibility(points, bars, markers, currentPointIndex, selectedTooltipIndex) {
  const densityMode = resolveTemperatureDensityMode(bars, points.length);
  const minBarWidth = Math.min(...bars.map((bar) => bar.width));
  const showAllBarValueLabels = minBarWidth >= 24;
  const cadence = resolveTemperatureLabelCadence(densityMode, minBarWidth);
  const anchors = /* @__PURE__ */ new Set();
  if (bars.length > 0) {
    anchors.add(0);
    anchors.add(bars.length - 1);
  }
  if (currentPointIndex !== null) anchors.add(currentPointIndex);
  if (selectedTooltipIndex !== null) anchors.add(selectedTooltipIndex);
  let maxIndex = 0;
  let minIndex = 0;
  for (let index = 1; index < bars.length; index += 1) {
    if (bars[index].value > bars[maxIndex].value) maxIndex = index;
    if (bars[index].value < bars[minIndex].value) minIndex = index;
  }
  anchors.add(maxIndex);
  anchors.add(minIndex);
  const visibleBarValueIndices = /* @__PURE__ */ new Set();
  let lastShownValue = null;
  let lastShownIndex = -Number.MAX_SAFE_INTEGER;
  for (const bar of bars) {
    if (showAllBarValueLabels) {
      visibleBarValueIndices.add(bar.index);
      lastShownValue = bar.value;
      lastShownIndex = bar.index;
      continue;
    }
    const isAnchor = anchors.has(bar.index);
    const passesCadence = bar.index % cadence === 0;
    const valueDelta = lastShownValue === null ? Number.POSITIVE_INFINITY : Math.abs(bar.value - lastShownValue);
    const minDelta = densityMode === "comfortable" ? 0 : densityMode === "compact" ? 1 : 0;
    const farEnough = bar.index - lastShownIndex >= cadence;
    const shouldShow = isAnchor || passesCadence && farEnough && valueDelta >= minDelta;
    if (!shouldShow) continue;
    visibleBarValueIndices.add(bar.index);
    lastShownValue = bar.value;
    lastShownIndex = bar.index;
  }
  const markerByIndex = new Map(
    markers.map((marker) => [marker.index, marker])
  );
  const visibleFeelsLikeValueIndices = /* @__PURE__ */ new Set();
  for (const [index, marker] of markerByIndex) {
    if (showAllBarValueLabels) {
      visibleFeelsLikeValueIndices.add(index);
      continue;
    }
    const isAnchor = anchors.has(index);
    const canPiggyback = visibleBarValueIndices.has(index);
    const shouldShow = densityMode === "comfortable" ? true : densityMode === "compact" ? canPiggyback && (isAnchor || index % 4 === 0) : isAnchor && (currentPointIndex === index || selectedTooltipIndex === index);
    if (shouldShow) {
      visibleFeelsLikeValueIndices.add(index);
    }
  }
  return {
    densityMode,
    showAllBarValueLabels,
    visibleBarValueIndices,
    visibleFeelsLikeValueIndices
  };
}
function scaleLayoutY(value, axis, plotTop, baselineY) {
  const span = Math.max(axis.max - axis.min, 1);
  const normalized = (value - axis.min) / span;
  return baselineY - normalized * (baselineY - plotTop);
}
function seededUnit(seed) {
  const raw = Math.sin(seed * 12.9898) * 43758.5453123;
  return raw - Math.floor(raw);
}
function resolveStormEnergyTier(stormValue) {
  if (!Number.isFinite(stormValue) || stormValue <= 0) return "none";
  if (stormValue < 5) return "low";
  if (stormValue < 10) return "medium";
  return "high";
}
function buildStormCapSparkLayout(cap) {
  const seed = (cap.index + 1) * 19;
  if (cap.energyTier === "low") return [];
  const centerY = cap.y + cap.height / 2;
  const edgeReach = Math.max(4, Math.min(8, cap.width * 0.42));
  const forkReach = Math.max(2.5, edgeReach * 0.52);
  const leftJitter = (seededUnit(seed + 2) - 0.5) * 4;
  const rightJitter = (seededUnit(seed + 7) - 0.5) * 4;
  const leftBaseX = cap.x + 0.8;
  const rightBaseX = cap.x + cap.width - 0.8;
  const topBaseX = cap.x + cap.width * (0.3 + seededUnit(seed + 11) * 0.4);
  const topJitter = (seededUnit(seed + 13) - 0.5) * 2.4;
  if (cap.energyTier === "medium") {
    const emitLeft = seededUnit(seed + 15) >= 0.5;
    const startX = emitLeft ? leftBaseX : rightBaseX;
    const direction = emitLeft ? -1 : 1;
    const jitter = emitLeft ? leftJitter : rightJitter;
    const mediumArc = `M ${startX} ${centerY} Q ${startX + direction * edgeReach * 0.58} ${centerY - 1.5 + jitter * 0.6} ${startX + direction * edgeReach} ${centerY + jitter * 0.8}`;
    return [
      {
        nodeId: `${cap.nodeId}-spark-medium`,
        capNodeId: cap.nodeId,
        index: cap.index,
        d: mediumArc,
        durationSeconds: 1.45 + seededUnit(seed + 3) * 0.55,
        delaySeconds: seededUnit(seed + 5) * 1.2,
        energyTier: "medium"
      }
    ];
  }
  const leftMain = `M ${leftBaseX} ${centerY} Q ${leftBaseX - edgeReach * 0.62} ${centerY - 1.8 + leftJitter} ${leftBaseX - edgeReach} ${centerY + leftJitter}`;
  const leftForkStartX = leftBaseX - edgeReach * 0.44;
  const leftForkStartY = centerY + leftJitter * 0.58;
  const leftFork = `M ${leftForkStartX} ${leftForkStartY} Q ${leftForkStartX - edgeReach * 0.42} ${leftForkStartY - 2.4} ${leftForkStartX - forkReach} ${leftForkStartY - 0.9}`;
  const rightMain = `M ${rightBaseX} ${centerY} Q ${rightBaseX + edgeReach * 0.62} ${centerY - 1.8 + rightJitter} ${rightBaseX + edgeReach} ${centerY + rightJitter}`;
  const rightForkStartX = rightBaseX + edgeReach * 0.44;
  const rightForkStartY = centerY + rightJitter * 0.58;
  const rightFork = `M ${rightForkStartX} ${rightForkStartY} Q ${rightForkStartX + edgeReach * 0.42} ${rightForkStartY - 2.4} ${rightForkStartX + forkReach} ${rightForkStartY - 0.9}`;
  const leftSpark = {
    nodeId: `${cap.nodeId}-spark-left`,
    capNodeId: cap.nodeId,
    index: cap.index,
    d: `${leftMain} ${leftFork}`,
    durationSeconds: 1.2 + seededUnit(seed + 3) * 0.85,
    delaySeconds: seededUnit(seed + 5) * 1.1,
    energyTier: "high"
  };
  const rightSpark = {
    nodeId: `${cap.nodeId}-spark-right`,
    capNodeId: cap.nodeId,
    index: cap.index,
    d: `${rightMain} ${rightFork}`,
    durationSeconds: 1.25 + seededUnit(seed + 9) * 0.9,
    delaySeconds: seededUnit(seed + 12) * 1.2,
    energyTier: "high"
  };
  const sparks = [leftSpark, rightSpark];
  const includeTopSpark = seededUnit(seed + 17) > 0.75;
  if (includeTopSpark) {
    const topMain = `M ${topBaseX} ${cap.y + 0.6} Q ${topBaseX + topJitter * 0.4} ${cap.y - edgeReach * 0.54} ${topBaseX + topJitter} ${cap.y - edgeReach}`;
    const topForkStartX = topBaseX + topJitter * 0.58;
    const topForkStartY = cap.y - edgeReach * 0.46;
    const topFork = `M ${topForkStartX} ${topForkStartY} Q ${topForkStartX + 1.9} ${topForkStartY - 1.8} ${topForkStartX + 3.1} ${topForkStartY - 0.6}`;
    sparks.push({
      nodeId: `${cap.nodeId}-spark-top`,
      capNodeId: cap.nodeId,
      index: cap.index,
      d: `${topMain} ${topFork}`,
      durationSeconds: 1.35 + seededUnit(seed + 19) * 0.8,
      delaySeconds: seededUnit(seed + 21) * 1.25,
      energyTier: "high"
    });
  }
  return sparks;
}
function buildPrecipitationOverlayLayout(panel, bars, axis, plotTop, baselineY) {
  if (panel.panelKey !== "precipitation") return null;
  if (panel._precipitationMode === "nowcast") {
    return {
      primaryRisk: "rain",
      rainPeak: panel._precipitationRainPeak ?? null,
      stormPeak: panel._precipitationStormPeak ?? null,
      stormCaps: [],
      stormSparks: []
    };
  }
  const primaryRisk = panel._precipitationPrimaryRisk ?? "rain";
  const rainPeak = panel._precipitationRainPeak ?? null;
  const stormPeak = panel._precipitationStormPeak ?? null;
  const stormSeries = panel._stormSeriesBridge ?? null;
  if (!stormSeries || primaryRisk !== "rain") {
    return {
      primaryRisk,
      rainPeak,
      stormPeak,
      stormCaps: [],
      stormSparks: []
    };
  }
  const stormCaps = [];
  const stormSparks = [];
  for (const bar of bars) {
    const stormValue = Number(stormSeries.points[bar.index]?.value ?? 0);
    const energyTier = resolveStormEnergyTier(stormValue);
    if (energyTier === "none") continue;
    const capHeight = clampLayout(bar.width * 0.16, 3.2, 6.2);
    const stormY = scaleLayoutY(stormValue, axis, plotTop, baselineY);
    const capY = clampLayout(
      stormY - capHeight / 2,
      plotTop + 1,
      baselineY - capHeight - 1
    );
    const cap = {
      nodeId: `storm-cap-${panel.panelKey}-${bar.index}`,
      index: bar.index,
      value: stormValue,
      x: bar.x,
      y: capY,
      width: bar.width,
      height: capHeight,
      energyTier
    };
    stormCaps.push(cap);
    stormSparks.push(...buildStormCapSparkLayout(cap));
  }
  return {
    primaryRisk,
    rainPeak,
    stormPeak,
    stormCaps,
    stormSparks
  };
}
function buildTooltipLayout(panelKey, selectedIndex, bar, point, svgModel, visibleRange) {
  const BOX_WIDTH = 184;
  const boxY = 10;
  const hasFeelsLike = typeof point.apparent_value === "number" && !Number.isNaN(point.apparent_value);
  const boxHeight = hasFeelsLike ? 86 : 68;
  const boxRx = 12;
  const centerX = bar.x + bar.width / 2;
  const leftBound = Math.max(
    svgModel.plotLeft,
    (visibleRange?.left ?? svgModel.plotLeft) + 8
  );
  const rightBound = Math.min(
    svgModel.width - svgModel.plotRight - BOX_WIDTH,
    (visibleRange?.right ?? svgModel.width - svgModel.plotRight) - BOX_WIDTH - 8
  );
  const boxX = clampLayout(
    centerX - BOX_WIDTH / 2,
    leftBound,
    Math.max(leftBound, rightBound)
  );
  const pointerX = clampLayout(centerX, boxX + 16, boxX + BOX_WIDTH - 16);
  const titleY = boxY + 20;
  const copy1Y = boxY + 42;
  const copy2Y = hasFeelsLike ? boxY + 62 : null;
  return {
    nodeId: `tooltip-${panelKey}`,
    selectedIndex,
    boxX,
    boxY,
    boxWidth: BOX_WIDTH,
    boxHeight,
    boxRx,
    pointerX,
    windowLabel: formatForecastWindow({ start: point.start, end: point.end }),
    temperatureLabel: `Temp ${formatTemperatureValue(Number(point.value))}`,
    feelsLikeLabel: hasFeelsLike ? `Feels like ${formatTemperatureValue(Number(point.apparent_value))}` : null,
    titleY,
    copy1Y,
    copy2Y
  };
}
function buildPanelLayoutModel(panel, config, selectedTooltipIndex, tooltipViewportRange = null, sharedHorizontalLayout = null) {
  const issues = [];
  const layoutOptions = {
    probabilityAxisMode: config.probabilityAxisMode,
    probabilityAxisProfile: panel.panelKey === "precipitation" ? "precipitation" : "default",
    temperatureAxisMode: config.temperatureAxisMode,
    xAxisLabels: config.xAxisLabels,
    showYAxisLabels: config.showYAxisLabels,
    axisSampleValues: panel._axisSampleValues ?? void 0,
    horizontalSlotCount: sharedHorizontalLayout?.slotCount,
    minPlotLeft: sharedHorizontalLayout?.minPlotLeft,
    minPlotRight: sharedHorizontalLayout?.minPlotRight
  };
  const svgModel = buildSvgChartModel(panel._seriesBridge, layoutOptions);
  const celestial = config.showCelestialTrack !== false && panel.isTemperature && panel._observer ? buildCelestialTrackLayout(
    panel._seriesBridge,
    svgModel.bars,
    svgModel.plotTop,
    svgModel.baselineY,
    panel._observer,
    panel.panelKey
  ) : null;
  const currentPointIndex = findCurrentPointIndex(panel._seriesBridge);
  const rawMarkers = panel.isTemperature ? buildFeelsLikeMarkers(panel._seriesBridge, svgModel) : [];
  const markerByIndex = new Map(rawMarkers.map((m3) => [m3.index, m3]));
  const labelVisibility = panel.isTemperature ? resolveTemperatureLabelVisibility(
    panel._seriesBridge.points,
    svgModel.bars,
    rawMarkers,
    currentPointIndex,
    selectedTooltipIndex
  ) : null;
  if (currentPointIndex === null && panel._seriesBridge.points.length > 0) {
    issues.push({
      severity: "warning",
      stage: "layout",
      code: "current_point_not_resolved",
      message: `Could not resolve active time window for panel "${panel.panelKey}"`
    });
  }
  const ticks = svgModel.ticks.map((tick, i7) => ({
    nodeId: `tick-${panel.panelKey}-${i7}`,
    value: tick.value,
    label: tick.label,
    y: tick.y,
    isBaseline: i7 === svgModel.ticks.length - 1,
    guideX1: svgModel.plotLeft,
    guideX2: svgModel.width - svgModel.plotRight
  }));
  const bars = svgModel.bars.map((bar) => {
    const marker = markerByIndex.get(bar.index);
    const valueY = resolveBarValueLabelY(bar, marker, svgModel.plotTop);
    const isTemp = panel.isTemperature;
    const isPrecipitationPanel = panel.panelKey === "precipitation";
    const hasMeaningfulProbability = bar.value >= 0.5;
    return {
      nodeId: `bar-${panel.panelKey}-${bar.index}`,
      index: bar.index,
      value: bar.value,
      valueDisplay: isTemp ? formatTemperatureValue(bar.value, { includeUnit: false }) : panel._precipitationMode === "nowcast" ? `${bar.value.toFixed(0)}%` : bar.value.toFixed(0),
      label: bar.label,
      isCurrent: bar.index === currentPointIndex,
      x: bar.x,
      y: bar.y,
      width: bar.width,
      height: bar.height,
      valueX: bar.valueX,
      valueY,
      showValueLabel: labelVisibility ? labelVisibility.visibleBarValueIndices.has(bar.index) : panel._precipitationMode === "nowcast" ? false : isPrecipitationPanel ? hasMeaningfulProbability : true,
      xLabelX: bar.xLabelX,
      xLabelY: bar.xLabelY,
      path: buildTopRoundedBarPath(bar)
    };
  });
  const precipitation = buildPrecipitationOverlayLayout(
    panel,
    bars,
    svgModel.axis,
    svgModel.plotTop,
    svgModel.baselineY
  );
  let feelsLikeMarkers = rawMarkers.map((m3) => ({
    nodeId: `feels-like-${panel.panelKey}-${m3.index}`,
    index: m3.index,
    x1: m3.x1,
    x2: m3.x2,
    y: m3.y,
    labelX: m3.labelX,
    labelY: m3.labelY,
    value: m3.value,
    valueDisplay: formatTemperatureValue(m3.value, { includeUnit: false }),
    showValueLabel: labelVisibility ? labelVisibility.visibleFeelsLikeValueIndices.has(m3.index) : true,
    isCurrent: m3.index === currentPointIndex,
    direction: m3.direction
  }));
  if (panel.isTemperature) {
    const barByIndex = new Map(bars.map((bar) => [bar.index, bar]));
    feelsLikeMarkers = feelsLikeMarkers.map((marker) => {
      if (!marker.showValueLabel) return marker;
      const bar = barByIndex.get(marker.index);
      if (!bar || !bar.showValueLabel) return marker;
      if (Math.abs(bar.valueY - marker.labelY) >= 16) return marker;
      return { ...marker, showValueLabel: false };
    });
  }
  const temperatureGradients = panel.isTemperature ? svgModel.bars.map((bar) => ({
    nodeId: `gradient-${panel.panelKey}-${bar.index}`,
    gradientId: `tempGrad-${panel.panelKey}-${bar.index}`,
    barValue: bar.value,
    colors: resolveTemperatureGradientFillColors(bar.value)
  })) : [];
  let tooltip = null;
  let selectedBarHighlight = null;
  if (selectedTooltipIndex !== null) {
    const bar = svgModel.bars[selectedTooltipIndex];
    const point = panel._seriesBridge.points[selectedTooltipIndex];
    if (bar && point) {
      if (panel.isTemperature) {
        tooltip = buildTooltipLayout(
          panel.panelKey,
          selectedTooltipIndex,
          bar,
          point,
          svgModel,
          tooltipViewportRange
        );
      } else if (panel.panelKey === "precipitation") {
        tooltip = buildPrecipitationTooltipLayout(
          panel,
          selectedTooltipIndex,
          bar,
          point,
          svgModel,
          tooltipViewportRange
        );
      }
      if (tooltip) {
        selectedBarHighlight = {
          x: bar.x - 4,
          y: Math.max(svgModel.plotTop, bar.y - 6),
          width: bar.width + 8,
          height: Math.max(svgModel.baselineY - bar.y + 8, 14),
          rx: 12
        };
      }
    } else {
      issues.push({
        severity: "warning",
        stage: "layout",
        code: "tooltip_index_out_of_range",
        message: `Selected tooltip index ${selectedTooltipIndex} out of range for panel "${panel.panelKey}"`
      });
    }
  }
  return {
    layout: {
      nodeId: panel.nodeId,
      panelKey: panel.panelKey,
      isTemperature: panel.isTemperature,
      svgViewBox: `0 0 ${svgModel.width} ${svgModel.height}`,
      svgStyle: resolveChartSvgWidthStyle(
        panel._seriesBridge.points.length,
        svgModel.width
      ),
      svgWidth: svgModel.width,
      svgHeight: svgModel.height,
      plotLeft: svgModel.plotLeft,
      plotRight: svgModel.plotRight,
      plotTop: svgModel.plotTop,
      baselineY: svgModel.baselineY,
      densityMode: labelVisibility?.densityMode ?? "comfortable",
      showAllBarValueLabels: labelVisibility?.showAllBarValueLabels ?? true,
      axis: svgModel.axis,
      ticks,
      bars,
      feelsLikeMarkers,
      temperatureGradients,
      tooltip,
      selectedBarHighlight,
      showYAxisLabels: config.showYAxisLabels,
      celestial,
      precipitation
    },
    issues
  };
}
function resolveSharedPanelHorizontalLayout(panels, config) {
  if (panels.length === 0) return null;
  if (panels.some((panel) => panel._precipitationMode === "nowcast")) {
    return null;
  }
  let slotCount = 0;
  let minPlotLeft = 0;
  let minPlotRight = 0;
  for (const panel of panels) {
    const svgModel = buildSvgChartModel(panel._seriesBridge, {
      probabilityAxisMode: config.probabilityAxisMode,
      temperatureAxisMode: config.temperatureAxisMode,
      xAxisLabels: config.xAxisLabels,
      showYAxisLabels: config.showYAxisLabels,
      axisSampleValues: panel._axisSampleValues ?? void 0
    });
    slotCount = Math.max(slotCount, panel._seriesBridge.points.length);
    minPlotLeft = Math.max(minPlotLeft, svgModel.plotLeft);
    minPlotRight = Math.max(minPlotRight, svgModel.plotRight);
  }
  return {
    slotCount: Math.max(slotCount, 1),
    minPlotLeft,
    minPlotRight
  };
}
function formatProbabilityValue(value) {
  return `${Math.max(0, value).toFixed(0)}%`;
}
function resolvePrecipitationTooltipLabels(panel, selectedIndex) {
  if (panel.panelKey !== "precipitation") return null;
  const primaryValue = Number(
    panel._seriesBridge.points[selectedIndex]?.value ?? NaN
  );
  if (!Number.isFinite(primaryValue)) return null;
  if (panel._precipitationMode === "nowcast") {
    const point = panel._seriesBridge.points[selectedIndex];
    const intensity = precipitationIntensityLabel(
      parsePrecipitationIntensity(point?.precip_intensity)
    );
    const precipType = precipitationTypeLabel(
      parsePrecipitationType(point?.precip_type)
    );
    const probabilityLabel = `Chance ${formatProbabilityValue(primaryValue)}`;
    const rateValue = formatPrecipitationRate(
      typeof point?.precip_rate === "number" && Number.isFinite(point.precip_rate) ? point.precip_rate : null,
      point?.precip_rate_unit ?? panel._nextHourPrecipitation?.rateUnit ?? panel._currentPrecipitation?.rateUnit
    );
    const rate = rateValue ? `Rate ${rateValue}` : null;
    const detailLabel = intensity ? `${intensity} ${precipType}` : precipType;
    const currentBucketDisplay = panel._nowcastCurrentBucketDisplay;
    const isObservedCurrentBucket = currentBucketDisplay?.mode === "observed_active" && currentBucketDisplay.pointIndex === selectedIndex && Boolean(currentBucketDisplay.observedLabel);
    if (isObservedCurrentBucket) {
      const secondaryParts = [];
      if (currentBucketDisplay?.observedRateLabel) {
        secondaryParts.push(currentBucketDisplay.observedRateLabel);
      } else if (rate) {
        secondaryParts.push(rate);
      }
      if (secondaryParts.length === 0 && currentBucketDisplay?.probabilityLabel) {
        secondaryParts.push(currentBucketDisplay.probabilityLabel);
      }
      return {
        primaryLabel: currentBucketDisplay?.observedLabel ?? "Observed precipitation now",
        secondaryLabel: secondaryParts.length > 0 ? secondaryParts.join(" \xB7 ") : detailLabel
      };
    }
    return {
      primaryLabel: probabilityLabel,
      secondaryLabel: rate ? `${detailLabel} \xB7 ${rate}` : detailLabel
    };
  }
  const primaryRisk = panel._precipitationPrimaryRisk ?? (panel._seriesBridge.key === "storm" ? "storm" : "rain");
  if (primaryRisk === "storm") {
    return {
      primaryLabel: `Storm ${formatProbabilityValue(primaryValue)}`,
      secondaryLabel: null
    };
  }
  const rainLabel = `Rain ${formatProbabilityValue(primaryValue)}`;
  const hasStormSignal = (panel._precipitationStormPeak ?? 0) > 0;
  if (!hasStormSignal) {
    return { primaryLabel: rainLabel, secondaryLabel: null };
  }
  const stormOverlayValue = Number(
    panel._stormSeriesBridge?.points[selectedIndex]?.value ?? NaN
  );
  if (!Number.isFinite(stormOverlayValue)) {
    return { primaryLabel: rainLabel, secondaryLabel: null };
  }
  return {
    primaryLabel: rainLabel,
    secondaryLabel: `Storm ${formatProbabilityValue(stormOverlayValue)}`
  };
}
function buildPrecipitationTooltipLayout(panel, selectedIndex, bar, point, svgModel, visibleRange) {
  const labels = resolvePrecipitationTooltipLabels(panel, selectedIndex);
  if (!labels) return null;
  const BOX_WIDTH = 184;
  const boxY = 10;
  const hasSecondary = Boolean(labels.secondaryLabel);
  const boxHeight = hasSecondary ? 86 : 68;
  const boxRx = 12;
  const centerX = bar.x + bar.width / 2;
  const leftBound = Math.max(
    svgModel.plotLeft,
    (visibleRange?.left ?? svgModel.plotLeft) + 8
  );
  const rightBound = Math.min(
    svgModel.width - svgModel.plotRight - BOX_WIDTH,
    (visibleRange?.right ?? svgModel.width - svgModel.plotRight) - BOX_WIDTH - 8
  );
  const boxX = clampLayout(
    centerX - BOX_WIDTH / 2,
    leftBound,
    Math.max(leftBound, rightBound)
  );
  const pointerX = clampLayout(centerX, boxX + 16, boxX + BOX_WIDTH - 16);
  const titleY = boxY + 20;
  const copy1Y = boxY + 42;
  const copy2Y = hasSecondary ? boxY + 62 : null;
  return {
    nodeId: `tooltip-${panel.panelKey}`,
    selectedIndex,
    boxX,
    boxY,
    boxWidth: BOX_WIDTH,
    boxHeight,
    boxRx,
    pointerX,
    windowLabel: formatForecastWindow({ start: point.start, end: point.end }),
    temperatureLabel: labels.primaryLabel,
    feelsLikeLabel: labels.secondaryLabel,
    titleY,
    copy1Y,
    copy2Y
  };
}
function snapPipelineDiagnostics(sourceResult, domainResult, vmResult, layoutResults, renderedValidation) {
  return {
    timestamp: Date.now(),
    entityIds: sourceResult.bundle.resolved,
    entityStatus: sourceResult.bundle.entityStatus,
    domain: domainResult.domain,
    viewModel: vmResult.viewModel,
    panelLayouts: layoutResults.map((r4) => r4.layout),
    issues: [
      ...sourceResult.issues,
      ...domainResult.issues,
      ...vmResult.issues,
      ...layoutResults.flatMap((r4) => r4.issues)
    ],
    renderedValidation
  };
}
function logPipelineDiagnostics(diag) {
  if (typeof window === "undefined" || !window.WRBC_DEBUG) {
    return;
  }
  console.group("[WeatherRiskBridgeCard] Pipeline diagnostics");
  if (diag.issues.length === 0) {
    console.log("No pipeline validation issues.");
  } else {
    console.warn(
      `${diag.issues.length} validation issue(s) across pipeline stages:`
    );
    for (const issue of diag.issues) {
      const fn = issue.severity === "error" ? console.error : console.warn;
      fn(
        `  [${issue.stage}/${issue.severity}] ${issue.code}: ${issue.message}`
      );
    }
  }
  if (diag.renderedValidation) {
    const rv = diag.renderedValidation;
    const rvLine = `Layer 2 rendered: ${rv.summary.nodeCount} nodes, ${rv.summary.issueCount} issue(s) (${rv.summary.errorCount} errors, ${rv.summary.warningCount} warnings)`;
    if (rv.summary.issueCount === 0) {
      console.log(rvLine);
    } else {
      console.warn(rvLine);
    }
  } else {
    console.log(
      "Layer 2 rendered: not yet measured (post-render pass pending)"
    );
  }
  console.log("Entity IDs:", diag.entityIds);
  console.log("Entity status:", diag.entityStatus);
  console.log("Domain model:", diag.domain);
  console.log("View model:", diag.viewModel);
  console.log("Panel layouts:", diag.panelLayouts);
  console.groupEnd();
}

// src/rendered-validation.ts
var CONTAINER_KINDS = /* @__PURE__ */ new Set([
  "panel",
  "svg-root",
  "tick-guide",
  "bar-hitbox",
  "rowhead",
  "bar-selection",
  "ambient-stage"
]);
var SVG_RESIDENT_KINDS = /* @__PURE__ */ new Set([
  "bar",
  "bar-value",
  "bar-xlabel",
  "tick-guide",
  "tick-label",
  "feels-like",
  "feels-like-value",
  "tooltip",
  "bar-hitbox",
  "bar-selection"
]);
var MIN_CROWDING_GAP_PX = 2;
var BOUNDS_TOLERANCE_PX = 4;
var TOOLTIP_BOUNDS_TOLERANCE_PX = 16;
function getOverlapPolicy(kindA, kindB) {
  if (CONTAINER_KINDS.has(kindA) || CONTAINER_KINDS.has(kindB)) {
    return "allow";
  }
  const key = kindA <= kindB ? `${kindA}|${kindB}` : `${kindB}|${kindA}`;
  switch (key) {
    // ---- ALLOW: intentional spatial relationships ----
    // Bar and its value label occupy the same column; label sits above the bar.
    case "bar|bar-value":
      return "allow";
    // X-axis label lives below the bar; no unexpected overlap.
    case "bar|bar-xlabel":
      return "allow";
    // Feels-like marker tick is drawn inside the bar column.
    case "bar|feels-like":
      return "allow";
    // Feels-like value text is positioned in the bar column alongside the marker.
    case "bar|feels-like-value":
      return "allow";
    // Adjacent bars occupy different columns; same-kind is structurally fine.
    case "bar|bar":
      return "allow";
    // Bar value label and feels-like coexist in the same column by design.
    case "bar-value|feels-like":
      return "allow";
    // Alert chips and quiet chips live in separate strips — different sections.
    case "alert-chip|quiet-chip":
      return "allow";
    // ---- DENY: these combinations must not occur in correct rendering ----
    // Adjacent x-axis labels below bars must not overlap.
    case "bar-xlabel|bar-xlabel":
      return "deny";
    // Adjacent y-axis tick labels must not overlap.
    case "tick-label|tick-label":
      return "deny";
    // Value labels above bars must not overlap each other.
    case "bar-value|bar-value":
      return "deny";
    // Feels-like value texts must not overlap each other.
    case "feels-like-value|feels-like-value":
      return "deny";
    // Header metric pills must not overlap.
    case "metric-pill|metric-pill":
      return "deny";
    // Detail pills in a column must not overlap.
    case "detail-pill|detail-pill":
      return "deny";
    // Alert chips in the strip must not overlap.
    case "alert-chip|alert-chip":
      return "deny";
    // Quiet chips in the strip must not overlap.
    case "quiet-chip|quiet-chip":
      return "deny";
    // ---- WARN: suspicious but conditionally valid ----
    // Value label and x-axis label from the same or adjacent bars may crowd.
    case "bar-value|bar-xlabel":
      return "warn";
    // Feels-like value text and bar value text may crowd in narrow bars.
    case "bar-value|feels-like-value":
      return "warn";
    // Feels-like value text near an x-axis label.
    case "bar-xlabel|feels-like-value":
      return "warn";
    // Bar value text near a y-axis tick label.
    case "bar-value|tick-label":
      return "warn";
    // X-axis label near a y-axis tick label (corner of plot area).
    case "bar-xlabel|tick-label":
      return "warn";
    // Tooltip overlapping bar value text: intentional overlay, but trackable.
    case "bar-value|tooltip":
      return "warn";
    // Tooltip over x-axis label.
    case "bar-xlabel|tooltip":
      return "warn";
    // Tooltip over y-axis tick label.
    case "tick-label|tooltip":
      return "warn";
    // Tooltip over feels-like value text.
    case "feels-like-value|tooltip":
      return "warn";
    // Header metric pill near a detail pill in a narrow card layout.
    case "detail-pill|metric-pill":
      return "warn";
    // Two tooltip nodes active simultaneously (multi-panel edge case).
    case "tooltip|tooltip":
      return "warn";
    // ---- DEFAULT: unrecognized non-container pair ----
    // "warn" ensures no future kind is silently ignored when added to the system.
    default:
      return "warn";
  }
}
function isElementHidden(el) {
  if (typeof getComputedStyle !== "function") return false;
  const style = getComputedStyle(el);
  return style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || style.opacity === "0";
}
function toRenderedRect(domRect, hostRect) {
  const x2 = domRect.left - hostRect.left;
  const y3 = domRect.top - hostRect.top;
  const { width, height } = domRect;
  return { x: x2, y: y3, width, height, right: x2 + width, bottom: y3 + height };
}
function rectsOverlap(a3, b3, tolerance = 1) {
  return a3.x < b3.right - tolerance && a3.right > b3.x + tolerance && a3.y < b3.bottom - tolerance && a3.bottom > b3.y + tolerance;
}
function horizontalGap(a3, b3) {
  if (a3.right <= b3.x) return b3.x - a3.right;
  if (b3.right <= a3.x) return a3.x - b3.right;
  return -Math.min(a3.right - b3.x, b3.right - a3.x);
}
function verticalGap(a3, b3) {
  if (a3.bottom <= b3.y) return b3.y - a3.bottom;
  if (b3.bottom <= a3.y) return a3.y - b3.bottom;
  return -Math.min(a3.bottom - b3.y, b3.bottom - a3.y);
}
function resolveZeroSize(el, domRect) {
  if (typeof SVGGraphicsElement !== "undefined" && el instanceof SVGGraphicsElement) {
    try {
      const bbox = el.getBBox();
      return bbox.width === 0 && bbox.height === 0;
    } catch {
      return domRect.width === 0 && domRect.height === 0;
    }
  }
  return domRect.width === 0 || domRect.height === 0;
}
function collectRenderedNodes(root, hostRect) {
  const snapshots = [];
  for (const el of Array.from(root.querySelectorAll("[data-node-id]"))) {
    const nodeId = el.getAttribute("data-node-id") ?? "";
    const nodeKind = el.getAttribute("data-node-kind") ?? "unknown";
    const panelAncestor = el.closest("[data-panel-key]");
    const panelId = panelAncestor?.getAttribute("data-panel-key") ?? null;
    const ownPanelKey = el.getAttribute("data-panel-key") ?? null;
    const svgAncestor = el.closest("svg[data-node-id]");
    const svgId = svgAncestor?.getAttribute("data-node-id") ?? null;
    const domRect = el.getBoundingClientRect();
    const rect = toRenderedRect(domRect, hostRect);
    const rawText = el.textContent?.trim() ?? null;
    const text = rawText && rawText.length > 0 ? rawText : null;
    const hidden = isElementHidden(el);
    const zeroSize = resolveZeroSize(el, domRect);
    snapshots.push({ nodeId, nodeKind, panelId, ownPanelKey, svgId, rect, text, hidden, zeroSize });
  }
  return snapshots;
}
function checkOverlaps(nodes) {
  const issues = [];
  const participating = nodes.filter(
    (n4) => !n4.hidden && !n4.zeroSize && !CONTAINER_KINDS.has(n4.nodeKind)
  );
  for (let i7 = 0; i7 < participating.length; i7++) {
    for (let j2 = i7 + 1; j2 < participating.length; j2++) {
      const a3 = participating[i7];
      const b3 = participating[j2];
      const policy = getOverlapPolicy(a3.nodeKind, b3.nodeKind);
      if (policy === "allow") continue;
      if (!rectsOverlap(a3.rect, b3.rect)) continue;
      issues.push({
        severity: policy === "deny" ? "error" : "warning",
        code: policy === "deny" ? "overlap_deny" : "overlap_warn",
        stage: "rendered",
        message: `"${a3.nodeId}" (${a3.nodeKind}) overlaps "${b3.nodeId}" (${b3.nodeKind})`,
        nodeA: a3.nodeId,
        nodeB: b3.nodeId,
        panelId: a3.panelId ?? b3.panelId ?? null,
        details: { rectA: a3.rect, rectB: b3.rect }
      });
    }
  }
  return issues;
}
function checkBounds(nodes, panelIndex, svgIndex) {
  const issues = [];
  for (const node of nodes) {
    if (node.hidden) continue;
    if (node.nodeKind === "panel" || node.nodeKind === "svg-root") continue;
    if (SVG_RESIDENT_KINDS.has(node.nodeKind) && node.svgId !== null) {
      if (node.nodeKind === "bar-hitbox") continue;
      const svgSnap = svgIndex.get(node.svgId);
      if (!svgSnap || svgSnap.hidden) continue;
      const tol = node.nodeKind === "tooltip" ? TOOLTIP_BOUNDS_TOLERANCE_PX : node.nodeKind === "tick-label" ? 24 : BOUNDS_TOLERANCE_PX;
      if (node.rect.x < svgSnap.rect.x - tol || node.rect.y < svgSnap.rect.y - tol || node.rect.right > svgSnap.rect.right + tol || node.rect.bottom > svgSnap.rect.bottom + tol) {
        issues.push({
          severity: "warning",
          code: "out_of_svg_bounds",
          stage: "rendered",
          message: `"${node.nodeId}" (${node.nodeKind}) renders outside SVG "${node.svgId}" bounds (tolerance: ${tol}px)`,
          nodeA: node.nodeId,
          panelId: node.panelId,
          details: { nodeRect: node.rect, svgRect: svgSnap.rect, tolerancePx: tol }
        });
      }
    } else if (!SVG_RESIDENT_KINDS.has(node.nodeKind) && node.panelId !== null) {
      const panelSnap = panelIndex.get(node.panelId);
      if (!panelSnap || panelSnap.hidden) continue;
      if (node.rect.x < panelSnap.rect.x - BOUNDS_TOLERANCE_PX || node.rect.y < panelSnap.rect.y - BOUNDS_TOLERANCE_PX || node.rect.right > panelSnap.rect.right + BOUNDS_TOLERANCE_PX || node.rect.bottom > panelSnap.rect.bottom + BOUNDS_TOLERANCE_PX) {
        issues.push({
          severity: "warning",
          code: "out_of_panel_bounds",
          stage: "rendered",
          message: `"${node.nodeId}" (${node.nodeKind}) renders outside panel "${node.panelId}" bounds`,
          nodeA: node.nodeId,
          panelId: node.panelId,
          details: { nodeRect: node.rect, panelRect: panelSnap.rect, tolerancePx: BOUNDS_TOLERANCE_PX }
        });
      }
    }
  }
  return issues;
}
function checkCrowding(nodes) {
  const issues = [];
  const CROWDED_KINDS = /* @__PURE__ */ new Set([
    "bar-xlabel",
    "tick-label",
    "bar-value",
    "feels-like-value"
  ]);
  const VERTICAL_KINDS = /* @__PURE__ */ new Set(["tick-label"]);
  const groups = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    if (node.hidden || node.zeroSize) continue;
    if (!CROWDED_KINDS.has(node.nodeKind)) continue;
    const groupKey = `${node.panelId ?? "__root"}|${node.nodeKind}`;
    const existing = groups.get(groupKey);
    if (existing) {
      existing.push(node);
    } else {
      groups.set(groupKey, [node]);
    }
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const isVertical = VERTICAL_KINDS.has(group[0].nodeKind);
    const sorted = [...group].sort(
      (a3, b3) => isVertical ? a3.rect.y - b3.rect.y : a3.rect.x - b3.rect.x
    );
    for (let i7 = 0; i7 < sorted.length - 1; i7++) {
      const a3 = sorted[i7];
      const b3 = sorted[i7 + 1];
      const gap = isVertical ? verticalGap(a3.rect, b3.rect) : horizontalGap(a3.rect, b3.rect);
      if (gap >= 0 && gap < MIN_CROWDING_GAP_PX) {
        issues.push({
          severity: "warning",
          code: "crowding",
          stage: "rendered",
          message: `"${a3.nodeId}" and "${b3.nodeId}" (${a3.nodeKind}) are ${gap.toFixed(1)}px apart (min ${MIN_CROWDING_GAP_PX}px)`,
          nodeA: a3.nodeId,
          nodeB: b3.nodeId,
          panelId: a3.panelId ?? null,
          details: { gapPx: gap, minGapPx: MIN_CROWDING_GAP_PX, rectA: a3.rect, rectB: b3.rect }
        });
      }
    }
  }
  return issues;
}
function checkZeroSize(nodes) {
  const issues = [];
  const SKIP_ZERO_SIZE_KINDS = /* @__PURE__ */ new Set([
    "panel",
    "svg-root",
    "tick-guide",
    "bar",
    "feels-like",
    "bar-hitbox",
    "rowhead",
    "bar-selection"
  ]);
  for (const node of nodes) {
    if (node.hidden) continue;
    if (SKIP_ZERO_SIZE_KINDS.has(node.nodeKind)) continue;
    if (!node.zeroSize) continue;
    const dimension = node.rect.width === 0 ? "width" : "height";
    issues.push({
      severity: "error",
      code: "zero_size_visible",
      stage: "rendered",
      message: `Visible node "${node.nodeId}" (${node.nodeKind}) rendered with zero ${dimension}`,
      nodeA: node.nodeId,
      panelId: node.panelId ?? null,
      details: { rect: node.rect, zeroDimension: dimension }
    });
  }
  return issues;
}
function runRenderedValidation(root, _panelLayoutHints) {
  const hostEl = root instanceof ShadowRoot ? root.host : root;
  const hostDomRect = hostEl.getBoundingClientRect();
  const rootRect = {
    x: 0,
    y: 0,
    width: hostDomRect.width,
    height: hostDomRect.height,
    right: hostDomRect.width,
    bottom: hostDomRect.height
  };
  const nodes = collectRenderedNodes(root, hostDomRect);
  const panelIndex = /* @__PURE__ */ new Map();
  const svgIndex = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    if (node.nodeKind === "panel" && node.ownPanelKey !== null) {
      panelIndex.set(node.ownPanelKey, node);
    }
    if (node.nodeKind === "svg-root") {
      svgIndex.set(node.nodeId, node);
    }
  }
  const issues = [
    ...checkZeroSize(nodes),
    ...checkOverlaps(nodes),
    ...checkBounds(nodes, panelIndex, svgIndex),
    ...checkCrowding(nodes)
  ];
  const hiddenCount = nodes.filter((n4) => n4.hidden).length;
  const zeroSizeCount = nodes.filter((n4) => n4.zeroSize && !n4.hidden).length;
  const errorCount = issues.filter((i7) => i7.severity === "error").length;
  const warningCount = issues.filter((i7) => i7.severity === "warning").length;
  return {
    measuredAt: Date.now(),
    rootRect,
    nodes,
    issues,
    summary: {
      nodeCount: nodes.length,
      hiddenCount,
      zeroSizeCount,
      issueCount: issues.length,
      errorCount,
      warningCount
    }
  };
}
function logRenderedValidation(result) {
  if (typeof window === "undefined") return;
  const win = window;
  if (!win.WRBC_DEBUG_RENDERED && !win.WRBC_DEBUG) return;
  const { summary } = result;
  const label = `[WeatherRiskBridgeCard] Layer 2 \u2014 ${summary.nodeCount} nodes | ${summary.issueCount} issue(s) (${summary.errorCount} errors, ${summary.warningCount} warnings)`;
  if (summary.issueCount === 0) {
    console.log(`${label}: all clear`);
    return;
  }
  console.group(label);
  console.log(
    `Hidden: ${summary.hiddenCount}  ZeroSize (visible): ${summary.zeroSizeCount}`
  );
  for (const issue of result.issues) {
    const fn = issue.severity === "error" ? console.error : console.warn;
    const loc = issue.panelId ? ` [panel:${issue.panelId}]` : "";
    fn(`  [rendered/${issue.severity}] ${issue.code}${loc}: ${issue.message}`);
  }
  console.log("Full RenderedValidationResult:", result);
  console.groupEnd();
}

// src/weather-risk-bridge-card.ts
var CARD_TYPE = "weather-risk-bridge-card";
var EDITOR_TYPE = "weather-risk-bridge-card-editor";
var DEFAULT_RANGE = 4;
var DEFAULT_EDITOR_RANGE = 12;
var DEFAULT_MAX_ALERTS = 3;
var DEFAULT_TEMPERATURE_DISPLAY = "always";
var DEFAULT_PROBABILITY_AXIS_MODE = "adaptive";
var DEFAULT_TEMPERATURE_AXIS_MODE = "auto";
var DEFAULT_X_AXIS_LABEL_MODE = "compact";
var DEFAULT_SERIES_LAYOUT = "stacked";
var DEFAULT_SERIES_COLUMNS = 2;
var DEFAULT_LOW_RISK_BEHAVIOR = "icons";
var DEFAULT_LOW_RISK_THRESHOLD = 2;
var DEFAULT_WIND_THRESHOLD_MPH = 25;
var nextCardInstanceId = 0;
function resolvePrecipitationBarVisualMode(layout) {
  if (layout.panelKey !== "precipitation") return null;
  return layout.precipitation?.primaryRisk === "storm" ? "storm-primary" : "rain-primary";
}
function rangeLabel(rangeHours) {
  return `${rangeHours}h`;
}
function ambientImageUrl(fileName) {
  return new URL(`./assets/ambient-stage/${fileName}`, import.meta.url).href;
}
var AMBIENT_IMAGE_URLS = {
  clear_day: ambientImageUrl("Clear Day.webp"),
  clear_night: ambientImageUrl("Clear Night.webp"),
  sunrise_clear: ambientImageUrl("Sunrise Clear.webp"),
  sunrise_partly_cloudy: ambientImageUrl("Sunrise Partly Cloudy.webp"),
  sunrise_overcast: ambientImageUrl("Sunrise Overcast.webp"),
  sunrise_fog: ambientImageUrl("Sunrise Fog.webp"),
  sunrise_light_rain: ambientImageUrl("Sunrise Light Rain.webp"),
  sunset_clear: ambientImageUrl("Sunset Clear.webp"),
  sunset_partly_cloudy: ambientImageUrl("Sunset Partly Cloudy.webp"),
  sunset_overcast: ambientImageUrl("Sunset Overcast.webp"),
  twilight_blue_hour_clear: ambientImageUrl("Twilight Blue Hour Clear.webp"),
  partly_cloudy_day: ambientImageUrl("Sunny Day Low Clouds.webp"),
  partly_cloudy_night: ambientImageUrl("Partly Cloudy Night.webp"),
  cloudy: ambientImageUrl("Cloudy Day.webp"),
  cloudy_night: ambientImageUrl("Cloudy Night.webp"),
  rain: ambientImageUrl("Light Rain Day.webp"),
  rain_night: ambientImageUrl("Rain Night.webp"),
  storm: ambientImageUrl("Stormy Day.webp"),
  storm_night: ambientImageUrl("Storm Night.webp"),
  fog: ambientImageUrl("Foggy Day.webp"),
  fog_night: ambientImageUrl("Foggy Night.webp"),
  snow: ambientImageUrl("Snow Day.webp"),
  snow_night: ambientImageUrl("Snow Night.webp")
};
function getAmbientSceneImageUrl(scene) {
  return AMBIENT_IMAGE_URLS[scene?.preset ?? "cloudy"];
}
function buildLocationFormState(defaults, location) {
  return {
    entry_id: location?.entry_id ?? "",
    label: location?.label ?? defaults?.label ?? "",
    latitude: typeof defaults?.latitude === "number" ? String(defaults.latitude) : "",
    longitude: typeof defaults?.longitude === "number" ? String(defaults.longitude) : "",
    service_url: defaults?.service_url ?? "",
    bearer_token: "",
    wind_threshold_mph: String(
      defaults?.wind_threshold_mph ?? DEFAULT_WIND_THRESHOLD_MPH
    )
  };
}
function deriveLocationTitle(label, latitude, longitude) {
  const trimmedLabel = label.trim();
  if (trimmedLabel) {
    return trimmedLabel;
  }
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}
function flowDefaultsFromSchema(schema, fallback) {
  const values = new Map((schema ?? []).map((field) => [field.name, field.default]));
  return {
    label: String(values.get("label") ?? fallback?.label ?? ""),
    latitude: Number(values.get("latitude") ?? fallback?.latitude ?? 0),
    longitude: Number(values.get("longitude") ?? fallback?.longitude ?? 0),
    service_url: String(values.get("service_url") ?? fallback?.service_url ?? ""),
    wind_threshold_mph: Number(
      values.get("wind_threshold_mph") ?? fallback?.wind_threshold_mph ?? DEFAULT_WIND_THRESHOLD_MPH
    )
  };
}
function locationFormStateFromSchema(schema, fallback, entryId = "") {
  const values = new Map((schema ?? []).map((field) => [field.name, field.default]));
  return {
    entry_id: entryId,
    label: String(values.get("label") ?? fallback?.label ?? ""),
    latitude: String(values.get("latitude") ?? fallback?.latitude ?? ""),
    longitude: String(values.get("longitude") ?? fallback?.longitude ?? ""),
    service_url: String(values.get("service_url") ?? fallback?.service_url ?? ""),
    bearer_token: String(values.get("bearer_token") ?? ""),
    wind_threshold_mph: String(
      values.get("wind_threshold_mph") ?? fallback?.wind_threshold_mph ?? DEFAULT_WIND_THRESHOLD_MPH
    )
  };
}
function normalizeMaxAlerts(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_MAX_ALERTS;
  }
  return Math.min(Math.max(Math.round(value), 1), 5);
}
function normalizeSeriesColumns(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_SERIES_COLUMNS;
  }
  const rounded = Math.round(value);
  return rounded === 3 || rounded === 4 ? rounded : 2;
}
function normalizeLowRiskThreshold(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_LOW_RISK_THRESHOLD;
  }
  return Math.min(Math.max(Math.round(value), 0), 10);
}
function normalizeProbabilityAxisMode(value) {
  switch (value) {
    case "auto":
    case "fixed_10":
    case "fixed_25":
    case "fixed_50":
    case "fixed_100":
    case "adaptive":
      return value;
    default:
      return DEFAULT_PROBABILITY_AXIS_MODE;
  }
}
function normalizeLowRiskBehavior(value) {
  switch (value) {
    case "show":
    case "hide":
    case "icons":
      return value;
    case "message":
      return "icons";
    default:
      return DEFAULT_LOW_RISK_BEHAVIOR;
  }
}
function normalizeCardConfig(config = {}) {
  const normalizedLocation = typeof config.location === "string" ? normalizeLocationKey(config.location) : "";
  const inferredLocation = !normalizedLocation && typeof config.entity === "string" && config.entity.trim() ? deriveLocationKeyFromEntityId(config.entity.trim()) : "";
  const normalized = {
    type: typeof config.type === "string" ? config.type : `custom:${CARD_TYPE}`,
    entity: typeof config.entity === "string" ? config.entity : "",
    default_range: rangeValues().includes(config.default_range) ? config.default_range : DEFAULT_RANGE,
    show_alerts: config.show_alerts !== false,
    max_alerts: normalizeMaxAlerts(config.max_alerts),
    temperature_display: config.temperature_display === "fallback_only" ? "fallback_only" : DEFAULT_TEMPERATURE_DISPLAY,
    probability_axis_mode: normalizeProbabilityAxisMode(config.probability_axis_mode),
    temperature_axis_mode: config.temperature_axis_mode === "fixed_span_20f" ? "fixed_span_20f" : DEFAULT_TEMPERATURE_AXIS_MODE,
    show_y_axis_labels: config.show_y_axis_labels !== false,
    x_axis_labels: config.x_axis_labels === "full" || config.x_axis_labels === "off" ? config.x_axis_labels : DEFAULT_X_AXIS_LABEL_MODE,
    series_layout: config.series_layout === "grid" ? "grid" : DEFAULT_SERIES_LAYOUT,
    series_columns: normalizeSeriesColumns(config.series_columns),
    low_risk_behavior: normalizeLowRiskBehavior(config.low_risk_behavior),
    low_risk_threshold: normalizeLowRiskThreshold(config.low_risk_threshold),
    // Curve experiment rolled back: default to no celestial track unless explicitly enabled.
    celestial_track: config.celestial_track === true
  };
  if (typeof config.title === "string" && config.title.trim()) {
    normalized.title = config.title.trim();
  }
  if (normalizedLocation || inferredLocation) {
    normalized.location = normalizedLocation || inferredLocation;
    if (!normalized.entity) {
      normalized.entity = chartEntityIdForLocation(normalized.location, DEFAULT_RANGE);
    }
  }
  if (typeof config.weather_entity === "string" && config.weather_entity.trim()) {
    normalized.weather_entity = config.weather_entity.trim();
  }
  return normalized;
}
function emitConfigChanged(element, config) {
  element.dispatchEvent(
    new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true
    })
  );
}
function stubConfig(hass) {
  const entity = cardEntityOptions(hass?.states ?? {})[0] ?? "";
  return normalizeCardConfig({
    type: `custom:${CARD_TYPE}`,
    entity,
    location: deriveLocationKeyFromEntityId(entity),
    title: "Weather Risk",
    default_range: DEFAULT_EDITOR_RANGE,
    show_alerts: true,
    max_alerts: DEFAULT_MAX_ALERTS,
    temperature_display: DEFAULT_TEMPERATURE_DISPLAY,
    probability_axis_mode: DEFAULT_PROBABILITY_AXIS_MODE,
    temperature_axis_mode: DEFAULT_TEMPERATURE_AXIS_MODE,
    show_y_axis_labels: true,
    x_axis_labels: DEFAULT_X_AXIS_LABEL_MODE,
    series_layout: DEFAULT_SERIES_LAYOUT,
    series_columns: DEFAULT_SERIES_COLUMNS,
    low_risk_behavior: DEFAULT_LOW_RISK_BEHAVIOR,
    low_risk_threshold: DEFAULT_LOW_RISK_THRESHOLD
  });
}
function renderDetailPill(pill, handlers) {
  const content = b2`
    ${pill.badgeTone ? b2`<span class="detail-pill-badge" data-tone=${pill.badgeTone}></span>` : b2`<ha-icon .icon=${pill.icon ?? "mdi:circle"}></ha-icon>`}
    <span class="detail-pill-copy${pill.scale ? " detail-pill-copy-scaled" : ""}">
      <span class="detail-pill-copy-top">
        <span class="detail-pill-label">${pill.label}</span>
        <span class="detail-pill-value">${pill.value}</span>
      </span>
      ${pill.scale ? b2`
            <span
              class="detail-pill-scale"
              aria-hidden="true"
              style=${[
    pill.scale.position !== null ? `--pill-scale-position:${pill.scale.position};` : "",
    pill.scale.peakPosition !== null ? `--pill-scale-peak-position:${pill.scale.peakPosition};` : ""
  ].join(" ")}
            >
              <span class="detail-pill-scale-track"></span>
              <span
                class="detail-pill-scale-peak${pill.scale.peakPosition === null ? " is-hidden" : ""}"
              ></span>
              <span
                class="detail-pill-scale-marker${pill.scale.position === null ? " is-hidden" : ""}"
              ></span>
            </span>
          ` : A}
    </span>
  `;
  if (pill.detailText) {
    return b2`
      <button
        type="button"
        class="detail-pill detail-pill-button"
        data-kind=${pill.kind}
        data-accent=${pill.accent ?? "default"}
        data-node-id=${pill.nodeId}
        data-node-kind="detail-pill"
        title=${pill.title}
        aria-label=${pill.ariaLabel}
        @pointerenter=${(event) => handlers.show(event, pill.detailText)}
        @focus=${(event) => handlers.show(event, pill.detailText)}
        @pointerleave=${handlers.hide}
        @blur=${handlers.hide}
      >
        ${content}
      </button>
    `;
  }
  return b2`
    <span
      class="detail-pill"
      data-kind=${pill.kind}
      data-accent=${pill.accent ?? "default"}
      data-node-id=${pill.nodeId}
      data-node-kind="detail-pill"
      title=${pill.title}
    >
      ${content}
    </span>
  `;
}
function renderDetailPillRail(pills, handlers) {
  const rows = [];
  for (let index = 0; index < pills.length; index += 1) {
    const pill = pills[index];
    const next = pills[index + 1];
    if (pill.kind === "humidity" && next?.kind === "dew_point") {
      rows.push(b2`
        <div class="hero-pill-pair" data-node-id="pill-moisture-pair" data-node-kind="detail-pill-pair">
          ${renderDetailPill(pill, handlers)}
          ${renderDetailPill(next, handlers)}
        </div>
      `);
      index += 1;
      continue;
    }
    rows.push(renderDetailPill(pill, handlers));
  }
  return rows;
}
function renderHeaderAlertChip(chip) {
  return b2`
    <span
      class="hero-alert-chip"
      data-tone=${chip.tone}
      data-node-id=${chip.nodeId}
      data-node-kind="alert-chip"
      title=${chip.title}
    >
      ${chip.compactText}
    </span>
  `;
}
function renderHeroOverviewMetric(metric, tone = "primary") {
  if (!metric) return A;
  return b2`
    <span
      class="hero-overview-metric"
      data-tone=${tone}
      title=${metric.title}
      data-node-id=${metric.nodeId}
      data-node-kind="metric-pill"
    >
      <span class="hero-overview-label">${metric.label}</span>
      <span class="hero-overview-value">${metric.value}</span>
    </span>
  `;
}
var CHART_COMPACT_MEDIA = "(max-width: 720px)";
var WeatherRiskBridgeCard = class extends i4 {
  constructor() {
    super(...arguments);
    this._selectedRange = DEFAULT_RANGE;
    this._compactChart = false;
    this._selectedTemperatureTooltipIndex = null;
    this._selectedTooltipPanelKey = null;
    this._detailTooltip = null;
    this._temperatureTooltipViewportRange = null;
    this._compactChartMedia = null;
    this._instanceId = ++nextCardInstanceId;
    this._rangeRepaintFrame = null;
    /** Skip full pipeline when hass churns for unrelated entities. */
    this._lastHassFingerprint = "";
    // --- Layer 2 rendered validation fields (non-reactive; no update loop) ---
    /**
     * Panel layouts captured from the most recent render pass.
     * Passed to runRenderedValidation for future model-vs-render diff.
     */
    this._cachedPanelLayouts = [];
    /** Last rendered validation result. Exposed via the public getter below. */
    this._lastRenderedValidation = void 0;
    /** Debounce timer handle for the post-render validation pass. */
    this._renderedValidationTimer = null;
    this._onCompactChartChange = (e6) => {
      this._compactChart = e6.matches;
    };
    this._hideDetailTooltip = () => {
      if (!this._detailTooltip) return;
      this._detailTooltip = null;
    };
    this._handlePlotScroll = () => {
      this._clearTemperatureTooltip();
    };
  }
  /**
   * Returns the most recent Layer 2 rendered-validation result.
   * Useful for external tooling and screenshot-review workflows:
   *   document.querySelector("weather-risk-bridge-card").lastRenderedValidation
   * Only populated when WRBC_DEBUG_RENDERED or WRBC_DEBUG is truthy.
   */
  get lastRenderedValidation() {
    return this._lastRenderedValidation;
  }
  connectedCallback() {
    super.connectedCallback();
    this._compactChartMedia = window.matchMedia(CHART_COMPACT_MEDIA);
    this._compactChart = this._compactChartMedia.matches;
    this._compactChartMedia.addEventListener("change", this._onCompactChartChange);
  }
  disconnectedCallback() {
    this._compactChartMedia?.removeEventListener("change", this._onCompactChartChange);
    this._compactChartMedia = null;
    if (this._renderedValidationTimer !== null) {
      clearTimeout(this._renderedValidationTimer);
      this._renderedValidationTimer = null;
    }
    if (this._rangeRepaintFrame !== null) {
      cancelAnimationFrame(this._rangeRepaintFrame);
      this._rangeRepaintFrame = null;
    }
    super.disconnectedCallback();
  }
  shouldUpdate(changedProperties) {
    if (changedProperties.size === 0) {
      return false;
    }
    const hassOnly = changedProperties.has("hass") && changedProperties.size === 1;
    if (!hassOnly) {
      if (changedProperties.has("hass") || !this._lastHassFingerprint) {
        this._lastHassFingerprint = this._computeHassFingerprint();
      }
      return true;
    }
    const next = this._computeHassFingerprint();
    if (next === this._lastHassFingerprint) {
      return false;
    }
    this._lastHassFingerprint = next;
    return true;
  }
  _computeHassFingerprint() {
    if (!this._normalizedConfig) {
      return "";
    }
    return fingerprintWeatherRiskHassData({
      location: this._normalizedConfig.location,
      entity: this._normalizedConfig.entity,
      weatherEntity: this._normalizedConfig.weather_entity,
      selectedRange: this._selectedRange,
      hass: this.hass
    });
  }
  _showDetailTooltip(event, detailText) {
    const trigger = event.currentTarget;
    const wrap = this.renderRoot.querySelector(".wrap");
    if (!(trigger instanceof HTMLElement) || !(wrap instanceof HTMLElement)) return;
    const wrapRect = wrap.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const width = Math.max(180, Math.min(320, wrapRect.width - 16));
    const estimatedHeight = Math.max(48, Math.ceil(detailText.length / 36) * 18 + 18);
    const belowTop = triggerRect.bottom - wrapRect.top + 10;
    const aboveTop = triggerRect.top - wrapRect.top - estimatedHeight - 10;
    const placement = belowTop + estimatedHeight > wrapRect.height - 8 && aboveTop >= 8 ? "above" : "below";
    const top = placement === "above" ? aboveTop : belowTop;
    const centerX = triggerRect.left + triggerRect.width / 2 - wrapRect.left;
    const left = Math.min(Math.max(centerX - width / 2, 8), Math.max(8, wrapRect.width - width - 8));
    const pointerLeft = Math.min(Math.max(centerX - left - 7, 18), width - 26);
    this._detailTooltip = {
      text: detailText,
      left,
      top,
      width,
      pointerLeft,
      placement
    };
  }
  _updateTemperatureTooltipViewport(anchor) {
    if (!(anchor instanceof Element)) {
      this._temperatureTooltipViewportRange = null;
      return;
    }
    const plot = anchor.closest(".plot");
    const svg = plot?.querySelector(".chart-svg");
    if (!(plot instanceof HTMLElement) || !(svg instanceof SVGSVGElement)) {
      this._temperatureTooltipViewportRange = null;
      return;
    }
    const viewBoxWidth = svg.viewBox.baseVal?.width || svg.clientWidth || 0;
    const scaleX = svg.clientWidth > 0 && viewBoxWidth > 0 ? viewBoxWidth / svg.clientWidth : 1;
    this._temperatureTooltipViewportRange = {
      left: plot.scrollLeft * scaleX,
      right: (plot.scrollLeft + plot.clientWidth) * scaleX
    };
  }
  static getConfigForm() {
    return {
      schema: [
        {
          name: "entity",
          required: true,
          selector: {
            entity: {
              filter: [
                {
                  integration: "weather_risk_bridge",
                  domain: "sensor"
                }
              ]
            }
          }
        },
        { name: "title", selector: { text: {} } },
        {
          type: "grid",
          name: "",
          flatten: true,
          schema: [
            {
              name: "default_range",
              selector: {
                select: {
                  options: [
                    { label: "Now / 1h nowcast (when available)", value: "1" },
                    { label: "4 hours", value: "4" },
                    { label: "12 hours", value: "12" },
                    { label: "24 hours", value: "24" },
                    { label: "48 hours", value: "48" }
                  ]
                }
              }
            }
          ]
        },
        {
          type: "grid",
          name: "",
          flatten: true,
          schema: [
            {
              name: "probability_axis_mode",
              selector: {
                select: {
                  options: [
                    { label: "Adaptive risk scale", value: "adaptive" },
                    { label: "Fixed 0 to 10%", value: "fixed_10" },
                    { label: "Fixed 0 to 25%", value: "fixed_25" },
                    { label: "Fixed 0 to 50%", value: "fixed_50" },
                    { label: "Fixed 0 to 100%", value: "fixed_100" },
                    { label: "Auto scale to current peak", value: "auto" }
                  ]
                }
              }
            },
            {
              name: "temperature_axis_mode",
              selector: {
                select: {
                  options: [
                    { label: "Auto scale to visible temperatures", value: "auto" },
                    { label: "Fixed 20F span around forecast center", value: "fixed_span_20f" }
                  ]
                }
              }
            },
            {
              name: "x_axis_labels",
              selector: {
                select: {
                  options: [
                    { label: "Compact", value: "compact" },
                    { label: "Full", value: "full" },
                    { label: "Off", value: "off" }
                  ]
                }
              }
            }
          ]
        },
        {
          type: "grid",
          name: "",
          flatten: true,
          schema: [
            {
              name: "low_risk_behavior",
              selector: {
                select: {
                  options: [
                    { label: "Show muted inactive hazard icons", value: "icons" },
                    { label: "Hide quiet hazards entirely", value: "hide" },
                    { label: "Always show quiet hazard charts", value: "show" }
                  ]
                }
              }
            },
            {
              name: "low_risk_threshold",
              selector: {
                select: {
                  options: [
                    { label: "0%", value: "0" },
                    { label: "1%", value: "1" },
                    { label: "2%", value: "2" },
                    { label: "5%", value: "5" },
                    { label: "10%", value: "10" }
                  ]
                }
              }
            },
            {
              name: "temperature_display",
              selector: {
                select: {
                  options: [
                    { label: "Always show temperature", value: "always" },
                    { label: "Only show temperature when hazards are quiet", value: "fallback_only" }
                  ]
                }
              }
            }
          ]
        },
        {
          type: "grid",
          name: "",
          flatten: true,
          schema: [
            { name: "show_y_axis_labels", selector: { boolean: {} } },
            { name: "show_alerts", selector: { boolean: {} } },
            {
              name: "max_alerts",
              selector: {
                select: {
                  options: [
                    { label: "1", value: "1" },
                    { label: "2", value: "2" },
                    { label: "3", value: "3" },
                    { label: "4", value: "4" },
                    { label: "5", value: "5" }
                  ]
                }
              }
            }
          ]
        }
      ],
      computeLabel: (schema) => {
        switch (schema.name) {
          case "entity":
            return "Configured location";
          case "title":
            return "Card title";
          case "default_range":
            return "Default range";
          case "probability_axis_mode":
            return "Probability axis";
          case "temperature_axis_mode":
            return "Temperature axis";
          case "x_axis_labels":
            return "X axis labels";
          case "low_risk_behavior":
            return "Quiet forecast handling";
          case "low_risk_threshold":
            return "Quiet forecast threshold";
          case "temperature_display":
            return "Temperature display";
          case "show_y_axis_labels":
            return "Show y axis labels";
          case "show_alerts":
            return "Show alert chips";
          case "max_alerts":
            return "Alert chip limit";
          default:
            return void 0;
        }
      },
      computeHelper: (schema) => {
        switch (schema.name) {
          case "entity":
            return "Choose the 4h chart entity for an existing Weather Risk Bridge location. To add a new location, open Settings > Devices & Services > Integrations > Weather Risk Bridge.";
          case "title":
            return "Overrides the card heading.";
          case "default_range":
            return "Sets the first horizon shown when the dashboard loads. Now / 1h appears only when minute nowcast is ready.";
          case "probability_axis_mode":
            return "Adaptive is the recommended default for low-risk periods.";
          case "temperature_axis_mode":
            return "Fixed 20F span keeps 4h, 12h, 24h, and 48h on the same kind of temperature scale.";
          case "x_axis_labels":
            return "Compact shows a few time labels, full shows every label, and off gives the cleanest plot.";
          case "low_risk_behavior":
            return "Controls what happens when hazard risk stays at or below the quiet threshold.";
          case "low_risk_threshold":
            return "A threshold of 2 percent hides or smooths away nearly-no-risk cases.";
          case "temperature_display":
            return "Controls whether temperature stays visible beside hazard probabilities or only appears on quiet forecasts.";
          case "show_y_axis_labels":
            return "Displays the left-side scale labels for each series.";
          case "show_alerts":
            return "Shows active alert badges above the graph.";
          case "max_alerts":
            return "Limits how many active alerts are shown.";
          default:
            return void 0;
        }
      }
    };
  }
  static getStubConfig(hass) {
    return stubConfig(hass);
  }
  setConfig(config) {
    const normalized = normalizeCardConfig(config);
    if (!normalized.entity && !normalized.location) {
      throw new Error("entity or location is required");
    }
    this._config = normalized;
    this._normalizedConfig = normalized;
    this._selectedRange = normalized.default_range ?? DEFAULT_RANGE;
  }
  /** Map the normalized CardConfig to a PipelineConfig for the pipeline layers. */
  _buildPipelineConfig(selectedRange, rangeOptions) {
    const c4 = this._normalizedConfig;
    return {
      selectedRange,
      rangeOptions,
      title: c4.title ?? "Weather Risk",
      temperatureDisplay: c4.temperature_display ?? DEFAULT_TEMPERATURE_DISPLAY,
      probabilityAxisMode: c4.probability_axis_mode ?? DEFAULT_PROBABILITY_AXIS_MODE,
      temperatureAxisMode: c4.temperature_axis_mode ?? DEFAULT_TEMPERATURE_AXIS_MODE,
      xAxisLabels: c4.x_axis_labels ?? DEFAULT_X_AXIS_LABEL_MODE,
      showYAxisLabels: c4.show_y_axis_labels !== false,
      seriesLayout: c4.series_layout ?? DEFAULT_SERIES_LAYOUT,
      seriesColumns: c4.series_columns ?? DEFAULT_SERIES_COLUMNS,
      lowRiskBehavior: c4.low_risk_behavior ?? DEFAULT_LOW_RISK_BEHAVIOR,
      lowRiskThreshold: c4.low_risk_threshold ?? DEFAULT_LOW_RISK_THRESHOLD,
      showAlerts: c4.show_alerts !== false,
      maxAlerts: c4.max_alerts ?? DEFAULT_MAX_ALERTS,
      showCelestialTrack: c4.celestial_track === true
    };
  }
  _resolveRuntimeRangeConfig() {
    if (!this.hass || !this._normalizedConfig) {
      const fallback = strategicRangeValues();
      return { rangeOptions: fallback, selectedRange: fallback[0] };
    }
    const canonical = rangeValues();
    const strategic = strategicRangeValues();
    const normalizedLocation = normalizeLocationKey(this._normalizedConfig.location ?? "");
    const baseEntityId = normalizedLocation ? baseEntityIdForLocation(normalizedLocation) : deriveBaseEntityId(this._normalizedConfig.entity);
    const availableRanges = canonical.filter(
      (rangeHours) => Boolean(this.hass.states[entityIdForRange(baseEntityId, rangeHours)])
    );
    const strategicAvailable = strategic.filter((rangeHours) => availableRanges.includes(rangeHours));
    let rangeOptions = strategicAvailable.length > 0 ? [...strategicAvailable] : availableRanges.filter((rangeHours) => rangeHours !== 1);
    const oneHourEntityId = entityIdForRange(baseEntityId, 1);
    const oneHourState = this.hass.states[oneHourEntityId];
    const oneHourMode = oneHourState ? assessOneHourNowcastModeFromAttributes(oneHourState.attributes ?? {}) : "missing_data";
    if (oneHourState && oneHourMode === "ready") {
      const visibleSet = /* @__PURE__ */ new Set([1, ...rangeOptions]);
      rangeOptions = canonical.filter((rangeHours) => visibleSet.has(rangeHours));
    }
    if (rangeOptions.length === 0) {
      rangeOptions = strategic;
    }
    const selectedRange = rangeOptions.includes(this._selectedRange) ? this._selectedRange : rangeOptions.includes(4) ? 4 : rangeOptions[0];
    return { rangeOptions, selectedRange };
  }
  getCardSize() {
    return 6;
  }
  getGridOptions() {
    return {
      columns: 6,
      min_columns: 6,
      max_columns: 12
    };
  }
  render() {
    if (!this.hass || !this._normalizedConfig) {
      return b2`<ha-card><div class="missing">Card is not ready.</div></ha-card>`;
    }
    const runtimeRange = this._resolveRuntimeRangeConfig();
    const pipelineConfig = this._buildPipelineConfig(
      runtimeRange.selectedRange,
      runtimeRange.rangeOptions
    );
    const sourceResult = resolveEntityBundle(
      this._normalizedConfig.location,
      this._normalizedConfig.entity,
      this._normalizedConfig.weather_entity,
      this.hass,
      pipelineConfig.selectedRange
    );
    if (sourceResult.bundle.entityStatus === "missing") {
      return b2`<ha-card><div class="missing">Missing entity: ${sourceResult.bundle.resolved.chartEntityId}</div></ha-card>`;
    }
    if (sourceResult.bundle.entityStatus === "unavailable" || sourceResult.bundle.entityStatus === "unknown") {
      return b2`
        <ha-card>
          <div class="missing">
            Weather Risk data is currently unavailable. Check the Weather Risk Bridge service and HA integration logs.
          </div>
        </ha-card>
      `;
    }
    const domainResult = buildCardDomainModel(sourceResult.bundle, pipelineConfig);
    if (!domainResult.domain) {
      return b2`<ha-card><div class="missing">Unable to parse Weather Risk data for ${sourceResult.bundle.resolved.chartEntityId}.</div></ha-card>`;
    }
    const vmResult = buildCardViewModel(domainResult.domain, pipelineConfig);
    const vm = vmResult.viewModel;
    const temperatureHeader = vm.header.temperature;
    const ambientScene = temperatureHeader?.ambientScene ?? null;
    const ambientSceneImageUrl = getAmbientSceneImageUrl(ambientScene);
    const detailTooltipHandlers = {
      show: (event, detailText) => this._showDetailTooltip(event, detailText),
      hide: () => this._hideDetailTooltip()
    };
    if (vm.panels.length === 0) {
      return b2`
        <ha-card>
          <div class="missing">
            Weather Risk returned no graphable series for ${sourceResult.bundle.resolved.chartEntityId}.
          </div>
        </ha-card>
      `;
    }
    const sharedHorizontalLayout = vm.seriesLayout === "stacked" ? resolveSharedPanelHorizontalLayout(vm.panels, pipelineConfig) : null;
    const layoutResults = vm.panels.map(
      (panel) => buildPanelLayoutModel(
        panel,
        pipelineConfig,
        panel.panelKey === this._selectedTooltipPanelKey ? this._selectedTemperatureTooltipIndex : null,
        panel.panelKey === this._selectedTooltipPanelKey ? this._temperatureTooltipViewportRange : null,
        sharedHorizontalLayout
      )
    );
    if (typeof window !== "undefined" && window.WRBC_DEBUG) {
      logPipelineDiagnostics(
        snapPipelineDiagnostics(sourceResult, domainResult, vmResult, layoutResults)
      );
    }
    this._cachedPanelLayouts = layoutResults.map((r4) => r4.layout);
    return b2`
      <ha-card>
        <div class="wrap">
          <section
            class="card-hero"
            data-scene=${ambientScene?.preset ?? "cloudy"}
            data-alert-tone=${ambientScene?.alertTone ?? "none"}
          >
            <div class="card-hero-scene-backdrop" aria-hidden="true">
              <img class="card-hero-scene-backdrop-image" src=${ambientSceneImageUrl} alt="" />
            </div>
            <div class="card-hero-grid">
              <div class="hero-overview">
                <div class="hero-overview-primary">
                  ${renderHeroOverviewMetric(temperatureHeader?.currentTemperature ?? null)}
                  ${renderHeroOverviewMetric(temperatureHeader?.feelsLike ?? null)}
                </div>
                <div class="hero-overview-secondary">
                  ${temperatureHeader?.dailyRange ? renderHeroOverviewMetric(temperatureHeader.dailyRange, "supporting") : A}
                </div>
              </div>
              <div class="hero-range-cell">
                <div class="ranges">
                  ${vm.rangeOptions.map(
      (rangeHours) => b2`
                      <button
                        type="button"
                        ?selected=${vm.selectedRange === rangeHours}
                        @click=${() => this._selectRange(rangeHours)}
                      >
                        ${rangeLabel(rangeHours)}
                      </button>
                    `
    )}
                </div>
              </div>
              <div class="hero-pill-rail">
                ${renderDetailPillRail(
      [
        ...temperatureHeader?.defaultDetails ?? [],
        ...temperatureHeader?.extraDetails ?? []
      ],
      detailTooltipHandlers
    )}
                ${vm.showAlerts && vm.header.alertChips.length > 0 ? b2`
                      <div class="hero-pill-rail-alerts">
                        <div class="hero-alerts">
                          ${vm.header.alertChips.map((chip) => renderHeaderAlertChip(chip))}
                        </div>
                      </div>
                    ` : A}
              </div>
            </div>
          </section>
          <div
            class="series"
            data-layout=${vm.seriesLayout}
            style=${`--series-columns:${vm.seriesColumns}`}
          >
            ${layoutResults.map((layoutResult, i7) => {
      const panel = vm.panels[i7];
      const header = panel.isTemperature ? vm.header.temperature : null;
      return this._renderChartPanel(layoutResult.layout, header, vm);
    })}
          </div>
          ${this._detailTooltip ? b2`
                <div
                  class="floating-detail-tooltip"
                  data-placement=${this._detailTooltip.placement}
                  style=${`left:${this._detailTooltip.left}px;top:${this._detailTooltip.top}px;width:${this._detailTooltip.width}px;--pointer-left:${this._detailTooltip.pointerLeft}px;`}
                >
                  ${this._detailTooltip.text}
                </div>
              ` : A}
        </div>
      </ha-card>
    `;
  }
  // ----------------------------------------------------------------
  // Layer 2 — Post-render DOM validation
  // ----------------------------------------------------------------
  /**
   * Called by Lit after every update cycle. Schedules the Layer 2 rendered
   * validation pass in a debounced setTimeout so it runs after the browser
   * has finished painting. The guard means this is a no-op in normal use.
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("_selectedRange")) {
      this._refreshPlotsAfterRangeChange();
    }
    this._scheduleRenderedValidation();
  }
  _refreshPlotsAfterRangeChange() {
    const root = this.shadowRoot;
    if (!root) return;
    const plots = [...root.querySelectorAll(".plot")];
    const svgs = plots.map((plot) => plot.querySelector(".chart-svg")).filter((svg) => svg instanceof SVGSVGElement);
    for (const plot of plots) {
      plot.scrollLeft = 0;
    }
    for (const svg of svgs) {
      svg.style.transform = "translateZ(0)";
      void svg.getBoundingClientRect();
    }
    if (this._rangeRepaintFrame !== null) {
      cancelAnimationFrame(this._rangeRepaintFrame);
    }
    this._rangeRepaintFrame = requestAnimationFrame(() => {
      this._rangeRepaintFrame = null;
      for (const svg of svgs) {
        svg.style.transform = "";
      }
    });
  }
  /**
   * Schedule a rendered validation pass, debounced to 50 ms.
   * Only active when WRBC_DEBUG_RENDERED or WRBC_DEBUG is truthy; returns
   * immediately otherwise so rapid renders incur no overhead.
   */
  _scheduleRenderedValidation() {
    if (typeof window === "undefined") return;
    const win = window;
    if (!win.WRBC_DEBUG_RENDERED && !win.WRBC_DEBUG) return;
    if (this._renderedValidationTimer !== null) {
      clearTimeout(this._renderedValidationTimer);
    }
    this._renderedValidationTimer = setTimeout(() => {
      this._renderedValidationTimer = null;
      this._executeRenderedValidation();
    }, 50);
  }
  /**
   * Run the Layer 2 rendered validation pass synchronously.
   * Measures all traced DOM nodes, runs checks, stores the result in
   * _lastRenderedValidation, and logs it via logRenderedValidation.
   */
  _executeRenderedValidation() {
    const root = this.shadowRoot ?? this;
    const result = runRenderedValidation(root, this._cachedPanelLayouts);
    this._lastRenderedValidation = result;
    logRenderedValidation(result);
  }
  /**
   * Render a single chart panel from the pre-computed PanelLayoutModel and
   * optional TemperatureHeaderViewModel. This method is a pure template
   * mapping — no layout math, no semantic derivation, no HA data access.
   */
  _renderChartPanel(layout, header, vm) {
    const { tooltip, selectedBarHighlight } = layout;
    const panelVm = vm.panels.find((panel) => panel.panelKey === layout.panelKey) ?? null;
    const temperatureDensityHint = layout.showAllBarValueLabels ? "All bar labels shown; tap bars for exact values" : layout.densityMode === "comfortable" ? "Tap a bar for details" : layout.densityMode === "compact" ? "Anchor labels shown; tap bars for details" : "Anchor labels shown; tap bars for exact values";
    const chartRenderKey = `${layout.panelKey}:${vm.selectedRange}`;
    const hazardGradientId = `hazardGrad-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}`;
    const isPrecipitationPanel = layout.panelKey === "precipitation";
    const precipitationVisualMode = resolvePrecipitationBarVisualMode(layout);
    const isRainPrimaryPrecipitation = precipitationVisualMode === "rain-primary";
    const isStormPrimaryPrecipitation = precipitationVisualMode === "storm-primary";
    const precipitationBarBaseGradientId = `precipBarBase-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}`;
    const precipitationCloudGradientId = `precipCloud-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}`;
    const precipitationPoolGradientId = `precipPool-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}`;
    const precipitationStreakPatternId = `precipStreak-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}`;
    const precipitationStormBaseGradientId = `precipStormBase-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}`;
    const precipitationStormChargeGradientId = `precipStormCharge-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}`;
    const precipitationStormChargePatternId = `precipStormTexture-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}`;
    const stormCapGradientId = `stormCap-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}`;
    const svgChart = w`
      <svg
        class="chart-svg"
        viewBox=${layout.svgViewBox}
        preserveAspectRatio="xMidYMax meet"
        style=${layout.svgStyle}
        role="img"
        aria-label=${`${layout.panelKey} chart`}
        data-node-id=${layout.nodeId}
        data-node-kind="svg-root"
        @pointerdown=${this._handleChartPointerDown}
      >
        <defs>
          ${layout.temperatureGradients.map(
      (grad) => w`
              <linearGradient id=${grad.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color=${grad.colors.top}></stop>
                <stop offset="50%" stop-color=${grad.colors.transition}></stop>
                <stop offset="100%" stop-color=${grad.colors.bottom}></stop>
              </linearGradient>
            `
    )}
          <linearGradient id=${hazardGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#67c6ff" stop-opacity="0.95"></stop>
            <stop offset="100%" stop-color="#286cff" stop-opacity="0.65"></stop>
          </linearGradient>
          ${isPrecipitationPanel ? w`
                <linearGradient id=${precipitationBarBaseGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#87d4ff" stop-opacity="0.9"></stop>
                  <stop offset="54%" stop-color="#4e9ee0" stop-opacity="0.86"></stop>
                  <stop offset="100%" stop-color="#2f5f9f" stop-opacity="0.94"></stop>
                </linearGradient>
                <linearGradient id=${precipitationCloudGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(244, 250, 255, 0.4)"></stop>
                  <stop offset="55%" stop-color="rgba(182, 208, 236, 0.16)"></stop>
                  <stop offset="100%" stop-color="rgba(138, 175, 214, 0)"></stop>
                </linearGradient>
                <linearGradient id=${precipitationPoolGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(17, 41, 77, 0)"></stop>
                  <stop offset="62%" stop-color="rgba(17, 41, 77, 0.22)"></stop>
                  <stop offset="100%" stop-color="rgba(11, 24, 45, 0.45)"></stop>
                </linearGradient>
                <pattern
                  id=${precipitationStreakPatternId}
                  width="12"
                  height="12"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(24)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="12"
                    stroke="rgba(220, 238, 255, 0.22)"
                    stroke-width="1.1"
                    stroke-linecap="round"
                  ></line>
                </pattern>
                <linearGradient id=${precipitationStormBaseGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#6c7b92" stop-opacity="0.94"></stop>
                  <stop offset="52%" stop-color="#3f4f69" stop-opacity="0.95"></stop>
                  <stop offset="100%" stop-color="#1d2839" stop-opacity="0.98"></stop>
                </linearGradient>
                <linearGradient id=${precipitationStormChargeGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(255, 221, 153, 0.52)"></stop>
                  <stop offset="52%" stop-color="rgba(255, 206, 120, 0.2)"></stop>
                  <stop offset="100%" stop-color="rgba(255, 190, 110, 0)"></stop>
                </linearGradient>
                <pattern
                  id=${precipitationStormChargePatternId}
                  width="16"
                  height="16"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(-18)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="16"
                    stroke="rgba(255, 220, 149, 0.2)"
                    stroke-width="0.9"
                    stroke-linecap="round"
                  ></line>
                </pattern>
                <linearGradient id=${stormCapGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#fff3a6"></stop>
                  <stop offset="54%" stop-color="#ffd665"></stop>
                  <stop offset="100%" stop-color="#ffb74a"></stop>
                </linearGradient>
                ${layout.bars.filter((bar) => Boolean(bar.path)).map(
      (bar) => w`
                      <clipPath id=${`precipClip-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}-${bar.index}`}>
                        <path d=${bar.path}></path>
                      </clipPath>
                    `
    )}
              ` : A}
          ${layout.celestial ? w`
                <linearGradient
                  id=${layout.celestial.sunGradientId}
                  gradientUnits="userSpaceOnUse"
                  x1=${layout.plotLeft}
                  y1="0"
                  x2=${layout.svgWidth - layout.plotRight}
                  y2="0"
                >
                  <stop offset="0%" stop-color="#fffcef" stop-opacity="0.92"></stop>
                  <stop offset="42%" stop-color="#ffe9a8" stop-opacity="0.88"></stop>
                  <stop offset="100%" stop-color="#ffc93a" stop-opacity="0.82"></stop>
                </linearGradient>
                <linearGradient
                  id=${layout.celestial.moonGradientId}
                  gradientUnits="userSpaceOnUse"
                  x1=${layout.plotLeft}
                  y1="0"
                  x2=${layout.svgWidth - layout.plotRight}
                  y2="0"
                >
                  <stop offset="0%" stop-color="#0a1f3d" stop-opacity="0.88"></stop>
                  <stop offset="38%" stop-color="#3d6ad4" stop-opacity="0.9"></stop>
                  <stop offset="100%" stop-color="#cfe4ff" stop-opacity="0.94"></stop>
                </linearGradient>
              ` : A}
        </defs>
        ${layout.ticks.map(
      (tick) => w`
            <line
              class=${`chart-guide ${tick.isBaseline ? "chart-guide-baseline" : ""} ${isPrecipitationPanel ? "chart-guide-precipitation" : ""}`}
              x1=${tick.guideX1}
              y1=${tick.y}
              x2=${tick.guideX2}
              y2=${tick.y}
              data-node-id=${tick.nodeId}
              data-node-kind="tick-guide"
            ></line>
            ${layout.showYAxisLabels ? w`
                  <text
                    class=${`chart-axis chart-axis-y ${isPrecipitationPanel ? "chart-axis-y-precipitation" : ""}`}
                    x=${layout.plotLeft - 4}
                    y=${tick.y + 5}
                    text-anchor="end"
                    data-node-id=${tick.nodeId}-label
                    data-node-kind="tick-label"
                  >
                    ${tick.label}
                  </text>
                ` : A}
          `
    )}
        ${layout.celestial ? w`
              <g
                class="chart-celestial-tracks"
                data-node-id=${`${layout.panelKey}-celestial`}
                data-node-kind="celestial-tracks"
                aria-hidden="true"
              >
                ${layout.celestial.moonPath ? w`
                      <path
                        class="chart-celestial-moon"
                        d=${layout.celestial.moonPath}
                        fill="none"
                        stroke-width="2.5"
                        stroke=${`url(#${layout.celestial.moonGradientId})`}
                      ></path>
                    ` : A}
                ${layout.celestial.sunPath ? w`
                      <path
                        class="chart-celestial-sun"
                        d=${layout.celestial.sunPath}
                        fill="none"
                        stroke-width="2.5"
                        stroke=${`url(#${layout.celestial.sunGradientId})`}
                      ></path>
                    ` : A}
              </g>
            ` : A}
        ${selectedBarHighlight ? w`
              <rect
                class="chart-column-selection"
                data-node-id=${`bar-selection-${layout.panelKey}`}
                data-node-kind="bar-selection"
                x=${selectedBarHighlight.x}
                y=${selectedBarHighlight.y}
                width=${selectedBarHighlight.width}
                height=${selectedBarHighlight.height}
                rx=${selectedBarHighlight.rx}
                ry=${selectedBarHighlight.rx}
              ></rect>
            ` : A}
        ${layout.bars.map(
      (bar) => {
        const hazardCornerRadius = Math.min(6, bar.width / 2, bar.height / 2);
        const precipIntensity = panelVm?._seriesBridge.points[bar.index]?.precip_intensity ?? "none";
        return w`
              ${layout.isTemperature ? w`
                    <path
                      class="chart-bar"
                      data-kind=${layout.panelKey}
                      data-current=${bar.isCurrent ? "true" : "false"}
                      fill=${`url(#tempGrad-${layout.panelKey}-${bar.index})`}
                      d=${bar.path}
                      data-node-id=${bar.nodeId}
                      data-node-kind="bar"
                    ></path>
                  ` : isPrecipitationPanel ? w`
                      <g
                        class="chart-bar chart-precipitation-bar"
                        data-kind=${layout.panelKey}
                        data-current=${bar.isCurrent ? "true" : "false"}
                        data-precip-mode=${precipitationVisualMode ?? "rain-primary"}
                        data-precip-intensity=${precipIntensity}
                        data-node-id=${bar.nodeId}
                        data-node-kind="bar"
                      >
                        ${bar.height > 0 ? isStormPrimaryPrecipitation ? w`
                                <path
                                  class="chart-precip-bar-base chart-precip-bar-base-storm"
                                  d=${bar.path}
                                  fill=${`url(#${precipitationStormBaseGradientId})`}
                                ></path>
                                <g
                                  clip-path=${`url(#precipClip-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}-${bar.index})`}
                                >
                                  <rect
                                    class="chart-precip-bar-charge"
                                    x=${bar.x}
                                    y=${bar.y}
                                    width=${bar.width}
                                    height=${Math.max(bar.height * 0.44, 7)}
                                    fill=${`url(#${precipitationStormChargeGradientId})`}
                                  ></rect>
                                  <rect
                                    class="chart-precip-bar-charge-texture"
                                    x=${bar.x}
                                    y=${bar.y}
                                    width=${bar.width}
                                    height=${bar.height}
                                    fill=${`url(#${precipitationStormChargePatternId})`}
                                  ></rect>
                                </g>
                                <line
                                  class="chart-precip-bar-rim chart-precip-bar-rim-storm"
                                  x1=${bar.x + 0.7}
                                  y1=${bar.y + 0.9}
                                  x2=${bar.x + bar.width - 0.7}
                                  y2=${bar.y + 0.9}
                                ></line>
                              ` : w`
                                <path
                                  class="chart-precip-bar-base"
                                  d=${bar.path}
                                  fill=${`url(#${precipitationBarBaseGradientId})`}
                                ></path>
                                <g
                                  clip-path=${`url(#precipClip-${this._instanceId}-${layout.panelKey}-${vm.selectedRange}-${bar.index})`}
                                >
                                  <rect
                                    class="chart-precip-bar-cloud"
                                    x=${bar.x}
                                    y=${bar.y}
                                    width=${bar.width}
                                    height=${Math.max(bar.height * 0.52, 8)}
                                    fill=${`url(#${precipitationCloudGradientId})`}
                                  ></rect>
                                  <rect
                                    class="chart-precip-bar-streaks"
                                    x=${bar.x}
                                    y=${bar.y}
                                    width=${bar.width}
                                    height=${bar.height}
                                    fill=${`url(#${precipitationStreakPatternId})`}
                                  ></rect>
                                  <rect
                                    class="chart-precip-bar-pool"
                                    x=${bar.x}
                                    y=${bar.y}
                                    width=${bar.width}
                                    height=${bar.height}
                                    fill=${`url(#${precipitationPoolGradientId})`}
                                  ></rect>
                                </g>
                                <line
                                  class="chart-precip-bar-rim"
                                  x1=${bar.x + 0.7}
                                  y1=${bar.y + 0.9}
                                  x2=${bar.x + bar.width - 0.7}
                                  y2=${bar.y + 0.9}
                                ></line>
                              ` : A}
                      </g>
                    ` : w`
                    <g
                      class="chart-bar"
                      data-kind=${layout.panelKey}
                      data-current=${bar.isCurrent ? "true" : "false"}
                      fill=${`url(#${hazardGradientId})`}
                      data-node-id=${bar.nodeId}
                      data-node-kind="bar"
                    >
                      <rect
                        x=${bar.x}
                        y=${bar.y}
                        width=${bar.width}
                        height=${bar.height}
                        rx=${hazardCornerRadius}
                        ry=${hazardCornerRadius}
                      ></rect>
                      ${bar.height > hazardCornerRadius ? w`
                            <rect
                              x=${bar.x}
                              y=${bar.y + hazardCornerRadius}
                              width=${bar.width}
                              height=${bar.height - hazardCornerRadius}
                            ></rect>
                          ` : A}
                    </g>
                  `}
              ${isRainPrimaryPrecipitation && layout.precipitation ? layout.precipitation.stormCaps.filter((cap) => cap.index === bar.index).map(
          (cap) => w`
                        <rect
                          class="chart-storm-cap"
                          data-energy=${cap.energyTier}
                          x=${cap.x}
                          y=${cap.y}
                          width=${cap.width}
                          height=${cap.height}
                          rx=${Math.min(cap.height / 2, 2.5)}
                          ry=${Math.min(cap.height / 2, 2.5)}
                          fill=${`url(#${stormCapGradientId})`}
                          data-node-id=${cap.nodeId}
                          data-node-kind="storm-cap"
                        ></rect>
                      `
        ) : A}
              ${isRainPrimaryPrecipitation && layout.precipitation ? layout.precipitation.stormSparks.filter((spark) => spark.index === bar.index).map(
          (spark) => w`
                        <path
                          class="chart-storm-spark"
                          data-energy=${spark.energyTier}
                          d=${spark.d}
                          style=${`--spark-duration:${spark.durationSeconds.toFixed(2)}s;--spark-delay:${spark.delaySeconds.toFixed(2)}s;`}
                          data-node-id=${spark.nodeId}
                          data-node-kind="storm-spark"
                        ></path>
                      `
        ) : A}
              <text
                class="chart-value ${bar.showValueLabel ? "" : "chart-label-hidden"}"
                data-current=${bar.isCurrent ? "true" : "false"}
                x=${bar.valueX}
                y=${bar.valueY}
                text-anchor="middle"
                data-node-id=${bar.nodeId}-value
                data-node-kind="bar-value"
              >
                ${bar.valueDisplay}
              </text>
              <text
                class="chart-axis ${bar.label ? "" : "chart-label-hidden"}"
                data-current=${bar.isCurrent ? "true" : "false"}
                x=${bar.xLabelX}
                y=${bar.xLabelY}
                text-anchor="middle"
                data-node-id=${bar.nodeId}-xlabel
                data-node-kind="bar-xlabel"
              >
                ${bar.label}
              </text>
            `;
      }
    )}
        ${layout.feelsLikeMarkers.map(
      (marker) => w`
            <line
              class="chart-feels-like"
              data-current=${marker.isCurrent ? "true" : "false"}
              data-direction=${marker.direction}
              x1=${marker.x1}
              y1=${marker.y}
              x2=${marker.x2}
              y2=${marker.y}
              data-node-id=${marker.nodeId}
              data-node-kind="feels-like"
            ></line>
            <text
              class="chart-feels-like-value ${marker.showValueLabel ? "" : "chart-label-hidden"}"
              data-current=${marker.isCurrent ? "true" : "false"}
              data-direction=${marker.direction}
              x=${marker.labelX}
              y=${marker.labelY}
              text-anchor="middle"
              data-node-id=${marker.nodeId}-value
              data-node-kind="feels-like-value"
            >
              ${marker.valueDisplay}
            </text>
          `
    )}
        ${layout.isTemperature || layout.panelKey === "precipitation" ? layout.bars.map(
      (bar) => w`
                <rect
                  class="chart-column-hitbox"
                  x=${bar.x - 8}
                  y=${Math.max(layout.plotTop, bar.y - 18)}
                  width=${bar.width + 16}
                  height=${Math.max(layout.baselineY - bar.y + 52, 48)}
                  rx="10"
                  ry="10"
                  tabindex="0"
                  role="button"
                  aria-label=${layout.isTemperature ? `Show ${bar.label || "this window"} temperature details` : `Show ${bar.label || "this window"} precipitation details`}
                  data-node-id=${bar.nodeId}-hitbox
                  data-node-kind="bar-hitbox"
                  @pointerdown=${(event) => this._showTemperatureTooltip(bar.index, event.currentTarget, layout.panelKey)}
                  @click=${(event) => this._showTemperatureTooltip(bar.index, event.currentTarget, layout.panelKey)}
                  @focus=${(event) => this._showTemperatureTooltip(bar.index, event.currentTarget, layout.panelKey)}
                  @keydown=${(event) => this._handleTemperatureColumnKeydown(
        event,
        bar.index,
        event.currentTarget,
        layout.panelKey
      )}
                ></rect>
              `
    ) : A}
        ${tooltip ? w`
              <g class="chart-column-tooltip" data-node-id=${tooltip.nodeId} data-node-kind="tooltip">
                <rect
                  class="chart-column-tooltip-box"
                  x=${tooltip.boxX}
                  y=${tooltip.boxY}
                  width=${tooltip.boxWidth}
                  height=${tooltip.boxHeight}
                  rx=${tooltip.boxRx}
                  ry=${tooltip.boxRx}
                ></rect>
                <path
                  class="chart-column-tooltip-pointer"
                  d=${`M ${tooltip.pointerX - 8} ${tooltip.boxY + tooltip.boxHeight} L ${tooltip.pointerX} ${tooltip.boxY + tooltip.boxHeight + 10} L ${tooltip.pointerX + 8} ${tooltip.boxY + tooltip.boxHeight} Z`}
                ></path>
                <text
                  class="chart-column-tooltip-title"
                  x=${tooltip.boxX + 12}
                  y=${tooltip.titleY}
                >
                  ${tooltip.windowLabel}
                </text>
                <text
                  class="chart-column-tooltip-copy"
                  x=${tooltip.boxX + 12}
                  y=${tooltip.copy1Y}
                >
                  ${tooltip.temperatureLabel}
                </text>
                ${tooltip.feelsLikeLabel && tooltip.copy2Y !== null ? w`
                      <text
                        class="chart-column-tooltip-copy"
                        x=${tooltip.boxX + 12}
                        y=${tooltip.copy2Y}
                      >
                        ${tooltip.feelsLikeLabel}
                      </text>
                    ` : A}
              </g>
            ` : A}
      </svg>
    `;
    const isTemperaturePanel = Boolean(header);
    const riskHelperCopy = layout.panelKey === "precipitation" ? panelVm?._precipitationMode === "nowcast" ? resolveNextHourPrecipitationHelperCopy(
      panelVm?._nextHourPrecipitation ?? null,
      panelVm?._currentPrecipitation ?? null,
      panelVm?._nearTermStrategicPrecipContext ?? null
    ) : resolvePrecipitationHelperCopy(
      layout.precipitation,
      {
        currentCondition: panelVm?._currentCondition ?? null,
        currentPrecipitation: panelVm?._currentPrecipitation ?? null,
        rainSeries: panelVm?._precipitationRainSeriesBridge ?? null,
        stormSeries: panelVm?._precipitationStormSeriesBridge ?? null
      }
    ) : "Peak risk within the selected window";
    return b2`
      <section
        class="panel"
        data-node-id=${layout.nodeId}-panel
        data-node-kind="panel"
        data-panel-key=${layout.panelKey}
      >
        <div
          class="rowhead"
          data-node-id=${layout.panelKey}-rowhead
          data-node-kind="rowhead"
        >
          ${isTemperaturePanel && header ? b2`
                <span class="rowhead-main">
                  <span class="rowtitle">Hourly temperature</span>
                  <span class="rowmeta">${temperatureDensityHint}</span>
                </span>
                <span class="rowpeak">${header.currentTemperature?.value ?? panelVm?.peakDisplay ?? ""}</span>
              ` : b2`
                <span class="rowhead-main">
                  <span class="rowtitle">${panelVm?.label ?? layout.panelKey}</span>
                  <span class="rowmeta">
                    ${header ? temperatureDensityHint : riskHelperCopy}
                  </span>
                </span>
                <span class="rowpeak">${panelVm?.peakDisplay ?? ""}</span>
              `}
        </div>
        ${i6(
      chartRenderKey,
      // Force a fresh scroller + SVG subtree when the visible horizon changes.
      // This resets stale scroll/compositing state seen on mobile range toggles.
      b2`
            <div class="plot" @scroll=${this._handlePlotScroll}>
              ${svgChart}
            </div>
          `
    )}
      </section>
    `;
  }
  _selectRange(rangeHours) {
    if (this._selectedRange === rangeHours) return;
    const old = this._selectedRange;
    this._selectedRange = rangeHours;
    this._selectedTemperatureTooltipIndex = null;
    this._selectedTooltipPanelKey = null;
    this._temperatureTooltipViewportRange = null;
    this._hideDetailTooltip();
    this.requestUpdate("_selectedRange", old);
  }
  _showTemperatureTooltip(index, anchor = null, panelKey = "temperature") {
    const old = this._selectedTemperatureTooltipIndex;
    this._updateTemperatureTooltipViewport(anchor);
    this._hideDetailTooltip();
    this._selectedTemperatureTooltipIndex = index;
    this._selectedTooltipPanelKey = panelKey;
    this.requestUpdate("_selectedTemperatureTooltipIndex", old);
  }
  _clearTemperatureTooltip() {
    if (this._selectedTemperatureTooltipIndex === null) return;
    const old = this._selectedTemperatureTooltipIndex;
    this._selectedTemperatureTooltipIndex = null;
    this._selectedTooltipPanelKey = null;
    this._temperatureTooltipViewportRange = null;
    this.requestUpdate("_selectedTemperatureTooltipIndex", old);
  }
  _handleChartPointerDown(event) {
    const path = event.composedPath();
    const clickedColumn = path.some(
      (node) => node instanceof Element && node.classList.contains("chart-column-hitbox")
    );
    if (clickedColumn) return;
    this._hideDetailTooltip();
    this._clearTemperatureTooltip();
  }
  _handleTemperatureColumnKeydown(event, index, anchor = null, panelKey = "temperature") {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this._showTemperatureTooltip(index, anchor, panelKey);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      this._clearTemperatureTooltip();
    }
  }
};
WeatherRiskBridgeCard.properties = {
  hass: { attribute: false },
  _config: { state: true },
  _selectedRange: { state: true },
  _compactChart: { state: true },
  _selectedTemperatureTooltipIndex: { state: true },
  _detailTooltip: { state: true }
};
WeatherRiskBridgeCard.styles = i`
    :host {
      display: block;
      container-type: inline-size;
      container-name: host-card;
      --glass-card: linear-gradient(
        180deg,
        color-mix(in srgb, var(--card-background-color, rgba(28, 31, 39, 0.76)) 28%, transparent),
        color-mix(in srgb, var(--card-background-color, rgba(28, 31, 39, 0.76)) 14%, transparent)
      );
      --glass-panel: linear-gradient(
        180deg,
        color-mix(in srgb, var(--card-background-color, rgba(34, 38, 48, 0.8)) 22%, transparent),
        color-mix(in srgb, var(--card-background-color, rgba(34, 38, 48, 0.8)) 10%, transparent)
      );
      --glass-line: color-mix(in srgb, var(--primary-text-color, #fff) 18%, transparent);
      --glass-line-soft: color-mix(in srgb, var(--primary-text-color, #fff) 10%, transparent);
    }

    ha-card {
      background:
        radial-gradient(circle at top right, rgba(107, 172, 255, 0.16), transparent 34%),
        radial-gradient(circle at top center, color-mix(in srgb, var(--primary-text-color, #fff) 7%, transparent), transparent 52%),
        var(--glass-card);
      color: #f5f8ff;
      border: 1px solid var(--glass-line);
      border-radius: 24px;
      overflow: hidden;
      backdrop-filter: blur(12px) saturate(1.18);
      -webkit-backdrop-filter: blur(12px) saturate(1.18);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.12),
        0 18px 42px rgba(0, 0, 0, 0.14);
    }

    .wrap {
      position: relative;
      padding: 18px;
      display: grid;
      gap: 18px;
      container-type: inline-size;
      container-name: card;
      overflow: visible;
    }

    .card-hero {
      display: grid;
      gap: 14px;
      padding: 18px;
      border-radius: 22px;
      background:
        radial-gradient(circle at top right, rgba(120, 191, 255, 0.12), transparent 36%),
        linear-gradient(180deg, color-mix(in srgb, var(--primary-text-color, #fff) 5%, transparent), transparent 24%),
        var(--glass-panel);
      border: 1px solid var(--glass-line-soft);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.09),
        0 16px 32px rgba(4, 10, 22, 0.12);
    }

    .card-hero-topbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: 10px 16px;
    }

    .card-hero-accessories {
      display: grid;
      justify-items: end;
      align-content: start;
      gap: 8px;
      min-width: 0;
    }

    .card-hero-main {
      display: grid;
      gap: 10px;
      min-width: 0;
    }

    .hero-summary {
      display: grid;
      gap: 6px;
      max-width: 32rem;
      text-wrap: pretty;
    }

    .hero-summary-primary {
      font-size: 0.98rem;
      font-weight: 500;
      color: rgba(244, 248, 255, 0.94);
      letter-spacing: 0.01em;
    }

    .hero-summary-secondary {
      font-size: 0.82rem;
      color: rgba(214, 225, 255, 0.66);
      letter-spacing: 0.01em;
    }

    .card-hero-body {
      display: grid;
      grid-template-columns: minmax(248px, 0.96fr) minmax(0, 1.04fr);
      gap: 16px;
      align-items: start;
      padding: 12px 14px;
      border-radius: 20px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--primary-text-color, #fff) 4%, transparent), transparent 24%),
        var(--glass-panel);
      border: 1px solid var(--glass-line-soft);
      min-width: 0;
    }

    .hero-metrics {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: flex-start;
      gap: 8px 18px;
      align-content: start;
    }

    .hero-metric-card {
      display: inline-grid;
      flex: 0 1 auto;
      min-height: auto;
      padding: 0;
      border-radius: 0;
      background: transparent;
      border: 0;
      width: auto;
      min-width: 0;
      justify-items: center;
      align-content: start;
      gap: 2px;
      text-align: center;
    }

    .hero-metric-label {
      font-size: 0.62rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(214, 225, 255, 0.54);
    }

    .hero-metric-value {
      font-size: clamp(1.45rem, 2.35vw, 2.1rem);
      line-height: 1;
      letter-spacing: -0.05em;
      font-weight: 640;
      color: rgba(248, 250, 255, 0.98);
    }

    .hero-meta {
      display: grid;
      gap: 12px;
      align-content: start;
      min-width: 0;
    }

    .hero-primary-details {
      display: grid;
      gap: 8px;
    }

    .hero-alerts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .hero-alert-chip {
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: rgba(249, 235, 212, 0.94);
      background: rgba(255, 183, 76, 0.12);
      border: 1px solid rgba(255, 183, 76, 0.2);
    }

    .hero-alert-chip[data-tone="warning"] {
      color: rgba(255, 223, 214, 0.98);
      background: rgba(255, 112, 83, 0.12);
      border-color: rgba(255, 112, 83, 0.24);
    }

    .hero-alert-chip[data-tone="watch"] {
      color: rgba(255, 225, 172, 0.96);
      background: rgba(255, 181, 78, 0.12);
      border-color: rgba(255, 181, 78, 0.22);
    }

    .hero-detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }

    .hero-condition-card,
    .hero-detail-card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 8px;
      min-height: 42px;
      padding: 7px 12px;
      border-radius: 999px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--primary-text-color, #fff) 5%, transparent), transparent 24%),
        var(--glass-panel);
      border: 1px solid var(--glass-line-soft);
      width: 100%;
    }

    .hero-condition-card {
      grid-column: auto;
    }

    .hero-condition-card ha-icon,
    .hero-detail-card ha-icon {
      --mdc-icon-size: 24px;
    }

    .hero-detail-copy {
      display: flex;
      align-items: center;
      min-width: 0;
    }

    .hero-detail-label {
      display: none;
    }

    .hero-detail-value {
      display: block;
      font-size: 0.96rem;
      font-weight: 600;
      line-height: 1.1;
      color: rgba(244, 248, 255, 0.96);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hero-detail-card-secondary {
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--primary-text-color, #fff) 4%, transparent), transparent 24%),
        var(--glass-panel);
    }

    .card-hero {
      position: relative;
      display: block;
      overflow: hidden;
      gap: 0;
      padding: 16px;
      background:
        linear-gradient(180deg, rgba(14, 24, 40, 0.04), rgba(14, 24, 40, 0.18)),
        rgba(36, 52, 84, 0.14);
      --hero-overview-label-color: rgba(214, 225, 255, 0.54);
      --hero-overview-value-color: rgba(248, 250, 255, 0.96);
      --hero-overview-supporting-color: rgba(239, 244, 255, 0.92);
      --hero-overview-text-shadow: 0 2px 10px rgba(6, 12, 26, 0.2);
      --hero-overview-text-stroke: 0 transparent;
      --hero-overview-divider-color: rgba(219, 231, 255, 0.12);
      --ambient-base: linear-gradient(180deg, rgba(80, 125, 186, 0.5), rgba(35, 63, 104, 0.28));
      --ambient-bloom: radial-gradient(circle at 68% 18%, rgba(242, 249, 255, 0.5), transparent 38%);
      --ambient-haze: radial-gradient(circle at 78% 72%, rgba(148, 204, 255, 0.24), transparent 32%);
      --ambient-veil: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      --ambient-particles: none;
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(139, 196, 255, 0.22), transparent 38%);
      --ambient-alert-overlay: none;
    }

    .card-hero::before,
    .card-hero::after {
      content: "";
      position: absolute;
      pointer-events: none;
      z-index: 0;
    }

    .card-hero-scene-backdrop {
      position: absolute;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .card-hero-scene-backdrop {
      inset: -18% -10% -26% -10%;
    }

    .card-hero-scene-backdrop-image {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      user-select: none;
      -webkit-user-drag: none;
      pointer-events: none;
    }

    .card-hero-scene-backdrop-image {
      object-position: 50% 10%;
      opacity: 1;
      filter: none;
      transform: translate3d(0, 0, 0) scale(1.04);
    }

    .card-hero::before {
      inset: 18% -10% -18% 24%;
      background: var(--ambient-spill);
      opacity: 0;
      filter: none;
      content: none;
    }

    .card-hero::after {
      inset: 0;
      background: var(--ambient-alert-overlay);
      opacity: 0.9;
      mix-blend-mode: screen;
    }

    .card-hero-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(0, 1.7fr) minmax(150px, 1fr);
      grid-template-areas:
        "overview ranges"
        "pills .";
      column-gap: 14px;
      row-gap: 12px;
      align-items: stretch;
    }

    .hero-overview,
    .hero-range-cell {
      padding-bottom: 12px;
      border-bottom: 1px solid var(--hero-overview-divider-color);
    }

    .hero-overview {
      grid-area: overview;
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(104px, 0.86fr);
      gap: 12px;
      min-width: 0;
      align-items: start;
    }

    .hero-overview-primary,
    .hero-overview-secondary {
      display: grid;
      align-content: start;
      gap: 7px;
      min-width: 0;
    }

    .hero-overview-metric {
      display: grid;
      gap: 2px;
      min-width: 0;
    }

    .hero-overview-label,
    .hero-overview-condition-label {
      font-size: 0.62rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--hero-overview-label-color);
      text-shadow: var(--hero-overview-text-shadow);
    }

    .hero-overview-value {
      font-size: clamp(1.18rem, 2.05vw, 1.7rem);
      line-height: 1.02;
      letter-spacing: -0.045em;
      font-weight: 500;
      color: var(--hero-overview-value-color);
      text-shadow: var(--hero-overview-text-shadow);
      -webkit-text-stroke: var(--hero-overview-text-stroke);
      text-wrap: balance;
    }

    .hero-overview-primary .hero-overview-value {
      font-weight: 430;
    }

    .hero-overview-metric[data-tone="supporting"] .hero-overview-value {
      font-size: 1rem;
      font-weight: 620;
      letter-spacing: -0.02em;
    }

    .hero-overview-condition {
      display: grid;
      gap: 3px;
      min-width: 0;
    }

    .hero-overview-condition-value {
      font-size: 0.94rem;
      font-weight: 600;
      color: var(--hero-overview-supporting-color);
      text-shadow: var(--hero-overview-text-shadow);
      -webkit-text-stroke: var(--hero-overview-text-stroke);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hero-range-cell {
      grid-area: ranges;
      display: grid;
      align-content: start;
      justify-items: stretch;
      min-width: 0;
    }

    .hero-range-cell .ranges {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      width: 100%;
      gap: 4px;
      min-width: 0;
    }

    .card-hero .ranges,
    .card-hero .detail-pill {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 26%),
        linear-gradient(180deg, rgba(18, 28, 46, 0.52), rgba(11, 18, 32, 0.36));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.08),
        0 8px 18px rgba(7, 12, 24, 0.14);
    }

    .hero-range-cell .ranges button {
      padding-inline: 0;
      text-align: center;
    }

    .hero-pill-rail {
      grid-area: pills;
      display: grid;
      align-content: start;
      gap: 6px;
      min-width: 0;
      --detail-pill-height: 42px;
    }

    .hero-pill-pair {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 6px;
      min-width: 0;
    }

    .hero-pill-pair .detail-pill {
      width: 100%;
      min-width: 0;
      padding-inline: 8px 10px;
    }

    .hero-pill-pair .detail-pill ha-icon {
      --mdc-icon-size: 22px;
    }

    .hero-pill-rail-alerts {
      display: grid;
      gap: 6px;
    }

    .hero-alerts {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .hero-alert-chip {
      padding: 4px 9px;
      font-size: 0.66rem;
      letter-spacing: 0.02em;
      background: rgba(255, 183, 76, 0.1);
      border-color: rgba(255, 183, 76, 0.16);
    }

    .card-hero[data-scene="clear_day"] {
      --hero-overview-label-color: rgba(29, 46, 72, 0.68);
      --hero-overview-value-color: rgba(15, 28, 48, 0.94);
      --hero-overview-supporting-color: rgba(24, 38, 62, 0.88);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.34),
        0 6px 18px rgba(255, 255, 255, 0.18);
      --hero-overview-text-stroke: 0.25px rgba(255, 255, 255, 0.2);
      --hero-overview-divider-color: rgba(31, 56, 92, 0.16);
      --ambient-base: linear-gradient(180deg, rgba(110, 164, 220, 0.58), rgba(49, 99, 172, 0.32));
      --ambient-bloom: radial-gradient(circle at 56% 12%, rgba(255, 248, 228, 0.92), transparent 34%);
      --ambient-haze: radial-gradient(circle at 76% 72%, rgba(157, 210, 255, 0.26), transparent 26%);
      --ambient-veil: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      --ambient-spill: radial-gradient(circle at 82% 52%, rgba(168, 214, 255, 0.26), transparent 40%);
    }

    .card-hero[data-scene="clear_night"] {
      --ambient-base: linear-gradient(180deg, rgba(41, 64, 115, 0.64), rgba(16, 28, 62, 0.38));
      --ambient-bloom: radial-gradient(circle at 70% 18%, rgba(179, 208, 255, 0.32), transparent 34%);
      --ambient-haze: radial-gradient(circle at 82% 74%, rgba(104, 142, 224, 0.18), transparent 24%);
      --ambient-veil: linear-gradient(180deg, rgba(169, 189, 236, 0.08), rgba(17, 31, 60, 0.08));
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(94, 126, 213, 0.2), transparent 36%);
    }

    .card-hero[data-scene="sunrise_clear"] {
      --hero-overview-label-color: rgba(76, 43, 22, 0.72);
      --hero-overview-value-color: rgba(56, 27, 14, 0.96);
      --hero-overview-supporting-color: rgba(68, 35, 18, 0.9);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 240, 220, 0.34),
        0 5px 14px rgba(255, 229, 194, 0.2);
      --hero-overview-divider-color: rgba(109, 62, 31, 0.22);
      --ambient-base: linear-gradient(180deg, rgba(220, 143, 94, 0.4), rgba(96, 84, 165, 0.26));
      --ambient-bloom: radial-gradient(circle at 62% 14%, rgba(255, 220, 166, 0.58), transparent 36%);
      --ambient-haze: radial-gradient(circle at 78% 76%, rgba(186, 174, 255, 0.18), transparent 30%);
      --ambient-veil: linear-gradient(180deg, rgba(255, 245, 226, 0.08), rgba(255, 215, 176, 0.03));
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(255, 192, 138, 0.22), transparent 38%);
    }

    .card-hero[data-scene="sunrise_partly_cloudy"] {
      --hero-overview-label-color: rgba(82, 49, 24, 0.72);
      --hero-overview-value-color: rgba(58, 30, 16, 0.95);
      --hero-overview-supporting-color: rgba(74, 39, 20, 0.9);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 243, 227, 0.3),
        0 5px 15px rgba(255, 227, 193, 0.18);
      --hero-overview-divider-color: rgba(110, 66, 34, 0.2);
      --ambient-base: linear-gradient(180deg, rgba(194, 136, 102, 0.44), rgba(86, 99, 168, 0.28));
      --ambient-bloom: radial-gradient(circle at 60% 14%, rgba(255, 215, 166, 0.46), transparent 34%);
      --ambient-haze: radial-gradient(circle at 80% 74%, rgba(180, 182, 250, 0.16), transparent 30%);
      --ambient-veil:
        radial-gradient(circle at 34% 28%, rgba(255, 233, 210, 0.16), transparent 24%),
        radial-gradient(circle at 76% 44%, rgba(220, 228, 255, 0.14), transparent 28%);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(255, 188, 148, 0.2), transparent 36%);
    }

    .card-hero[data-scene="sunrise_overcast"] {
      --hero-overview-label-color: rgba(72, 45, 30, 0.7);
      --hero-overview-value-color: rgba(51, 29, 20, 0.94);
      --hero-overview-supporting-color: rgba(66, 39, 27, 0.88);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 240, 225, 0.26),
        0 5px 14px rgba(255, 220, 187, 0.14);
      --hero-overview-divider-color: rgba(101, 62, 39, 0.16);
      --ambient-base: linear-gradient(180deg, rgba(157, 125, 117, 0.44), rgba(78, 90, 128, 0.28));
      --ambient-bloom: radial-gradient(circle at 64% 16%, rgba(245, 213, 182, 0.28), transparent 34%);
      --ambient-haze: radial-gradient(circle at 80% 72%, rgba(173, 177, 211, 0.14), transparent 28%);
      --ambient-veil: linear-gradient(180deg, rgba(250, 231, 212, 0.08), rgba(186, 179, 190, 0.04));
      --ambient-spill: radial-gradient(circle at 80% 56%, rgba(195, 171, 164, 0.16), transparent 34%);
    }

    .card-hero[data-scene="sunrise_fog"] {
      --ambient-base: linear-gradient(180deg, rgba(186, 159, 145, 0.4), rgba(117, 134, 153, 0.25));
      --ambient-bloom: radial-gradient(circle at 68% 24%, rgba(255, 229, 200, 0.24), transparent 38%);
      --ambient-haze:
        radial-gradient(circle at 58% 52%, rgba(241, 223, 211, 0.18), transparent 30%),
        radial-gradient(circle at 82% 72%, rgba(222, 215, 220, 0.16), transparent 26%);
      --ambient-veil: linear-gradient(180deg, rgba(255, 239, 221, 0.1), rgba(214, 210, 220, 0.06));
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(236, 217, 208, 0.16), transparent 34%);
    }

    .card-hero[data-scene="sunrise_light_rain"] {
      --hero-overview-label-color: rgba(64, 39, 30, 0.72);
      --hero-overview-value-color: rgba(43, 24, 20, 0.95);
      --hero-overview-supporting-color: rgba(57, 33, 28, 0.9);
      --hero-overview-divider-color: rgba(92, 58, 48, 0.18);
      --ambient-base: linear-gradient(180deg, rgba(133, 110, 133, 0.48), rgba(66, 79, 131, 0.31));
      --ambient-bloom: radial-gradient(circle at 66% 16%, rgba(255, 210, 172, 0.24), transparent 30%);
      --ambient-haze: radial-gradient(circle at 84% 74%, rgba(150, 172, 232, 0.18), transparent 24%);
      --ambient-veil:
        linear-gradient(180deg, rgba(255, 231, 207, 0.08), transparent 28%),
        repeating-linear-gradient(112deg, rgba(193, 204, 255, 0.08) 0 2px, transparent 2px 16px);
      --ambient-particles: linear-gradient(120deg, transparent 0%, rgba(182, 206, 255, 0.08) 46%, transparent 100%);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(190, 187, 245, 0.18), transparent 34%);
    }

    .card-hero[data-scene="sunset_clear"] {
      --hero-overview-label-color: rgba(92, 45, 25, 0.72);
      --hero-overview-value-color: rgba(68, 30, 14, 0.96);
      --hero-overview-supporting-color: rgba(82, 38, 18, 0.9);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 241, 224, 0.28),
        0 5px 14px rgba(255, 214, 168, 0.2);
      --hero-overview-divider-color: rgba(120, 60, 29, 0.22);
      --ambient-base: linear-gradient(180deg, rgba(221, 127, 86, 0.38), rgba(81, 70, 143, 0.3));
      --ambient-bloom: radial-gradient(circle at 58% 16%, rgba(255, 192, 132, 0.54), transparent 34%);
      --ambient-haze: radial-gradient(circle at 80% 74%, rgba(165, 163, 246, 0.2), transparent 28%);
      --ambient-veil: linear-gradient(180deg, rgba(255, 230, 199, 0.08), rgba(239, 191, 156, 0.03));
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(255, 176, 126, 0.22), transparent 38%);
    }

    .card-hero[data-scene="sunset_partly_cloudy"] {
      --hero-overview-label-color: rgba(96, 49, 30, 0.72);
      --hero-overview-value-color: rgba(70, 33, 18, 0.95);
      --hero-overview-supporting-color: rgba(84, 41, 23, 0.9);
      --hero-overview-divider-color: rgba(121, 66, 38, 0.2);
      --ambient-base: linear-gradient(180deg, rgba(198, 121, 98, 0.42), rgba(83, 78, 145, 0.3));
      --ambient-bloom: radial-gradient(circle at 60% 16%, rgba(255, 194, 146, 0.44), transparent 32%);
      --ambient-haze: radial-gradient(circle at 80% 74%, rgba(166, 168, 241, 0.18), transparent 28%);
      --ambient-veil:
        radial-gradient(circle at 34% 30%, rgba(255, 215, 184, 0.16), transparent 24%),
        radial-gradient(circle at 76% 46%, rgba(211, 200, 255, 0.14), transparent 28%);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(247, 179, 149, 0.18), transparent 36%);
    }

    .card-hero[data-scene="sunset_overcast"] {
      --hero-overview-label-color: rgba(78, 45, 35, 0.7);
      --hero-overview-value-color: rgba(58, 30, 24, 0.94);
      --hero-overview-supporting-color: rgba(70, 39, 31, 0.88);
      --hero-overview-divider-color: rgba(104, 60, 49, 0.16);
      --ambient-base: linear-gradient(180deg, rgba(147, 107, 102, 0.42), rgba(72, 83, 122, 0.28));
      --ambient-bloom: radial-gradient(circle at 64% 18%, rgba(234, 186, 154, 0.26), transparent 34%);
      --ambient-haze: radial-gradient(circle at 80% 72%, rgba(172, 169, 204, 0.14), transparent 28%);
      --ambient-veil: linear-gradient(180deg, rgba(244, 209, 183, 0.08), rgba(171, 164, 184, 0.04));
      --ambient-spill: radial-gradient(circle at 80% 56%, rgba(188, 157, 151, 0.16), transparent 34%);
    }

    .card-hero[data-scene="twilight_blue_hour_clear"] {
      --ambient-base: linear-gradient(180deg, rgba(54, 78, 140, 0.62), rgba(23, 33, 75, 0.4));
      --ambient-bloom: radial-gradient(circle at 66% 16%, rgba(184, 207, 255, 0.3), transparent 34%);
      --ambient-haze: radial-gradient(circle at 82% 74%, rgba(122, 157, 236, 0.18), transparent 26%);
      --ambient-veil:
        linear-gradient(180deg, rgba(192, 209, 248, 0.08), rgba(52, 78, 136, 0.04)),
        radial-gradient(circle at 32% 30%, rgba(204, 220, 255, 0.12), transparent 22%);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(110, 142, 231, 0.2), transparent 36%);
    }

    .card-hero[data-scene="partly_cloudy_day"] {
      --hero-overview-label-color: rgba(29, 46, 72, 0.68);
      --hero-overview-value-color: rgba(15, 28, 48, 0.94);
      --hero-overview-supporting-color: rgba(24, 38, 62, 0.88);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.32),
        0 6px 18px rgba(255, 255, 255, 0.18);
      --hero-overview-text-stroke: 0.25px rgba(255, 255, 255, 0.18);
      --hero-overview-divider-color: rgba(31, 56, 92, 0.16);
      --ambient-base: linear-gradient(180deg, rgba(104, 153, 213, 0.55), rgba(45, 88, 156, 0.3));
      --ambient-bloom: radial-gradient(circle at 60% 10%, rgba(255, 245, 222, 0.78), transparent 32%);
      --ambient-haze: radial-gradient(circle at 76% 70%, rgba(162, 210, 255, 0.22), transparent 28%);
      --ambient-veil:
        radial-gradient(circle at 36% 30%, rgba(255, 255, 255, 0.16), transparent 24%),
        radial-gradient(circle at 74% 46%, rgba(225, 236, 255, 0.16), transparent 28%);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(156, 205, 255, 0.22), transparent 38%);
    }

    .card-hero[data-scene="partly_cloudy_night"] {
      --ambient-base: linear-gradient(180deg, rgba(46, 74, 128, 0.58), rgba(19, 34, 76, 0.34));
      --ambient-bloom: radial-gradient(circle at 68% 16%, rgba(171, 198, 255, 0.28), transparent 32%);
      --ambient-haze: radial-gradient(circle at 80% 72%, rgba(97, 141, 224, 0.18), transparent 28%);
      --ambient-veil:
        radial-gradient(circle at 34% 28%, rgba(199, 214, 255, 0.12), transparent 22%),
        radial-gradient(circle at 76% 44%, rgba(176, 197, 255, 0.12), transparent 26%);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(87, 128, 212, 0.18), transparent 36%);
    }

    .card-hero[data-scene="cloudy"] {
      --hero-overview-label-color: rgba(26, 42, 66, 0.66);
      --hero-overview-value-color: rgba(14, 26, 44, 0.92);
      --hero-overview-supporting-color: rgba(22, 36, 58, 0.88);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.28),
        0 5px 16px rgba(255, 255, 255, 0.14);
      --hero-overview-text-stroke: 0.2px rgba(255, 255, 255, 0.14);
      --hero-overview-divider-color: rgba(29, 49, 78, 0.14);
      --ambient-base: linear-gradient(180deg, rgba(88, 114, 151, 0.5), rgba(41, 62, 95, 0.26));
      --ambient-bloom: radial-gradient(circle at 62% 16%, rgba(220, 229, 244, 0.32), transparent 34%);
      --ambient-haze: radial-gradient(circle at 76% 72%, rgba(157, 177, 210, 0.16), transparent 26%);
      --ambient-veil: linear-gradient(180deg, rgba(219, 229, 244, 0.08), rgba(152, 171, 205, 0.04));
      --ambient-spill: radial-gradient(circle at 80% 56%, rgba(138, 168, 211, 0.16), transparent 34%);
    }

    .card-hero[data-scene="cloudy_night"] {
      --ambient-base: linear-gradient(180deg, rgba(49, 67, 95, 0.6), rgba(23, 34, 56, 0.36));
      --ambient-bloom: radial-gradient(circle at 68% 18%, rgba(126, 149, 188, 0.2), transparent 30%);
      --ambient-haze: radial-gradient(circle at 82% 74%, rgba(85, 107, 148, 0.16), transparent 24%);
      --ambient-veil: linear-gradient(180deg, rgba(118, 140, 182, 0.06), rgba(21, 32, 57, 0.08));
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(96, 122, 169, 0.16), transparent 34%);
    }

    .card-hero[data-scene="rain"] {
      --hero-overview-label-color: rgba(20, 34, 56, 0.7);
      --hero-overview-value-color: rgba(10, 21, 38, 0.94);
      --hero-overview-supporting-color: rgba(18, 31, 50, 0.9);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.3),
        0 6px 18px rgba(255, 255, 255, 0.14);
      --hero-overview-text-stroke: 0.25px rgba(255, 255, 255, 0.16);
      --hero-overview-divider-color: rgba(25, 44, 72, 0.16);
      --ambient-base: linear-gradient(180deg, rgba(67, 103, 151, 0.54), rgba(31, 55, 97, 0.34));
      --ambient-bloom: radial-gradient(circle at 66% 16%, rgba(211, 228, 255, 0.22), transparent 30%);
      --ambient-haze: radial-gradient(circle at 84% 74%, rgba(124, 184, 255, 0.18), transparent 24%);
      --ambient-veil:
        linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 28%),
        repeating-linear-gradient(110deg, rgba(189, 220, 255, 0.08) 0 2px, transparent 2px 16px);
      --ambient-particles: linear-gradient(120deg, transparent 0%, rgba(176, 216, 255, 0.08) 46%, transparent 100%);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(101, 168, 245, 0.18), transparent 34%);
    }

    .card-hero[data-scene="rain_night"] {
      --ambient-base: linear-gradient(180deg, rgba(35, 61, 101, 0.64), rgba(16, 29, 60, 0.38));
      --ambient-bloom: radial-gradient(circle at 70% 16%, rgba(167, 197, 255, 0.18), transparent 28%);
      --ambient-haze: radial-gradient(circle at 84% 76%, rgba(91, 136, 214, 0.16), transparent 22%);
      --ambient-veil:
        linear-gradient(180deg, rgba(194, 215, 255, 0.06), transparent 30%),
        repeating-linear-gradient(115deg, rgba(155, 192, 255, 0.06) 0 2px, transparent 2px 18px);
      --ambient-particles: linear-gradient(120deg, transparent 0%, rgba(130, 170, 233, 0.08) 52%, transparent 100%);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(86, 131, 217, 0.16), transparent 34%);
    }

    .card-hero[data-scene="storm"] {
      --hero-overview-label-color: rgba(18, 31, 52, 0.72);
      --hero-overview-value-color: rgba(8, 18, 34, 0.95);
      --hero-overview-supporting-color: rgba(16, 28, 46, 0.9);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.32),
        0 6px 18px rgba(255, 255, 255, 0.16);
      --hero-overview-text-stroke: 0.25px rgba(255, 255, 255, 0.18);
      --hero-overview-divider-color: rgba(24, 40, 66, 0.18);
      --ambient-base: linear-gradient(180deg, rgba(54, 77, 132, 0.58), rgba(30, 38, 90, 0.36));
      --ambient-bloom:
        radial-gradient(circle at 58% 18%, rgba(233, 238, 255, 0.3), transparent 24%),
        radial-gradient(circle at 78% 48%, rgba(134, 104, 255, 0.14), transparent 22%);
      --ambient-haze: radial-gradient(circle at 82% 76%, rgba(119, 173, 255, 0.16), transparent 24%);
      --ambient-veil:
        linear-gradient(180deg, rgba(215, 223, 255, 0.08), transparent 26%),
        repeating-linear-gradient(110deg, rgba(166, 199, 255, 0.08) 0 2px, transparent 2px 16px);
      --ambient-particles: linear-gradient(120deg, transparent 0%, rgba(145, 194, 255, 0.08) 52%, transparent 100%);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(101, 140, 255, 0.18), transparent 34%);
    }

    .card-hero[data-scene="storm_night"] {
      --ambient-base: linear-gradient(180deg, rgba(29, 42, 88, 0.66), rgba(17, 21, 60, 0.42));
      --ambient-bloom:
        radial-gradient(circle at 64% 18%, rgba(199, 211, 255, 0.22), transparent 24%),
        radial-gradient(circle at 80% 44%, rgba(122, 99, 230, 0.16), transparent 20%);
      --ambient-haze: radial-gradient(circle at 84% 76%, rgba(87, 124, 210, 0.16), transparent 22%);
      --ambient-veil:
        linear-gradient(180deg, rgba(182, 196, 243, 0.06), transparent 28%),
        repeating-linear-gradient(110deg, rgba(127, 158, 221, 0.08) 0 2px, transparent 2px 18px);
      --ambient-particles: linear-gradient(120deg, transparent 0%, rgba(112, 144, 210, 0.08) 52%, transparent 100%);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(85, 112, 204, 0.16), transparent 34%);
    }

    .card-hero[data-scene="fog"] {
      --hero-overview-label-color: rgba(29, 46, 72, 0.68);
      --hero-overview-value-color: rgba(14, 26, 44, 0.92);
      --hero-overview-supporting-color: rgba(22, 36, 58, 0.88);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.26),
        0 5px 16px rgba(255, 255, 255, 0.14);
      --hero-overview-text-stroke: 0.2px rgba(255, 255, 255, 0.14);
      --hero-overview-divider-color: rgba(31, 54, 82, 0.14);
      --ambient-base: linear-gradient(180deg, rgba(150, 171, 196, 0.42), rgba(96, 118, 148, 0.24));
      --ambient-bloom: radial-gradient(circle at 70% 24%, rgba(237, 243, 251, 0.26), transparent 36%);
      --ambient-haze:
        radial-gradient(circle at 58% 52%, rgba(229, 236, 246, 0.18), transparent 28%),
        radial-gradient(circle at 82% 72%, rgba(208, 221, 239, 0.18), transparent 24%);
      --ambient-veil: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(214, 224, 236, 0.08));
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(214, 228, 246, 0.16), transparent 34%);
    }

    .card-hero[data-scene="fog_night"] {
      --ambient-base: linear-gradient(180deg, rgba(85, 100, 126, 0.48), rgba(40, 50, 69, 0.3));
      --ambient-bloom: radial-gradient(circle at 70% 24%, rgba(183, 199, 224, 0.16), transparent 34%);
      --ambient-haze:
        radial-gradient(circle at 56% 54%, rgba(166, 181, 207, 0.14), transparent 26%),
        radial-gradient(circle at 82% 72%, rgba(145, 164, 194, 0.14), transparent 24%);
      --ambient-veil: linear-gradient(180deg, rgba(168, 184, 210, 0.08), rgba(66, 82, 108, 0.08));
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(153, 170, 200, 0.14), transparent 34%);
    }

    .card-hero[data-scene="snow"] {
      --hero-overview-label-color: rgba(29, 46, 72, 0.68);
      --hero-overview-value-color: rgba(14, 26, 44, 0.92);
      --hero-overview-supporting-color: rgba(22, 36, 58, 0.88);
      --hero-overview-text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.26),
        0 5px 16px rgba(255, 255, 255, 0.14);
      --hero-overview-text-stroke: 0.2px rgba(255, 255, 255, 0.14);
      --hero-overview-divider-color: rgba(31, 54, 82, 0.14);
      --ambient-base: linear-gradient(180deg, rgba(139, 181, 221, 0.5), rgba(74, 117, 174, 0.28));
      --ambient-bloom: radial-gradient(circle at 62% 14%, rgba(244, 248, 255, 0.82), transparent 34%);
      --ambient-haze: radial-gradient(circle at 80% 74%, rgba(212, 233, 255, 0.2), transparent 28%);
      --ambient-veil:
        linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(241, 247, 255, 0.04)),
        radial-gradient(circle at 76% 38%, rgba(255, 255, 255, 0.16), transparent 22%);
      --ambient-particles: radial-gradient(circle at 74% 24%, rgba(255, 255, 255, 0.14), transparent 2px);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(222, 240, 255, 0.18), transparent 36%);
    }

    .card-hero[data-scene="snow_night"] {
      --ambient-base: linear-gradient(180deg, rgba(62, 96, 147, 0.52), rgba(31, 49, 84, 0.3));
      --ambient-bloom: radial-gradient(circle at 66% 14%, rgba(215, 230, 255, 0.28), transparent 32%);
      --ambient-haze: radial-gradient(circle at 82% 74%, rgba(165, 199, 241, 0.18), transparent 26%);
      --ambient-veil:
        linear-gradient(180deg, rgba(223, 235, 255, 0.08), rgba(130, 154, 194, 0.04)),
        radial-gradient(circle at 78% 38%, rgba(231, 241, 255, 0.12), transparent 20%);
      --ambient-particles: radial-gradient(circle at 76% 24%, rgba(240, 246, 255, 0.12), transparent 2px);
      --ambient-spill: radial-gradient(circle at 82% 56%, rgba(180, 206, 244, 0.16), transparent 34%);
    }

    .card-hero[data-alert-tone="watch"] {
      --ambient-alert-overlay: radial-gradient(circle at 84% 54%, rgba(255, 201, 110, 0.12), transparent 28%);
    }

    .card-hero[data-alert-tone="warning"] {
      --ambient-alert-overlay:
        radial-gradient(circle at 84% 54%, rgba(255, 131, 104, 0.16), transparent 30%),
        linear-gradient(135deg, transparent 0%, rgba(255, 110, 93, 0.06) 82%, transparent 100%);
    }

    .topline {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 12px;
    }

    .topline-main {
      flex: 1 1 auto;
      min-width: 0;
    }

    .title {
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .summary {
      font-size: 0.9rem;
      color: rgba(229, 236, 255, 0.78);
      margin-top: 6px;
      max-width: 28rem;
      text-wrap: balance;
    }

    .ranges {
      display: inline-flex;
      gap: 8px;
      padding: 4px;
      border-radius: 999px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--primary-text-color, #fff) 5%, transparent), transparent 24%),
        var(--glass-panel);
      border: 1px solid var(--glass-line-soft);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
      flex: 0 0 auto;
    }

    button {
      appearance: none;
      border: 1px solid transparent;
      border-radius: 999px;
      padding: 8px 12px;
      cursor: pointer;
      color: inherit;
      background: transparent;
      font: inherit;
      white-space: nowrap;
    }

    button:hover {
      border-color: var(--glass-line-soft);
      background: color-mix(in srgb, var(--primary-text-color, #fff) 6%, transparent);
    }

    button[selected] {
      border-color: var(--glass-line);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--primary-text-color, #fff) 18%, transparent), transparent 26%),
        linear-gradient(135deg, rgba(185, 227, 255, 0.95), rgba(228, 246, 255, 0.9));
      color: #12263e;
      font-weight: 700;
    }

    .alerts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .alert {
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 0.78rem;
      background: rgba(255, 183, 76, 0.14);
      border: 1px solid rgba(255, 183, 76, 0.28);
      color: #ffd598;
    }

    .series {
      display: grid;
      gap: 18px;
    }

    .series[data-layout="grid"] {
      grid-template-columns: repeat(var(--series-columns), minmax(240px, 1fr));
      align-items: start;
    }

    .series[data-layout="stacked"] {
      grid-template-columns: minmax(0, 1fr);
    }

    .panel {
      display: grid;
      gap: 12px;
      padding: 16px 16px 14px;
      border-radius: 20px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--primary-text-color, #fff) 4%, transparent), transparent 24%),
        var(--glass-panel);
      border: 1px solid var(--glass-line-soft);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    .rowhead {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      column-gap: 12px;
      row-gap: 6px;
      --header-pill-height: 44px;
      font-size: 0.96rem;
      color: rgba(239, 244, 255, 0.92);
    }

    .header-pills {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto auto;
      gap: 8px 10px;
      align-items: start;
      width: 100%;
    }

    .header-pills-metrics {
      grid-column: 1;
      grid-row: 1 / 3;
      display: flex;
      flex-direction: column;
      gap: 6px;
      justify-content: flex-start;
      min-height: calc(var(--header-pill-height) * 2 + 6px);
    }

    .header-pills-metrics .metric-pill {
      flex: 0 0 auto;
      flex-shrink: 0;
      min-width: 140px;
      max-width: 296px;
    }

    .header-pills-details {
      grid-column: 2;
      grid-row: 1 / 4;
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: space-between;
      align-items: flex-end;
      min-width: 0;
    }

    .header-pills-details .detail-pill {
      flex: 0 0 auto;
      width: max-content;
      max-width: 100%;
      min-width: 140px;
    }

    /* Stack temp pills above detail row when card is narrow (container query = works in constrained columns) */
    @container card (max-width: 430px) {
      .header-pills {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto;
        align-items: stretch;
      }

      .header-pills-metrics {
        grid-column: 1;
        grid-row: 1;
        align-items: flex-start;
      }

      .header-pills-metrics .metric-pill {
        width: 100%;
        max-width: 320px;
        height: var(--header-pill-height);
        min-height: var(--header-pill-height);
      }

      .header-pills-details {
        grid-column: 1;
        grid-row: 2;
        width: 100%;
        align-items: stretch;
      }

      .detail-pills {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        grid-auto-flow: unset;
        grid-auto-columns: unset;
        grid-template-columns: unset;
        justify-content: start;
      }

      .detail-pills .detail-pill {
        flex: 0 0 auto;
        width: 100%;
        max-width: 320px;
        min-width: 140px;
      }
    }

    .rowhead-main {
      display: grid;
      gap: 6px;
      flex: 1 1 auto;
    }

    .rowtitle {
      font-size: 1.02rem;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .rowmeta {
      font-size: 0.78rem;
      color: rgba(214, 225, 255, 0.58);
      letter-spacing: 0.01em;
    }

    .rowpeak {
      align-self: start;
      justify-self: end;
      font-size: 0.84rem;
      font-weight: 600;
      color: rgba(244, 248, 255, 0.82);
      letter-spacing: 0.01em;
      white-space: nowrap;
      text-align: right;
    }

    .metric-pills {
      display: flex;
      width: 100%;
      gap: 8px;
      justify-content: stretch;
    }

    .metric-pill {
      display: inline-grid;
      gap: 1px;
      flex: 1 1 0;
      min-width: 140px;
      max-width: 296px;
      height: var(--header-pill-height);
      min-height: var(--header-pill-height);
      padding: 7px 10px;
      border-radius: 999px;
      background: transparent;
      border: 0;
      box-shadow: none;
      color: rgba(230, 238, 255, 0.86);
      box-sizing: border-box;
      line-height: 1.1;
      letter-spacing: 0.01em;
      justify-items: center;
      align-content: center;
      justify-content: center;
    }

    .metric-label {
      color: rgba(214, 225, 255, 0.58);
      text-transform: uppercase;
      font-size: 0.84375rem;
      letter-spacing: 0.06em;
    }

    .metric-value {
      color: rgba(244, 248, 255, 0.94);
      font-weight: 600;
      font-size: 1.5rem;
      letter-spacing: -0.03em;
    }

    .detail-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: end;
    }

    .detail-pills .detail-pill {
      flex: 0 0 auto;
      width: max-content;
      max-width: 100%;
      min-width: 140px;
    }

    .detail-pill {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 5px;
      min-width: 0;
      height: var(--header-pill-height);
      min-height: var(--header-pill-height);
      padding: 7px 12px;
      border-radius: 999px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--primary-text-color, #fff) 5%, transparent), transparent 24%),
        var(--glass-panel);
      border: 1px solid var(--glass-line-soft);
      color: rgba(239, 244, 255, 0.94);
      box-sizing: border-box;
    }

    .detail-pill-button {
      appearance: none;
      text-align: left;
      font: inherit;
      cursor: pointer;
      position: relative;
      overflow: visible;
    }

    .detail-pill-button:focus-visible {
      outline: 2px solid rgba(255, 188, 96, 0.88);
      outline-offset: 2px;
    }

    .detail-pill ha-icon {
      --mdc-icon-size: 28px;
      color: rgba(214, 225, 255, 0.9);
    }

    .detail-pill-badge {
      width: 28px;
      height: 28px;
      position: relative;
      display: inline-grid;
      place-items: center;
      flex: 0 0 28px;
    }

    .detail-pill-badge::before {
      content: "";
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(255, 196, 84, 0.95);
      box-shadow: 0 0 0 3px rgba(255, 184, 76, 0.18);
    }

    .detail-pill-badge[data-tone="warning"]::before {
      background: rgba(255, 112, 83, 0.96);
      box-shadow: 0 0 0 3px rgba(255, 112, 83, 0.22), 0 0 10px rgba(255, 73, 27, 0.55);
      animation: detail-pill-warning-pulse 1.6s ease-in-out infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .detail-pill-badge[data-tone="warning"]::before {
        animation: none;
      }
    }

    @keyframes detail-pill-warning-pulse {
      0%,
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 3px rgba(255, 112, 83, 0.22), 0 0 10px rgba(255, 73, 27, 0.55);
      }

      50% {
        transform: scale(1.08);
        box-shadow: 0 0 0 4px rgba(255, 112, 83, 0.26), 0 0 14px rgba(255, 54, 0, 0.72);
      }
    }

    .detail-pill[data-kind="condition"] ha-icon {
      color: rgba(255, 217, 128, 0.95);
    }

    .detail-pill[data-kind="condition"][data-accent="rain-light"] {
      border-color: rgba(110, 174, 255, 0.2);
      background: linear-gradient(180deg, rgba(73, 126, 204, 0.12), rgba(54, 81, 130, 0.06));
    }

    .detail-pill[data-kind="condition"][data-accent="rain-light"] ha-icon {
      color: rgba(135, 201, 255, 0.95);
    }

    .detail-pill[data-kind="condition"][data-accent="rain-medium"] {
      border-color: rgba(79, 180, 255, 0.24);
      background: linear-gradient(180deg, rgba(48, 143, 232, 0.18), rgba(29, 87, 156, 0.08));
    }

    .detail-pill[data-kind="condition"][data-accent="rain-medium"] ha-icon {
      color: rgba(145, 218, 255, 0.98);
    }

    .detail-pill[data-kind="condition"][data-accent="rain-heavy"] {
      border-color: rgba(255, 187, 104, 0.24);
      background: linear-gradient(180deg, rgba(255, 171, 71, 0.16), rgba(255, 114, 67, 0.08));
    }

    .detail-pill[data-kind="condition"][data-accent="rain-heavy"] ha-icon {
      color: rgba(255, 215, 128, 0.98);
    }

    .detail-pill[data-kind="fire_alert"] {
      border-color: rgba(255, 160, 114, 0.22);
      background: linear-gradient(180deg, rgba(255, 140, 88, 0.52), rgba(255, 109, 82, 0.04));
    }

    .detail-pill[data-kind="storm_alert"] {
      border-color: rgba(104, 174, 255, 0.22);
      background: linear-gradient(180deg, rgba(56, 128, 219, 0.14), rgba(34, 71, 132, 0.05));
    }

    .detail-pill[data-kind="storm_alert"] ha-icon {
      color: rgba(140, 212, 255, 0.96);
    }

    .detail-pill[data-kind="flood_alert"] {
      border-color: rgba(96, 185, 255, 0.24);
      background: linear-gradient(180deg, rgba(56, 134, 214, 0.2), rgba(29, 79, 143, 0.08));
    }

    .detail-pill[data-kind="flood_alert"] ha-icon {
      color: rgba(150, 224, 255, 0.98);
    }

    .detail-pill[data-kind="flood_alert"] .detail-pill-badge[data-tone="warning"]::before {
      box-shadow: 0 0 0 2px rgba(255, 143, 107, 0.18), 0 0 12px rgba(255, 101, 67, 0.56);
    }

    .detail-pill[data-kind="temperature_alert"] {
      border-color: rgba(255, 181, 105, 0.24);
      background: linear-gradient(180deg, rgba(255, 140, 88, 0.52), rgba(255, 109, 82, 0.04));
    }

    .detail-pill[data-kind="temperature_alert"] ha-icon {
      color: rgba(255, 209, 126, 0.98);
    }

    .detail-pill[data-kind="wind"] ha-icon {
      color: rgba(176, 224, 255, 0.95);
    }

    .detail-pill[data-kind="wind"][data-accent="alert"] {
      border-color: rgba(255, 160, 114, 0.22);
      background: linear-gradient(180deg, rgba(255, 140, 88, 0.52), rgba(255, 109, 82, 0.04));
    }

    .detail-pill[data-kind="wind"][data-accent="alert"] ha-icon {
      color: rgba(255, 196, 84, 0.95);
    }

    .detail-pill[data-kind="humidity"] ha-icon,
    .detail-pill[data-kind="dew_point"] ha-icon {
      color: rgba(118, 209, 255, 0.95);
    }

    /* Moisture milestone fills (RH + dew point): ideal/good → dry → sticky → oppressive → saturated. */
    .detail-pill[data-kind="humidity"][data-accent="humidity-ideal"],
    .detail-pill[data-kind="dew_point"][data-accent="humidity-ideal"] {
      border-color: rgba(96, 214, 148, 0.3);
      background: linear-gradient(180deg, rgba(72, 188, 118, 0.46), rgba(36, 110, 72, 0.06));
    }

    .detail-pill[data-kind="humidity"][data-accent="humidity-ideal"] ha-icon,
    .detail-pill[data-kind="dew_point"][data-accent="humidity-ideal"] ha-icon {
      color: rgba(150, 240, 186, 0.98);
    }

    .detail-pill[data-kind="humidity"][data-accent="humidity-dry"],
    .detail-pill[data-kind="dew_point"][data-accent="humidity-dry"] {
      border-color: rgba(130, 205, 255, 0.28);
      background: linear-gradient(180deg, rgba(88, 168, 230, 0.4), rgba(48, 104, 168, 0.06));
    }

    .detail-pill[data-kind="humidity"][data-accent="humidity-dry"] ha-icon,
    .detail-pill[data-kind="dew_point"][data-accent="humidity-dry"] ha-icon {
      color: rgba(160, 224, 255, 0.98);
    }

    .detail-pill[data-kind="humidity"][data-accent="humidity-sticky"],
    .detail-pill[data-kind="dew_point"][data-accent="humidity-sticky"] {
      border-color: rgba(255, 208, 96, 0.3);
      background: linear-gradient(180deg, rgba(230, 186, 72, 0.44), rgba(150, 118, 36, 0.06));
    }

    .detail-pill[data-kind="humidity"][data-accent="humidity-sticky"] ha-icon,
    .detail-pill[data-kind="dew_point"][data-accent="humidity-sticky"] ha-icon {
      color: rgba(255, 226, 140, 0.98);
    }

    .detail-pill[data-kind="humidity"][data-accent="humidity-oppressive"],
    .detail-pill[data-kind="dew_point"][data-accent="humidity-oppressive"] {
      border-color: rgba(255, 164, 104, 0.3);
      background: linear-gradient(180deg, rgba(255, 140, 88, 0.5), rgba(200, 90, 50, 0.06));
    }

    .detail-pill[data-kind="humidity"][data-accent="humidity-oppressive"] ha-icon,
    .detail-pill[data-kind="dew_point"][data-accent="humidity-oppressive"] ha-icon {
      color: rgba(255, 196, 128, 0.98);
    }

    .detail-pill[data-kind="humidity"][data-accent="humidity-saturated"],
    .detail-pill[data-kind="dew_point"][data-accent="humidity-saturated"] {
      border-color: rgba(232, 112, 168, 0.32);
      background: linear-gradient(180deg, rgba(198, 72, 132, 0.52), rgba(120, 36, 96, 0.08));
    }

    .detail-pill[data-kind="humidity"][data-accent="humidity-saturated"] ha-icon,
    .detail-pill[data-kind="dew_point"][data-accent="humidity-saturated"] ha-icon {
      color: rgba(255, 168, 208, 0.98);
    }

    .detail-pill-copy {
      display: grid;
      gap: 2px;
      min-width: 0;
    }

    .detail-pill {
      width: 100%;
      min-width: 0;
      height: var(--detail-pill-height, 42px);
      min-height: var(--detail-pill-height, 42px);
      padding: 7px 11px;
      gap: 6px;
      border-radius: 16px;
      align-items: center;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--primary-text-color, #fff) 6%, transparent), transparent 24%),
        var(--glass-panel);
    }

    .detail-pill-copy {
      gap: 4px;
      align-self: stretch;
    }

    .detail-pill-copy:not(.detail-pill-copy-scaled) {
      align-content: center;
    }

    .detail-pill-copy-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 7px;
      min-width: 0;
    }

    .detail-pill-label {
      display: block;
      font-size: 0.64rem;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: rgba(214, 225, 255, 0.54);
      white-space: nowrap;
    }

    .detail-pill-value {
      font-size: 0.88rem;
      font-weight: 610;
      line-height: 1.1;
      color: rgba(244, 248, 255, 0.96);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: right;
    }

    .detail-pill-scale {
      position: relative;
      display: grid;
      gap: 0;
      min-width: 0;
    }

    .detail-pill-scale-track {
      display: block;
      height: 5px;
      border-radius: 999px;
      background:
        linear-gradient(90deg, rgba(104, 242, 198, 0.96) 0%, rgba(218, 251, 110, 0.98) 22%, rgba(255, 219, 95, 0.98) 48%, rgba(255, 159, 84, 0.98) 72%, rgba(255, 96, 118, 0.98) 88%, rgba(201, 103, 255, 0.98) 100%);
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.16),
        0 0 16px rgba(135, 208, 255, 0.12);
    }

    .detail-pill-scale-peak {
      position: absolute;
      top: -4px;
      left: calc(var(--pill-scale-peak-position, 0) * 100%);
      width: 3px;
      height: 13px;
      border-radius: 999px;
      transform: translateX(-50%);
      background: rgba(248, 252, 255, 0.98);
      box-shadow:
        0 0 0 1px rgba(18, 36, 68, 0.38),
        0 0 14px rgba(223, 240, 255, 0.42);
    }

    .detail-pill-scale-marker {
      position: absolute;
      top: -2px;
      left: calc(var(--pill-scale-position, 0) * 100%);
      width: 9px;
      height: 9px;
      border-radius: 50%;
      transform: translateX(-50%);
      background: rgba(246, 250, 255, 0.96);
      border: 1px solid rgba(112, 173, 255, 0.66);
      box-shadow:
        0 0 0 2px rgba(28, 55, 96, 0.18),
        0 0 14px rgba(207, 235, 255, 0.38);
    }

    .detail-pill-scale-marker.is-hidden {
      opacity: 0;
    }

    .detail-pill-scale-peak.is-hidden {
      opacity: 0;
    }

    .detail-pill[data-kind="uvi"] {
      height: var(--detail-pill-height, 42px);
      min-height: var(--detail-pill-height, 42px);
      align-items: start;
      padding-block: 7px;
    }

    .detail-pill[data-kind="uvi"] ha-icon {
      color: rgba(255, 218, 118, 0.96);
    }

    .detail-pill[data-kind="uvi"] .detail-pill-copy {
      gap: 3px;
    }

    .detail-pill-tooltip {
      display: none;
    }

    .floating-detail-tooltip {
      position: absolute;
      z-index: 6;
      padding: 9px 11px;
      border-radius: 12px;
      background: rgba(10, 18, 30, 0.96);
      border: 1px solid rgba(255, 159, 110, 0.28);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
      color: rgba(244, 248, 255, 0.96);
      font-size: 0.76rem;
      font-weight: 500;
      line-height: 1.35;
      white-space: normal;
      pointer-events: none;
    }

    .floating-detail-tooltip::after {
      content: "";
      position: absolute;
      left: var(--pointer-left, 16px);
      width: 14px;
      height: 14px;
      background: rgba(10, 18, 30, 0.96);
      border-left: 1px solid rgba(255, 159, 110, 0.28);
      border-top: 1px solid rgba(255, 159, 110, 0.28);
      transform: rotate(45deg);
    }

    .floating-detail-tooltip[data-placement="below"]::after {
      top: -8px;
    }

    .floating-detail-tooltip[data-placement="above"]::after {
      bottom: -8px;
      transform: rotate(225deg);
    }

    .detail-pill-label {
      display: none;
    }

    .detail-pill-value {
      color: rgba(244, 248, 255, 0.94);
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      line-height: 1.1;
      overflow-wrap: break-word;
      min-width: 0;
    }

    .plot {
      position: relative;
      overflow-x: auto;
      overflow-y: visible;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }

    .chart-svg {
      width: 100%;
      max-width: none;
      height: auto;
      display: block;
    }


    .chart-guide {
      stroke: rgba(158, 184, 255, 0.12);
      stroke-width: 1;
    }

    .chart-guide.chart-guide-baseline {
      stroke: rgba(158, 184, 255, 0.18);
    }

    .chart-guide.chart-guide-precipitation {
      stroke: rgba(158, 196, 255, 0.18);
    }

    .chart-guide.chart-guide-precipitation.chart-guide-baseline {
      stroke: rgba(187, 216, 255, 0.3);
    }

    .chart-celestial-tracks {
      pointer-events: none;
    }

    .chart-celestial-sun {
      opacity: 0.74;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .chart-celestial-moon {
      opacity: 0.78;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .chart-axis {
      fill: rgba(220, 229, 255, 0.68);
      font-size: 13px;
    }

    .chart-axis.chart-axis-y {
      fill: rgba(220, 229, 255, 0.62);
    }

    .chart-axis.chart-axis-y.chart-axis-y-precipitation {
      fill: rgba(228, 237, 255, 0.84);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .chart-value {
      fill: rgba(240, 245, 255, 0.95);
      font-size: 14px;
      font-weight: 500;
      paint-order: stroke fill;
      stroke: rgba(14, 28, 54, 0.88);
      stroke-width: 3px;
      stroke-linejoin: round;
    }

    .chart-bar[data-current="true"] {
      stroke: rgba(243, 248, 255, 0.34);
      stroke-width: 2;
      filter: drop-shadow(0 4px 10px rgba(8, 18, 38, 0.32));
    }

    .chart-precipitation-bar {
      stroke: none;
      filter: none;
    }

    .chart-precip-bar-base {
      stroke: rgba(214, 239, 255, 0.2);
      stroke-width: 0.9;
    }

    .chart-precip-bar-base-storm {
      stroke: rgba(255, 218, 151, 0.32);
      stroke-width: 0.95;
    }

    .chart-precip-bar-cloud {
      opacity: 0.75;
      pointer-events: none;
    }

    .chart-precip-bar-streaks {
      opacity: 0.36;
      mix-blend-mode: screen;
      pointer-events: none;
    }

    .chart-precip-bar-pool {
      opacity: 0.74;
      pointer-events: none;
    }

    .chart-precip-bar-rim {
      stroke: rgba(241, 249, 255, 0.66);
      stroke-width: 0.95;
      stroke-linecap: round;
      pointer-events: none;
    }

    .chart-precip-bar-charge {
      opacity: 0.5;
      pointer-events: none;
    }

    .chart-precip-bar-charge-texture {
      opacity: 0.28;
      mix-blend-mode: screen;
      pointer-events: none;
    }

    .chart-precip-bar-rim-storm {
      stroke: rgba(255, 219, 144, 0.76);
      stroke-width: 1.05;
    }

    .chart-precipitation-bar[data-precip-intensity="none"] .chart-precip-bar-cloud,
    .chart-precipitation-bar[data-precip-intensity="none"] .chart-precip-bar-pool,
    .chart-precipitation-bar[data-precip-intensity="none"] .chart-precip-bar-streaks {
      opacity: 0.22;
    }

    .chart-precipitation-bar[data-precip-intensity="light"] .chart-precip-bar-cloud,
    .chart-precipitation-bar[data-precip-intensity="light"] .chart-precip-bar-pool {
      opacity: 0.6;
    }

    .chart-precipitation-bar[data-precip-intensity="moderate"] .chart-precip-bar-cloud,
    .chart-precipitation-bar[data-precip-intensity="moderate"] .chart-precip-bar-pool {
      opacity: 0.84;
    }

    .chart-precipitation-bar[data-precip-intensity="heavy"] .chart-precip-bar-cloud,
    .chart-precipitation-bar[data-precip-intensity="heavy"] .chart-precip-bar-pool {
      opacity: 0.96;
    }

    .chart-precipitation-bar[data-precip-intensity="heavy"] .chart-precip-bar-rim,
    .chart-precipitation-bar[data-precip-intensity="heavy"] .chart-precip-bar-rim-storm {
      stroke-width: 1.2;
    }

    .chart-storm-cap {
      stroke: rgba(255, 243, 185, 0.84);
      stroke-width: 0.65;
      filter: drop-shadow(0 0 2px rgba(255, 190, 92, 0.26));
      pointer-events: none;
    }

    .chart-storm-cap[data-energy="low"] {
      stroke: rgba(255, 237, 172, 0.74);
      filter: drop-shadow(0 0 1px rgba(255, 184, 88, 0.2));
    }

    .chart-storm-cap[data-energy="medium"] {
      stroke: rgba(255, 238, 176, 0.86);
      filter: drop-shadow(0 0 2px rgba(255, 188, 92, 0.32));
    }

    .chart-storm-cap[data-energy="high"] {
      stroke: rgba(255, 244, 188, 0.94);
      filter: drop-shadow(0 0 3px rgba(255, 196, 96, 0.42));
    }

    .chart-storm-spark {
      fill: none;
      stroke: rgba(255, 229, 159, 0.94);
      stroke-width: 1.05;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0;
      pointer-events: none;
      animation-name: storm-cap-burst;
      animation-duration: var(--spark-duration, 1.65s);
      animation-delay: var(--spark-delay, 0s);
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }

    .chart-storm-spark[data-energy="medium"] {
      stroke: rgba(255, 224, 150, 0.84);
      stroke-width: 1;
    }

    .chart-storm-spark[data-energy="high"] {
      stroke: rgba(255, 232, 162, 0.94);
      stroke-width: 1.12;
    }

    @keyframes storm-cap-burst {
      0%,
      62%,
      100% {
        opacity: 0;
      }

      5% {
        opacity: 0.9;
      }

      9% {
        opacity: 0.36;
      }

      12% {
        opacity: 0.82;
      }

      16% {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .chart-storm-spark {
        animation: none;
        opacity: 0;
      }

      .chart-storm-cap {
        filter: none;
      }
    }

    .chart-column-hitbox {
      fill: transparent;
      cursor: pointer;
      outline: none;
    }

    .chart-column-hitbox:focus-visible {
      fill: rgba(255, 221, 163, 0.08);
      stroke: rgba(255, 221, 163, 0.7);
      stroke-width: 2;
    }

    .chart-column-selection {
      fill: rgba(245, 175, 83, 0.12);
      stroke: rgba(255, 205, 127, 0.48);
      stroke-width: 1.5;
      pointer-events: none;
    }

    .chart-column-tooltip {
      pointer-events: none;
    }

    .chart-column-tooltip-box {
      fill: rgba(10, 18, 30, 0.96);
      stroke: rgba(255, 170, 118, 0.34);
      stroke-width: 1;
    }

    .chart-column-tooltip-pointer {
      fill: rgba(10, 18, 30, 0.96);
      stroke: rgba(255, 170, 118, 0.34);
      stroke-width: 1;
    }

    .chart-column-tooltip-title {
      fill: rgba(255, 217, 168, 0.96);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .chart-column-tooltip-copy {
      fill: rgba(244, 248, 255, 0.96);
      font-size: 12px;
      font-weight: 600;
    }

    .chart-feels-like {
      fill: none;
      stroke: rgba(214, 246, 255, 0.98);
      stroke-width: 4.5;
      stroke-linecap: round;
      filter: drop-shadow(0 1px 2px rgba(8, 18, 38, 0.52));
    }

    .chart-feels-like[data-direction="higher"] {
      stroke: rgba(255, 187, 170, 0.98);
    }

    .chart-feels-like-value {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.01em;
      paint-order: stroke fill;
      stroke: rgba(14, 28, 54, 0.82);
      stroke-width: 3px;
      stroke-linejoin: round;
    }

    .chart-feels-like-value[data-direction="lower"] {
      fill: rgba(18, 122, 201, 0.99);
      stroke: rgba(247, 251, 255, 0.96);
      stroke-width: 2.6px;
      font-weight: 700;
      filter: none;
    }

    .chart-feels-like-value[data-direction="higher"] {
      fill: rgba(213, 98, 69, 0.99);
    }

    .chart-value[data-current="true"],
    .chart-axis[data-current="true"] {
      fill: rgba(245, 249, 255, 0.98);
      font-weight: 700;
    }

    .chart-label-hidden {
      display: none;
    }

    .quiet-strip {
      display: inline-flex;
      align-items: center;
    }

    .quiet-icons {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .quiet-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      padding: 0;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(158, 184, 255, 0.08);
      color: rgba(220, 229, 255, 0.52);
      line-height: 1;
    }

    .quiet-chip ha-icon {
      --mdc-icon-size: 16px;
      color: rgba(220, 229, 255, 0.38);
    }

    .missing {
      padding: 20px 16px;
      color: rgba(255, 211, 211, 0.86);
    }

    @media (max-width: 760px) {
      .series[data-layout="grid"] {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    @media (max-width: 980px) {
      .card-hero-topbar {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
      }

      .card-hero-accessories {
        justify-items: end;
      }

      .topline {
        flex-direction: column;
        align-items: stretch;
      }

      .summary {
        max-width: none;
      }

      .ranges {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);
        width: 100%;
      }

      .ranges button {
        width: 100%;
        text-align: center;
      }

      .header-pills {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto;
        align-items: stretch;
      }

      .header-pills-metrics {
        grid-column: 1;
        grid-row: 1;
        align-items: flex-start;
      }

      .header-pills-metrics .metric-pill {
        width: 100%;
        max-width: 320px;
        height: var(--header-pill-height);
        min-height: var(--header-pill-height);
      }

      .header-pills-details {
        grid-column: 1;
        grid-row: 2;
        width: 100%;
        align-items: stretch;
      }

      .detail-pills {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: start;
      }

      .detail-pills .detail-pill {
        flex: 0 0 auto;
        width: 100%;
        max-width: 320px;
        min-width: 0;
      }

      .detail-pill {
        padding-inline: 5px 10px;
      }

      .detail-pill-value {
        font-size: 0.75rem;
      }
    }

    @media (max-width: 430px) {
      .card-hero {
        padding: 12px;
        gap: 10px;
        border-radius: 20px;
      }

      .card-hero-body {
        grid-template-columns: minmax(0, 1fr);
        gap: 14px;
        padding: 14px;
      }

      .hero-metrics {
        justify-content: center;
      }

      .hero-detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
      }

      .hero-metric-card {
        min-height: auto;
        padding: 0;
      }

      .hero-condition-card,
      .hero-detail-card {
        min-height: 38px;
        padding: 6px 10px;
        gap: 6px;
      }

      .hero-condition-card ha-icon,
      .hero-detail-card ha-icon {
        --mdc-icon-size: 20px;
      }

      .hero-detail-value {
        font-size: 0.88rem;
      }

      .hero-alert-chip {
        font-size: 0.7rem;
        padding: 5px 9px;
      }

      .metric-pills {
        flex-direction: column;
      }

      .metric-value {
        font-size: 1.40625rem;
      }

      .plot {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin-inline: 0;
        padding-inline-end: 12px;
        border-radius: 12px;
      }
    }

    @container host-card (max-width: 480px) {
      .wrap {
        padding: 10px;
        gap: 10px;
      }

      .card-hero {
        padding: 12px;
        gap: 10px;
      }

      .card-hero-topbar {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
      }

      .card-hero-accessories {
        justify-items: end;
      }

      .hero-metrics {
        justify-content: center;
      }

      .hero-detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
      }

      .card-hero-main {
        gap: 6px;
      }

      .hero-summary {
        max-width: none;
      }

      .panel {
        padding: 12px 10px 10px;
        border-radius: 13px;
      }

      .rowhead {
        --header-pill-height: 42px;
        gap: 6px;
      }

      .topline {
        gap: 8px;
      }

      .ranges {
        gap: 4px;
        padding: 3px;
      }

      .ranges button {
        padding: 7px 10px;
      }

      .header-pills {
        gap: 3px 4px;
      }

      .header-pills-metrics {
        gap: 3px;
      }

      .header-pills-details {
        gap: 3px;
      }

      .metric-pill {
        min-width: 128px;
        padding: 6px 10px;
      }

      .hero-metric-value {
        font-size: 1.75rem;
      }

      .hero-metric-label {
        font-size: 0.66rem;
      }

      .hero-detail-value {
        font-size: 0.84rem;
      }

      .detail-pill {
        min-width: 126px;
        height: 30px;
        min-height: 30px;
        padding: 1px 7px;
        gap: 4px;
      }

      .hero-pill-pair .detail-pill {
        min-width: 0;
      }

      .detail-pill-value {
        font-size: 0.7rem;
      }

      .metric-value {
        font-size: 1.40625rem;
      }

      .detail-pill ha-icon {
        --mdc-icon-size: 22px;
      }

      .plot {
        padding-inline-end: 0;
      }

      .detail-pill-badge {
        width: 22px;
        height: 22px;
        flex-basis: 22px;
      }

      .detail-pill-badge::before {
        width: 12px;
        height: 12px;
      }
    }

    @container host-card (max-width: 560px) {
      .card-hero-body {
        grid-template-columns: minmax(0, 1fr);
      }

      .card-hero-topbar {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
      }

      .card-hero-accessories {
        justify-items: end;
      }

      .hero-metrics {
        justify-content: center;
      }

      .hero-detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
      }
    }

    @container host-card (max-width: 430px) {
      .card-hero-body {
        grid-template-columns: minmax(0, 1fr);
      }

      .card-hero-topbar {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
      }

      .hero-metrics {
        justify-content: center;
        gap: 6px 12px;
      }

      .hero-metric-value {
        font-size: clamp(1.3rem, 6.2vw, 1.8rem);
      }

      .hero-metric-label {
        font-size: 0.58rem;
      }

      .hero-detail-grid {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 6px;
      }

      .hero-condition-card,
      .hero-detail-card {
        width: fit-content;
        min-width: 0;
        min-inline-size: 5.4rem;
        max-inline-size: 100%;
        flex: 0 1 auto;
        justify-self: start;
        min-height: 36px;
        padding: 6px 10px;
        gap: 6px;
      }

      .hero-condition-card ha-icon,
      .hero-detail-card ha-icon {
        --mdc-icon-size: 20px;
      }

      .hero-detail-value {
        font-size: 0.9rem;
      }
    }

    @container host-card (max-width: 340px) {
      .card-hero-topbar {
        grid-template-columns: minmax(0, 1fr);
      }

      .card-hero-accessories {
        justify-items: start;
      }

      .hero-metrics {
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
    }

    @container host-card (max-width: 560px) {
      .card-hero {
        padding: 14px;
      }

      .card-hero-grid {
        grid-template-columns: minmax(0, 1.54fr) minmax(128px, 1fr);
        column-gap: 10px;
        row-gap: 10px;
      }

      .hero-overview,
      .hero-range-cell {
        padding-bottom: 10px;
      }

      .hero-overview {
        grid-template-columns: minmax(0, 1fr) minmax(92px, 0.82fr);
        gap: 10px;
      }

      .hero-overview-label,
      .hero-overview-condition-label {
        font-size: 0.58rem;
      }

      .hero-overview-value {
        font-size: clamp(1.02rem, 4.5vw, 1.42rem);
      }

      .hero-overview-metric[data-tone="supporting"] .hero-overview-value,
      .hero-overview-condition-value {
        font-size: 0.84rem;
      }

      .hero-range-cell .ranges {
        gap: 3px;
        padding: 3px;
      }

      .hero-range-cell .ranges button {
        padding-block: 7px;
        font-size: 0.82rem;
      }

      .hero-pill-rail {
        --detail-pill-height: 42px;
        gap: 5px;
      }

      .detail-pill {
        height: var(--detail-pill-height, 42px);
        min-height: var(--detail-pill-height, 42px);
        padding: 7px 9px;
        gap: 5px;
      }

      .detail-pill-value {
        font-size: 0.8rem;
      }

    }

    @container host-card (max-width: 430px) {
      .card-hero-grid {
        grid-template-columns: minmax(0, 1.24fr) minmax(132px, 1.16fr);
        column-gap: 8px;
      }

      .hero-overview {
        grid-template-columns: minmax(0, 1fr);
        gap: 7px;
      }

      .hero-overview-secondary {
        gap: 6px;
      }

      .hero-range-cell .ranges button {
        font-size: 0.78rem;
      }
    }

    @container host-card (max-width: 430px) {
      .hero-pill-rail {
        --detail-pill-height: 42px;
      }
    }

    @container host-card (max-width: 340px) {
      .card-hero-grid {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
          "overview"
          "ranges"
          "pills";
      }

      .hero-overview,
      .hero-range-cell {
        padding-bottom: 0;
        border-bottom: 0;
      }
    }

  `;
var WeatherRiskBridgeCardEditor = class extends i4 {
  constructor() {
    super(...arguments);
    this._config = stubConfig();
    this._locationDefaults = null;
    this._locationForm = buildLocationFormState();
    this._locationRecords = [];
    this._locationStatus = null;
    this._loadingLocations = false;
    this._savingLocation = false;
    this._hasLoadedLocationManager = false;
  }
  setConfig(config) {
    this._config = normalizeCardConfig(config);
  }
  render() {
    try {
      const config = normalizeCardConfig(this._config);
      const entityOptions = cardEntityOptions(this.hass?.states ?? {});
      const locationOptions = cardLocationOptions(this.hass?.states ?? {});
      const locationPlaceholder = locationOptions[0]?.key ?? "home";
      return b2`
        <div class="form">
          <div class="section">
            <div class="section-title">Location Setup</div>

            <div class="field">
              <label for="location_select">Detected location</label>
              <select
                id="location_select"
                .value=${config.location ?? ""}
                @change=${this._handleLocationSelect}
              >
                <option value="">Select a Weather Risk Bridge location</option>
                ${locationOptions.map(
        (option) => b2`<option value=${option.key}>${option.label}</option>`
      )}
              </select>
              <div class="help">
                Picks from the Weather Risk Bridge entities Home Assistant already knows about.
              </div>
            </div>

            <div class="field">
              <label for="location">Location key</label>
              <input
                id="location"
                type="text"
                .value=${config.location ?? ""}
                placeholder=${locationPlaceholder}
                @input=${this._handleLocationInput}
              />
              <div class="help">
                Portable Weather Risk Bridge slug, such as <code>home</code> or <code>austin_tx</code>.
              </div>
            </div>

            <div class="field">
              <label for="entity">Chart entity override</label>
              <select id="entity" .value=${config.entity} @change=${this._handleEntityChange}>
                <option value="">Select a Weather Risk chart entity</option>
                ${entityOptions.map(
        (entityId) => b2`<option value=${entityId}>${entityId}</option>`
      )}
              </select>
              <div class="help">
                Advanced override for backward compatibility or debugging. The card can also derive entities from the location key alone.
              </div>
            </div>

            ${locationOptions.length === 0 && entityOptions.length === 0 ? b2`
                  <div class="warning">
                    No Weather Risk Bridge entities were found in Home Assistant yet. Use the code editor or add the Weather Risk Bridge integration/entities first.
                  </div>
                ` : A}
          </div>

          <div class="field">
            <label for="title">Card title</label>
            <input
              id="title"
              type="text"
              .value=${config.title ?? ""}
              placeholder="Weather Risk"
              @input=${this._handleTitleInput}
            />
            <div class="help">
              Overrides the card heading. Leave blank to use the built-in title.
            </div>
          </div>

          <div class="field">
            <label for="default_range">Default range</label>
            <select
              id="default_range"
              .value=${String(config.default_range ?? DEFAULT_RANGE)}
              @change=${this._handleRangeChange}
            >
              ${rangeValues().map(
        (value) => b2`
                  <option value=${String(value)}>
                    ${value === 1 ? "Now / 1h nowcast (when available)" : `${value} hours`}
                  </option>
                `
      )}
            </select>
            <div class="help">
              Sets the first horizon shown when the dashboard loads. Now / 1h is capability-gated and will fall back to a strategic range when minute nowcast is unavailable.
            </div>
          </div>

          <div class="field">
            <label for="series_layout">Series layout</label>
            <select
              id="series_layout"
              .value=${config.series_layout ?? DEFAULT_SERIES_LAYOUT}
              @change=${this._handleSeriesLayoutChange}
            >
              <option value="stacked">Stacked panels</option>
              <option value="grid">Grid panels</option>
            </select>
            <div class="help">
              Grid mode breaks the card into individual sub-panels for better visual separation between temperature and hazards.
            </div>
          </div>

          <div class="field">
            <label for="series_columns">Grid columns</label>
            <select
              id="series_columns"
              .value=${String(config.series_columns ?? DEFAULT_SERIES_COLUMNS)}
              ?disabled=${config.series_layout !== "grid"}
              @change=${this._handleSeriesColumnsChange}
            >
              <option value="2">2 columns</option>
              <option value="3">3 columns</option>
              <option value="4">4 columns</option>
            </select>
            <div class="help">
              Used only in grid mode. The layout collapses back to one column on narrower screens.
            </div>
          </div>

          <div class="field">
            <label for="probability_axis_mode">Probability axis</label>
            <select
              id="probability_axis_mode"
              .value=${config.probability_axis_mode ?? DEFAULT_PROBABILITY_AXIS_MODE}
              @change=${this._handleProbabilityAxisModeChange}
            >
              <option value="adaptive">Adaptive risk scale</option>
              <option value="fixed_10">Fixed 0 to 10%</option>
              <option value="fixed_25">Fixed 0 to 25%</option>
              <option value="fixed_50">Fixed 0 to 50%</option>
              <option value="fixed_100">Fixed 0 to 100%</option>
              <option value="auto">Auto scale to current peak</option>
            </select>
            <div class="help">
              Adaptive is the recommended default. It avoids useless 1 percent axes while still keeping low-risk periods legible.
            </div>
          </div>

          <div class="field">
            <label for="low_risk_behavior">Quiet forecast handling</label>
            <select
              id="low_risk_behavior"
              .value=${config.low_risk_behavior ?? DEFAULT_LOW_RISK_BEHAVIOR}
              @change=${this._handleLowRiskBehaviorChange}
            >
              <option value="icons">Show muted inactive hazard icons</option>
              <option value="hide">Hide quiet hazards entirely</option>
              <option value="show">Always show quiet hazard charts</option>
            </select>
            <div class="help">
              Controls what happens when rain, thunderstorms, wind, hail, and tornado risk stay at or below the quiet threshold for the selected horizon.
            </div>
          </div>

          <div class="field">
            <label for="low_risk_threshold">Quiet forecast threshold</label>
            <select
              id="low_risk_threshold"
              .value=${String(config.low_risk_threshold ?? DEFAULT_LOW_RISK_THRESHOLD)}
              @change=${this._handleLowRiskThresholdChange}
            >
              ${[0, 1, 2, 5, 10].map(
        (value) => b2`<option value=${String(value)}>${value}%</option>`
      )}
            </select>
            <div class="help">
              A threshold of 2 percent hides or smooths away the nearly-no-risk cases without erasing meaningful signals.
            </div>
          </div>

          <div class="field">
            <label for="temperature_axis_mode">Temperature axis</label>
            <select
              id="temperature_axis_mode"
              .value=${config.temperature_axis_mode ?? DEFAULT_TEMPERATURE_AXIS_MODE}
              @change=${this._handleTemperatureAxisModeChange}
            >
              <option value="auto">Auto scale to visible temperatures</option>
              <option value="fixed_span_20f">Fixed 20F span around forecast center</option>
            </select>
            <div class="help">
              Use a fixed span when you want steadier temperature bars instead of the chart stretching around a narrow range.
            </div>
          </div>

          <div class="field">
            <label for="x_axis_labels">X axis labels</label>
            <select
              id="x_axis_labels"
              .value=${config.x_axis_labels ?? DEFAULT_X_AXIS_LABEL_MODE}
              @change=${this._handleXAxisLabelsChange}
            >
              <option value="compact">Compact</option>
              <option value="full">Full</option>
              <option value="off">Off</option>
            </select>
            <div class="help">
              Compact shows a few time labels, full shows every label, and off gives the cleanest plot.
            </div>
          </div>

          <div class="field">
            <label class="toggle">
              <input
                type="checkbox"
                .checked=${config.show_y_axis_labels !== false}
                @change=${this._handleShowYAxisLabelsChange}
              />
              Show y axis labels
            </label>
            <div class="help">
              Displays the left-side scale labels for each series.
            </div>
          </div>

          <div class="field">
            <label for="temperature_display">Temperature display</label>
            <select
              id="temperature_display"
              .value=${config.temperature_display ?? DEFAULT_TEMPERATURE_DISPLAY}
              @change=${this._handleTemperatureDisplayChange}
            >
              <option value="always">Always show temperature</option>
              <option value="fallback_only">Only show temperature when hazards are quiet</option>
            </select>
            <div class="help">
              Controls whether temperature stays visible beside hazard probabilities or only appears on quiet forecasts.
            </div>
          </div>

          <div class="field">
            <label class="toggle">
              <input
                type="checkbox"
                .checked=${config.show_alerts !== false}
                @change=${this._handleShowAlertsChange}
              />
              Show alert chips
            </label>
            <div class="help">
              Shows active alert badges above the graph. Disable this if you want a cleaner chart-focused card.
            </div>
          </div>

          <div class="field">
            <label for="max_alerts">Alert chip limit</label>
            <select
              id="max_alerts"
              .value=${String(config.max_alerts ?? DEFAULT_MAX_ALERTS)}
              ?disabled=${config.show_alerts === false}
              @change=${this._handleMaxAlertsChange}
            >
              ${[1, 2, 3, 4, 5].map(
        (value) => b2`<option value=${String(value)}>${value}</option>`
      )}
            </select>
            <div class="help">
              Limits how many active alerts are shown so the header stays compact.
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown visual editor error.";
      return b2`
        <div class="form">
          <div class="warning">
            Weather Risk Bridge visual editor failed to render: ${message}. Use the code editor until the visual editor is recovered.
          </div>
        </div>
      `;
    }
  }
  _selectedManagedLocation() {
    const locationKey = normalizeLocationKey(this._config.location ?? "");
    return this._locationRecords.find((location) => location.slug === locationKey) ?? null;
  }
  _applyLocationConfig(locationKey) {
    this._updateConfig({
      location: locationKey,
      entity: locationKey ? chartEntityIdForLocation(locationKey, DEFAULT_RANGE) : ""
    });
  }
  async _startCreateLocationFlow() {
    if (!this.hass?.callApi) {
      throw new Error("Home Assistant admin API is unavailable in this editor context.");
    }
    return await this.hass.callApi("POST", "config/config_entries/flow", {
      handler: "weather_risk_bridge"
    });
  }
  async _startExistingLocationOptionsFlow(entryId) {
    if (!this.hass?.callApi) {
      throw new Error("Home Assistant admin API is unavailable in this editor context.");
    }
    return await this.hass.callApi(
      "POST",
      "config/config_entries/options/flow",
      {
        handler: entryId
      }
    );
  }
  async _loadExistingLocationForm(location) {
    if (!this.hass?.callApi) {
      return;
    }
    try {
      const flow = await this._startExistingLocationOptionsFlow(location.entry_id);
      this._locationDefaults = flowDefaultsFromSchema(flow.data_schema, this._locationDefaults);
      this._locationForm = locationFormStateFromSchema(
        flow.data_schema,
        this._locationDefaults,
        location.entry_id
      );
    } catch (error) {
      this._locationStatus = {
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to load the selected Weather Risk Bridge location."
      };
    }
  }
  async _loadManagedLocations(options = {}) {
    if (!this.hass?.callApi || this._loadingLocations) {
      return;
    }
    this._loadingLocations = true;
    try {
      const fallbackLocationOptions = cardLocationOptions(this.hass?.states ?? {});
      const fallbackSlugByTitle = new Map(
        fallbackLocationOptions.map((location) => [location.label.toLowerCase(), location.key])
      );
      const entries = await this.hass.callApi(
        "GET",
        "config/config_entries/entry"
      );
      const initFlow = await this._startCreateLocationFlow();
      const defaults = flowDefaultsFromSchema(initFlow.data_schema, {
        label: "",
        latitude: this.hass.config?.latitude ?? 0,
        longitude: this.hass.config?.longitude ?? 0,
        service_url: "",
        wind_threshold_mph: DEFAULT_WIND_THRESHOLD_MPH
      });
      const locations = entries.filter((entry) => entry.domain === "weather_risk_bridge").map((entry) => {
        const slug = fallbackSlugByTitle.get(entry.title.toLowerCase()) ?? normalizeLocationKey(entry.title);
        return {
          entry_id: entry.entry_id,
          slug,
          title: entry.title,
          label: entry.title,
          state: entry.state,
          supports_reconfigure: entry.supports_reconfigure
        };
      }).sort((left, right) => left.title.localeCompare(right.title));
      this._locationDefaults = defaults;
      this._locationRecords = locations;
      const selectedSlug = normalizeLocationKey(
        options.selectedSlug ?? this._config.location ?? ""
      );
      const selectedLocation = locations.find((location) => location.slug === selectedSlug) ?? null;
      if (!options.preserveForm || !this._hasLoadedLocationManager) {
        this._locationForm = buildLocationFormState(defaults, selectedLocation);
      }
      this._hasLoadedLocationManager = true;
      this._locationStatus = options.status ?? null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load Weather Risk Bridge locations.";
      this._locationStatus = {
        tone: "error",
        message
      };
    } finally {
      this._loadingLocations = false;
    }
  }
  _handleLocationFormInput(event, field) {
    const target = event.currentTarget;
    this._locationForm = {
      ...this._locationForm,
      [field]: target.value
    };
  }
  async _handleSaveLocation() {
    if (!this.hass?.callApi) {
      this._locationStatus = {
        tone: "error",
        message: "Home Assistant admin API is unavailable in this editor context."
      };
      return;
    }
    if (!this._locationForm.label.trim()) {
      this._locationStatus = {
        tone: "error",
        message: "Location label is required."
      };
      return;
    }
    const latitude = Number(this._locationForm.latitude);
    const longitude = Number(this._locationForm.longitude);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      this._locationStatus = {
        tone: "error",
        message: "Latitude and longitude must be valid numbers."
      };
      return;
    }
    this._savingLocation = true;
    this._locationStatus = {
      tone: "info",
      message: "Saving Weather Risk Bridge location..."
    };
    try {
      const isExistingLocation = Boolean(this._locationForm.entry_id);
      const initFlow = isExistingLocation ? await this._startExistingLocationOptionsFlow(this._locationForm.entry_id) : await this._startCreateLocationFlow();
      const flowPath = isExistingLocation ? `config/config_entries/options/flow/${initFlow.flow_id}` : `config/config_entries/flow/${initFlow.flow_id}`;
      const response = await this.hass.callApi("POST", flowPath, {
        service_url: this._locationForm.service_url,
        bearer_token: this._locationForm.bearer_token,
        label: this._locationForm.label,
        latitude,
        longitude,
        wind_threshold_mph: Number(this._locationForm.wind_threshold_mph)
      });
      if (response.type === "form") {
        const errorKey = response.errors?.base;
        this._locationStatus = {
          tone: "error",
          message: errorKey === "cannot_connect" ? "Weather Risk Bridge could not connect to the configured service URL." : "Home Assistant rejected the Weather Risk Bridge location settings."
        };
        this._locationDefaults = flowDefaultsFromSchema(response.data_schema, this._locationDefaults);
        this._locationForm = {
          ...this._locationForm,
          service_url: this._locationForm.service_url,
          bearer_token: this._locationForm.bearer_token,
          label: this._locationForm.label,
          latitude: String(latitude),
          longitude: String(longitude),
          wind_threshold_mph: this._locationForm.wind_threshold_mph
        };
        return;
      }
      const expectedTitle = deriveLocationTitle(this._locationForm.label, latitude, longitude);
      const expectedSlug = normalizeLocationKey(expectedTitle);
      this._applyLocationConfig(expectedSlug);
      await this._loadManagedLocations({
        selectedSlug: expectedSlug,
        preserveForm: false,
        status: {
          tone: "success",
          message: isExistingLocation ? `Updated Weather Risk Bridge location "${expectedTitle}".` : `Created Weather Risk Bridge location "${expectedTitle}".`
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save Weather Risk Bridge location.";
      this._locationStatus = {
        tone: "error",
        message
      };
    } finally {
      this._savingLocation = false;
    }
  }
  _handleLocationSelect(event) {
    const target = event.currentTarget;
    const location = normalizeLocationKey(target.value);
    const detectedLocation = cardLocationOptions(this.hass?.states ?? {}).find((record) => record.key === location) ?? null;
    this._updateConfig({
      location,
      entity: detectedLocation?.entityId ?? (location ? chartEntityIdForLocation(location, DEFAULT_RANGE) : this._config.entity)
    });
  }
  _handleLocationInput(event) {
    const target = event.currentTarget;
    const location = normalizeLocationKey(target.value);
    this._applyLocationConfig(location);
  }
  _handleEntityChange(event) {
    const target = event.currentTarget;
    const location = deriveLocationKeyFromEntityId(target.value);
    this._updateConfig({
      entity: target.value,
      location
    });
  }
  _handleTitleInput(event) {
    const target = event.currentTarget;
    this._updateConfig({ title: target.value });
  }
  _handleRangeChange(event) {
    const target = event.currentTarget;
    this._updateConfig({ default_range: Number(target.value) });
  }
  _handleSeriesLayoutChange(event) {
    const target = event.currentTarget;
    this._updateConfig({ series_layout: target.value === "grid" ? "grid" : "stacked" });
  }
  _handleSeriesColumnsChange(event) {
    const target = event.currentTarget;
    this._updateConfig({ series_columns: Number(target.value) });
  }
  _handleProbabilityAxisModeChange(event) {
    const target = event.currentTarget;
    this._updateConfig({
      probability_axis_mode: normalizeProbabilityAxisMode(target.value)
    });
  }
  _handleLowRiskBehaviorChange(event) {
    const target = event.currentTarget;
    this._updateConfig({
      low_risk_behavior: normalizeLowRiskBehavior(target.value)
    });
  }
  _handleLowRiskThresholdChange(event) {
    const target = event.currentTarget;
    this._updateConfig({ low_risk_threshold: Number(target.value) });
  }
  _handleTemperatureAxisModeChange(event) {
    const target = event.currentTarget;
    this._updateConfig({
      temperature_axis_mode: target.value === "fixed_span_20f" ? "fixed_span_20f" : DEFAULT_TEMPERATURE_AXIS_MODE
    });
  }
  _handleXAxisLabelsChange(event) {
    const target = event.currentTarget;
    this._updateConfig({
      x_axis_labels: target.value === "full" || target.value === "off" ? target.value : DEFAULT_X_AXIS_LABEL_MODE
    });
  }
  _handleShowYAxisLabelsChange(event) {
    const target = event.currentTarget;
    this._updateConfig({ show_y_axis_labels: target.checked });
  }
  _handleTemperatureDisplayChange(event) {
    const target = event.currentTarget;
    this._updateConfig({
      temperature_display: target.value === "fallback_only" ? "fallback_only" : DEFAULT_TEMPERATURE_DISPLAY
    });
  }
  _handleShowAlertsChange(event) {
    const target = event.currentTarget;
    this._updateConfig({ show_alerts: target.checked });
  }
  _handleMaxAlertsChange(event) {
    const target = event.currentTarget;
    this._updateConfig({ max_alerts: Number(target.value) });
  }
  _updateConfig(patch) {
    this._config = normalizeCardConfig({
      ...this._config,
      ...patch,
      type: this._config.type ?? `custom:${CARD_TYPE}`
    });
    emitConfigChanged(this, this._config);
  }
};
WeatherRiskBridgeCardEditor.properties = {
  hass: { attribute: false },
  _config: { state: true },
  _locationDefaults: { state: true },
  _locationForm: { state: true },
  _locationRecords: { state: true },
  _locationStatus: { state: true },
  _loadingLocations: { state: true },
  _savingLocation: { state: true }
};
WeatherRiskBridgeCardEditor.styles = i`
    :host {
      display: block;
    }

    .form {
      display: grid;
      gap: 16px;
      padding: 8px 0;
    }

    .field {
      display: grid;
      gap: 6px;
    }

    label {
      font-weight: 600;
      color: var(--primary-text-color);
    }

    select,
    input[type="text"],
    input[type="number"],
    input[type="password"] {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }

    button {
      width: fit-content;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      cursor: pointer;
    }

    button[disabled] {
      opacity: 0.6;
      cursor: default;
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .toggle input {
      margin: 0;
    }

    .help {
      font-size: 0.84rem;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }

    .warning {
      padding: 12px;
      border-radius: 10px;
      background: rgba(255, 183, 76, 0.12);
      color: var(--primary-text-color);
    }

    .section {
      display: grid;
      gap: 16px;
      padding: 16px;
      border-radius: 16px;
      border: 1px solid var(--divider-color);
      background: color-mix(in srgb, var(--card-background-color) 90%, transparent);
    }

    .section-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--primary-text-color);
    }

    .field-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    .status {
      padding: 12px;
      border-radius: 10px;
      color: var(--primary-text-color);
    }

    .status[data-tone="info"] {
      background: rgba(121, 184, 255, 0.12);
    }

    .status[data-tone="success"] {
      background: rgba(126, 201, 139, 0.14);
    }

    .status[data-tone="error"] {
      background: rgba(255, 108, 108, 0.14);
    }
  `;
if (!customElements.get(CARD_TYPE)) {
  customElements.define(CARD_TYPE, WeatherRiskBridgeCard);
}
if (!customElements.get(EDITOR_TYPE)) {
  customElements.define(EDITOR_TYPE, WeatherRiskBridgeCardEditor);
}
var customCards = window.customCards ?? [];
if (!customCards.some((card) => card.type === CARD_TYPE)) {
  customCards.push({
    type: CARD_TYPE,
    name: "Weather Risk Bridge",
    description: "Graph weather risk probabilities and temperature across selectable horizons.",
    preview: true
  });
  window.customCards = customCards;
}
export {
  WeatherRiskBridgeCard
};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/keyed.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
