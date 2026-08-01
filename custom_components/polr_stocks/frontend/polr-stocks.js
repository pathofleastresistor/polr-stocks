/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const H = globalThis, Z = H.ShadowRoot && (H.ShadyCSS === void 0 || H.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, J = Symbol(), st = /* @__PURE__ */ new WeakMap();
let $t = class {
  constructor(t, i, o) {
    if (this._$cssResult$ = !0, o !== J) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (Z && t === void 0) {
      const o = i !== void 0 && i.length === 1;
      o && (t = st.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), o && st.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Pt = (e) => new $t(typeof e == "string" ? e : e + "", void 0, J), Q = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((o, r, s) => o + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[s + 1], e[0]);
  return new $t(i, e, J);
}, zt = (e, t) => {
  if (Z) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const o = document.createElement("style"), r = H.litNonce;
    r !== void 0 && o.setAttribute("nonce", r), o.textContent = i.cssText, e.appendChild(o);
  }
}, nt = Z ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const o of t.cssRules) i += o.cssText;
  return Pt(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ot, defineProperty: Ut, getOwnPropertyDescriptor: Tt, getOwnPropertyNames: Mt, getOwnPropertySymbols: Nt, getPrototypeOf: Rt } = Object, I = globalThis, at = I.trustedTypes, Ht = at ? at.emptyScript : "", Dt = I.reactiveElementPolyfillSupport, U = (e, t) => e, j = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Ht : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let i = e;
  switch (t) {
    case Boolean:
      i = e !== null;
      break;
    case Number:
      i = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(e);
      } catch {
        i = null;
      }
  }
  return i;
} }, G = (e, t) => !Ot(e, t), ct = { attribute: !0, type: String, converter: j, reflect: !1, useDefault: !1, hasChanged: G };
Symbol.metadata ??= Symbol("metadata"), I.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let k = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = ct) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const o = Symbol(), r = this.getPropertyDescriptor(t, o, i);
      r !== void 0 && Ut(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, i, o) {
    const { get: r, set: s } = Tt(this.prototype, t) ?? { get() {
      return this[i];
    }, set(n) {
      this[i] = n;
    } };
    return { get: r, set(n) {
      const c = r?.call(this);
      s?.call(this, n), this.requestUpdate(t, c, o);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? ct;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const t = Rt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const i = this.properties, o = [...Mt(i), ...Nt(i)];
      for (const r of o) this.createProperty(r, i[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [o, r] of i) this.elementProperties.set(o, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, o] of this.elementProperties) {
      const r = this._$Eu(i, o);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const o = new Set(t.flat(1 / 0).reverse());
      for (const r of o) i.unshift(nt(r));
    } else t !== void 0 && i.push(nt(t));
    return i;
  }
  static _$Eu(t, i) {
    const o = i.attribute;
    return o === !1 ? void 0 : typeof o == "string" ? o : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const o of i.keys()) this.hasOwnProperty(o) && (t.set(o, this[o]), delete this[o]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return zt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, i, o) {
    this._$AK(t, o);
  }
  _$ET(t, i) {
    const o = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, o);
    if (r !== void 0 && o.reflect === !0) {
      const s = (o.converter?.toAttribute !== void 0 ? o.converter : j).toAttribute(i, o.type);
      this._$Em = t, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const o = this.constructor, r = o._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const s = o.getPropertyOptions(r), n = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : j;
      this._$Em = r;
      const c = n.fromAttribute(i, s.type);
      this[r] = c ?? this._$Ej?.get(r) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, i, o, r = !1, s) {
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (s = this[t]), o ??= n.getPropertyOptions(t), !((o.hasChanged ?? G)(s, i) || o.useDefault && o.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, o)))) return;
      this.C(t, i, o);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: o, reflect: r, wrapped: s }, n) {
    o && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? i ?? this[t]), s !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || o || (i = void 0), this._$AL.set(t, i)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, s] of this._$Ep) this[r] = s;
        this._$Ep = void 0;
      }
      const o = this.constructor.elementProperties;
      if (o.size > 0) for (const [r, s] of o) {
        const { wrapped: n } = s, c = this[r];
        n !== !0 || this._$AL.has(r) || c === void 0 || this.C(r, void 0, s, c);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), this._$EO?.forEach((o) => o.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (o) {
      throw t = !1, this._$EM(), o;
    }
    t && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
k.elementStyles = [], k.shadowRootOptions = { mode: "open" }, k[U("elementProperties")] = /* @__PURE__ */ new Map(), k[U("finalized")] = /* @__PURE__ */ new Map(), Dt?.({ ReactiveElement: k }), (I.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X = globalThis, lt = (e) => e, L = X.trustedTypes, ht = L ? L.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, yt = "$lit$", $ = `lit$${Math.random().toFixed(9).slice(2)}$`, _t = "?" + $, jt = `<${_t}>`, w = document, T = () => w.createComment(""), M = (e) => e === null || typeof e != "object" && typeof e != "function", Y = Array.isArray, Lt = (e) => Y(e) || typeof e?.[Symbol.iterator] == "function", V = `[ 	
\f\r]`, z = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, dt = /-->/g, pt = />/g, y = RegExp(`>|${V}(?:([^\\s"'>=/]+)(${V}*=${V}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ut = /'/g, ft = /"/g, xt = /^(?:script|style|textarea|title)$/i, It = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), m = It(1), A = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), gt = /* @__PURE__ */ new WeakMap(), x = w.createTreeWalker(w, 129);
function wt(e, t) {
  if (!Y(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ht !== void 0 ? ht.createHTML(t) : t;
}
const Bt = (e, t) => {
  const i = e.length - 1, o = [];
  let r, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = z;
  for (let c = 0; c < i; c++) {
    const a = e[c];
    let d, f, l = -1, p = 0;
    for (; p < a.length && (n.lastIndex = p, f = n.exec(a), f !== null); ) p = n.lastIndex, n === z ? f[1] === "!--" ? n = dt : f[1] !== void 0 ? n = pt : f[2] !== void 0 ? (xt.test(f[2]) && (r = RegExp("</" + f[2], "g")), n = y) : f[3] !== void 0 && (n = y) : n === y ? f[0] === ">" ? (n = r ?? z, l = -1) : f[1] === void 0 ? l = -2 : (l = n.lastIndex - f[2].length, d = f[1], n = f[3] === void 0 ? y : f[3] === '"' ? ft : ut) : n === ft || n === ut ? n = y : n === dt || n === pt ? n = z : (n = y, r = void 0);
    const h = n === y && e[c + 1].startsWith("/>") ? " " : "";
    s += n === z ? a + jt : l >= 0 ? (o.push(d), a.slice(0, l) + yt + a.slice(l) + $ + h) : a + $ + (l === -2 ? c : h);
  }
  return [wt(e, s + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), o];
};
class N {
  constructor({ strings: t, _$litType$: i }, o) {
    let r;
    this.parts = [];
    let s = 0, n = 0;
    const c = t.length - 1, a = this.parts, [d, f] = Bt(t, i);
    if (this.el = N.createElement(d, o), x.currentNode = this.el.content, i === 2 || i === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (r = x.nextNode()) !== null && a.length < c; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const l of r.getAttributeNames()) if (l.endsWith(yt)) {
          const p = f[n++], h = r.getAttribute(l).split($), g = /([.?@])?(.*)/.exec(p);
          a.push({ type: 1, index: s, name: g[2], strings: h, ctor: g[1] === "." ? qt : g[1] === "?" ? Vt : g[1] === "@" ? Wt : B }), r.removeAttribute(l);
        } else l.startsWith($) && (a.push({ type: 6, index: s }), r.removeAttribute(l));
        if (xt.test(r.tagName)) {
          const l = r.textContent.split($), p = l.length - 1;
          if (p > 0) {
            r.textContent = L ? L.emptyScript : "";
            for (let h = 0; h < p; h++) r.append(l[h], T()), x.nextNode(), a.push({ type: 2, index: ++s });
            r.append(l[p], T());
          }
        }
      } else if (r.nodeType === 8) if (r.data === _t) a.push({ type: 2, index: s });
      else {
        let l = -1;
        for (; (l = r.data.indexOf($, l + 1)) !== -1; ) a.push({ type: 7, index: s }), l += $.length - 1;
      }
      s++;
    }
  }
  static createElement(t, i) {
    const o = w.createElement("template");
    return o.innerHTML = t, o;
  }
}
function E(e, t, i = e, o) {
  if (t === A) return t;
  let r = o !== void 0 ? i._$Co?.[o] : i._$Cl;
  const s = M(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== s && (r?._$AO?.(!1), s === void 0 ? r = void 0 : (r = new s(e), r._$AT(e, i, o)), o !== void 0 ? (i._$Co ??= [])[o] = r : i._$Cl = r), r !== void 0 && (t = E(e, r._$AS(e, t.values), r, o)), t;
}
class Ft {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: i }, parts: o } = this._$AD, r = (t?.creationScope ?? w).importNode(i, !0);
    x.currentNode = r;
    let s = x.nextNode(), n = 0, c = 0, a = o[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let d;
        a.type === 2 ? d = new P(s, s.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(s, a.name, a.strings, this, t) : a.type === 6 && (d = new Kt(s, this, t)), this._$AV.push(d), a = o[++c];
      }
      n !== a?.index && (s = x.nextNode(), n++);
    }
    return x.currentNode = w, r;
  }
  p(t) {
    let i = 0;
    for (const o of this._$AV) o !== void 0 && (o.strings !== void 0 ? (o._$AI(t, o, i), i += o.strings.length - 2) : o._$AI(t[i])), i++;
  }
}
class P {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, o, r) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = o, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && t?.nodeType === 11 && (t = i.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    t = E(this, t, i), M(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== A && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Lt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && M(this._$AH) ? this._$AA.nextSibling.data = t : this.T(w.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: o } = t, r = typeof o == "number" ? this._$AC(t) : (o.el === void 0 && (o.el = N.createElement(wt(o.h, o.h[0]), this.options)), o);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const s = new Ft(r, this), n = s.u(this.options);
      s.p(i), this.T(n), this._$AH = s;
    }
  }
  _$AC(t) {
    let i = gt.get(t.strings);
    return i === void 0 && gt.set(t.strings, i = new N(t)), i;
  }
  k(t) {
    Y(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let o, r = 0;
    for (const s of t) r === i.length ? i.push(o = new P(this.O(T()), this.O(T()), this, this.options)) : o = i[r], o._$AI(s), r++;
    r < i.length && (this._$AR(o && o._$AB.nextSibling, r), i.length = r);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const o = lt(t).nextSibling;
      lt(t).remove(), t = o;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class B {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, o, r, s) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = i, this._$AM = r, this.options = s, o.length > 2 || o[0] !== "" || o[1] !== "" ? (this._$AH = Array(o.length - 1).fill(new String()), this.strings = o) : this._$AH = u;
  }
  _$AI(t, i = this, o, r) {
    const s = this.strings;
    let n = !1;
    if (s === void 0) t = E(this, t, i, 0), n = !M(t) || t !== this._$AH && t !== A, n && (this._$AH = t);
    else {
      const c = t;
      let a, d;
      for (t = s[0], a = 0; a < s.length - 1; a++) d = E(this, c[o + a], i, a), d === A && (d = this._$AH[a]), n ||= !M(d) || d !== this._$AH[a], d === u ? t = u : t !== u && (t += (d ?? "") + s[a + 1]), this._$AH[a] = d;
    }
    n && !r && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class qt extends B {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Vt extends B {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Wt extends B {
  constructor(t, i, o, r, s) {
    super(t, i, o, r, s), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = E(this, t, i, 0) ?? u) === A) return;
    const o = this._$AH, r = t === u && o !== u || t.capture !== o.capture || t.once !== o.once || t.passive !== o.passive, s = t !== u && (o === u || r);
    r && this.element.removeEventListener(this.name, this, o), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Kt {
  constructor(t, i, o) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = o;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    E(this, t);
  }
}
const Zt = { I: P }, Jt = X.litHtmlPolyfillSupport;
Jt?.(N, P), (X.litHtmlVersions ??= []).push("3.3.3");
const Qt = (e, t, i) => {
  const o = i?.renderBefore ?? t;
  let r = o._$litPart$;
  if (r === void 0) {
    const s = i?.renderBefore ?? null;
    o._$litPart$ = r = new P(t.insertBefore(T(), s), s, void 0, i ?? {});
  }
  return r._$AI(e), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const tt = globalThis;
let S = class extends k {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Qt(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return A;
  }
};
S._$litElement$ = !0, S.finalized = !0, tt.litElementHydrateSupport?.({ LitElement: S });
const Gt = tt.litElementPolyfillSupport;
Gt?.({ LitElement: S });
(tt.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const At = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Xt = { attribute: !0, type: String, converter: j, reflect: !1, hasChanged: G }, Yt = (e = Xt, t, i) => {
  const { kind: o, metadata: r } = i;
  let s = globalThis.litPropertyMetadata.get(r);
  if (s === void 0 && globalThis.litPropertyMetadata.set(r, s = /* @__PURE__ */ new Map()), o === "setter" && ((e = Object.create(e)).wrapped = !0), s.set(i.name, e), o === "accessor") {
    const { name: n } = i;
    return { set(c) {
      const a = t.get.call(this);
      t.set.call(this, c), this.requestUpdate(n, a, e, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(n, void 0, e, c), c;
    } };
  }
  if (o === "setter") {
    const { name: n } = i;
    return function(c) {
      const a = this[n];
      t.call(this, c), this.requestUpdate(n, a, e, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + o);
};
function et(e) {
  return (t, i) => typeof i == "object" ? Yt(e, t, i) : ((o, r, s) => {
    const n = r.hasOwnProperty(s);
    return r.constructor.createProperty(s, o), n ? Object.getOwnPropertyDescriptor(r, s) : void 0;
  })(e, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function it(e) {
  return et({ ...e, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = { CHILD: 2 }, ee = (e) => (...t) => ({ _$litDirective$: e, values: t });
let ie = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, i, o) {
    this._$Ct = t, this._$AM = i, this._$Ci = o;
  }
  _$AS(t, i) {
    return this.update(t, i);
  }
  update(t, i) {
    return this.render(...i);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { I: oe } = Zt, mt = (e) => e, vt = () => document.createComment(""), O = (e, t, i) => {
  const o = e._$AA.parentNode, r = t === void 0 ? e._$AB : t._$AA;
  if (i === void 0) {
    const s = o.insertBefore(vt(), r), n = o.insertBefore(vt(), r);
    i = new oe(s, n, e, e.options);
  } else {
    const s = i._$AB.nextSibling, n = i._$AM, c = n !== e;
    if (c) {
      let a;
      i._$AQ?.(e), i._$AM = e, i._$AP !== void 0 && (a = e._$AU) !== n._$AU && i._$AP(a);
    }
    if (s !== r || c) {
      let a = i._$AA;
      for (; a !== s; ) {
        const d = mt(a).nextSibling;
        mt(o).insertBefore(a, r), a = d;
      }
    }
  }
  return i;
}, _ = (e, t, i = e) => (e._$AI(t, i), e), re = {}, se = (e, t = re) => e._$AH = t, ne = (e) => e._$AH, W = (e) => {
  e._$AR(), e._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const bt = (e, t, i) => {
  const o = /* @__PURE__ */ new Map();
  for (let r = t; r <= i; r++) o.set(e[r], r);
  return o;
}, K = ee(class extends ie {
  constructor(e) {
    if (super(e), e.type !== te.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(e, t, i) {
    let o;
    i === void 0 ? i = t : t !== void 0 && (o = t);
    const r = [], s = [];
    let n = 0;
    for (const c of e) r[n] = o ? o(c, n) : n, s[n] = i(c, n), n++;
    return { values: s, keys: r };
  }
  render(e, t, i) {
    return this.dt(e, t, i).values;
  }
  update(e, [t, i, o]) {
    const r = ne(e), { values: s, keys: n } = this.dt(t, i, o);
    if (!Array.isArray(r)) return this.ut = n, s;
    const c = this.ut ??= [], a = [];
    let d, f, l = 0, p = r.length - 1, h = 0, g = s.length - 1;
    for (; l <= p && h <= g; ) if (r[l] === null) l++;
    else if (r[p] === null) p--;
    else if (c[l] === n[h]) a[h] = _(r[l], s[h]), l++, h++;
    else if (c[p] === n[g]) a[g] = _(r[p], s[g]), p--, g--;
    else if (c[l] === n[g]) a[g] = _(r[l], s[g]), O(e, a[g + 1], r[l]), l++, g--;
    else if (c[p] === n[h]) a[h] = _(r[p], s[h]), O(e, r[l], r[p]), p--, h++;
    else if (d === void 0 && (d = bt(n, h, g), f = bt(c, l, p)), d.has(c[l])) if (d.has(c[p])) {
      const v = f.get(n[h]), q = v !== void 0 ? r[v] : null;
      if (q === null) {
        const rt = O(e, r[l]);
        _(rt, s[h]), a[h] = rt;
      } else a[h] = _(q, s[h]), O(e, r[l], q), r[v] = null;
      h++;
    } else W(r[p]), p--;
    else W(r[l]), l++;
    for (; h <= g; ) {
      const v = O(e, a[g + 1]);
      _(v, s[h]), a[h++] = v;
    }
    for (; l <= p; ) {
      const v = r[l++];
      v !== null && W(v);
    }
    return this.ut = n, se(e, a), A;
  }
}), kt = Q`
  :host {
    /* Mirrors hui-tile-card: inactive by default, state colour when active. */
    --tile-color: var(--state-inactive-color, #9e9e9e);

    --ha-space-1: var(--ha-space-1, 4px);
    --radius-md: var(--ha-border-radius-md, 8px);
    --radius-lg: var(--ha-border-radius-lg, 12px);
    --radius-pill: var(--ha-border-radius-pill, 9999px);
    --duration: 180ms;
  }

  ha-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ----------------------------------------------------- tile content row -- */
  .tile {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 10px;
    min-height: 56px;
    gap: 10px;
    box-sizing: border-box;
  }

  .tile-icon {
    position: relative;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-pill);
    overflow: hidden;
    color: var(--tile-color);
    --mdc-icon-size: 24px;
    transition:
      transform var(--duration) ease-in-out,
      color var(--duration) ease-in-out;
  }
  .tile-icon::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--tile-color);
    opacity: 0.2;
    transition:
      background-color var(--duration) ease-in-out,
      opacity var(--duration) ease-in-out;
  }
  .tile-icon ha-icon {
    position: relative;
    display: flex;
  }
  .tile-icon.interactive {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .tile-icon.interactive:hover::before {
    opacity: 0.35;
  }
  .tile-icon.interactive:active {
    transform: scale(1.2);
  }
  .tile-icon:focus {
    outline: none;
  }
  .tile-icon:focus-visible {
    box-shadow: 0 0 0 2px var(--tile-color);
  }
  /* hui-tile-card pulses the icon for lock.jammed. */
  .tile-icon.pulse {
    animation: pulse 1s infinite;
  }
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .tile-icon.pulse {
      animation: none;
    }
    .spin {
      animation: none;
    }
  }

  .tile-info {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
  /* ha-tile-info makes these flex rows and puts the ellipsis on an inner span;
     centring the line box this way avoids the half-pixel drift you get from
     relying on line-height alone. */
  .primary,
  .secondary {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
  }
  .primary > span,
  .secondary > span {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .primary {
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: var(--ha-line-height-normal, 1.6);
    letter-spacing: 0.1px;
    color: var(--primary-text-color);
  }
  .secondary {
    font-size: var(--ha-font-size-s, 12px);
    font-weight: var(--ha-font-weight-normal, 400);
    line-height: var(--ha-line-height-condensed, 1.2);
    letter-spacing: 0.4px;
    color: var(--secondary-text-color);
  }
  .primary.muted {
    color: var(--secondary-text-color);
    font-style: italic;
  }
  .primary.code {
    font-family: var(--ha-font-family-code, ui-monospace, SFMono-Regular, monospace);
    letter-spacing: 0.18em;
  }
  .strike {
    text-decoration: line-through;
    opacity: 0.6;
  }

  /* ------------------------------------------------- control buttons ------- */
  .features {
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 0 var(--ha-space-3, 12px) var(--ha-space-3, 12px);
  }
  .control-button {
    position: relative;
    overflow: hidden;
    flex: 1 1 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 40px;
    padding: 8px;
    margin: 0;
    border: none;
    border-radius: var(--radius-md);
    background: none;
    outline: none;
    box-sizing: border-box;
    cursor: pointer;
    font: inherit;
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--primary-text-color);
    --mdc-icon-size: 20px;
    transition:
      box-shadow var(--duration) ease-in-out,
      color var(--duration) ease-in-out;
  }
  .control-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--disabled-color, #9e9e9e);
    opacity: 0.2;
    transition:
      background-color var(--duration) ease-in-out,
      opacity var(--duration) ease-in-out;
  }
  .control-button > * {
    position: relative;
  }
  .control-button:hover:not(:disabled)::before {
    opacity: 0.3;
  }
  .control-button:focus-visible {
    box-shadow: 0 0 0 2px var(--tile-color);
  }
  .control-button:disabled {
    cursor: not-allowed;
    color: var(--disabled-text-color);
  }
  .control-button:disabled::before {
    opacity: 0.1;
  }
  .control-button.accent {
    color: var(--primary-color);
  }
  .control-button.accent::before {
    background-color: var(--primary-color);
  }
  .control-button.destructive {
    color: var(--error-color, #db4437);
  }
  .control-button.destructive::before {
    background-color: var(--error-color, #db4437);
  }
  .control-button.wide {
    width: 100%;
  }

  /* Square icon-only variant of a control button. */
  .icon-button {
    position: relative;
    overflow: hidden;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 8px;
    border: none;
    border-radius: var(--radius-md);
    background: none;
    outline: none;
    box-sizing: border-box;
    cursor: pointer;
    color: var(--secondary-text-color);
    --mdc-icon-size: 22px;
    transition:
      box-shadow var(--duration) ease-in-out,
      color var(--duration) ease-in-out;
  }
  .icon-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--disabled-color, #9e9e9e);
    opacity: 0;
    transition: opacity var(--duration) ease-in-out;
  }
  .icon-button ha-icon {
    position: relative;
  }
  .icon-button:hover:not(:disabled) {
    color: var(--primary-text-color);
  }
  .icon-button:hover:not(:disabled)::before {
    opacity: 0.2;
  }
  .icon-button:focus-visible {
    box-shadow: 0 0 0 2px var(--tile-color);
  }
  .icon-button:disabled {
    cursor: not-allowed;
    color: var(--disabled-text-color);
  }
  .icon-button.danger:hover:not(:disabled) {
    color: var(--error-color, #db4437);
  }
  .spin {
    animation: spin 900ms linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ------------------------------------------------------------ sections -- */
  .section-head {
    display: flex;
    align-items: center;
    min-height: 40px;
    gap: var(--ha-space-2, 8px);
    padding: 0 var(--ha-space-3, 12px);
    font-size: var(--ha-font-size-s, 12px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: var(--ha-line-height-condensed, 1.2);
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .section-head .count {
    text-transform: none;
    letter-spacing: 0.4px;
    font-weight: var(--ha-font-weight-normal, 400);
  }
  .section-head .grow {
    flex: 1 1 auto;
  }
  .section-head .icon-button {
    width: 32px;
    height: 32px;
    --mdc-icon-size: 20px;
  }

  ul.list {
    list-style: none;
    margin: 0;
    padding: 0 var(--ha-space-2, 8px);
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-1, 4px);
  }
  li.row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    min-height: 56px;
    padding: 0 var(--ha-space-1, 4px) 0 10px;
    border-radius: var(--radius-lg);
    box-sizing: border-box;
    /* Neutral surface on purpose: --tile-color signals entity state, and a list
       row is not the entity. Tinting every row swamps the card. */
    background-color: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.04);
  }
  li.row.inactive .primary {
    text-decoration: line-through;
    opacity: 0.6;
  }
  li.row.empty {
    background-color: transparent;
    border: 1px dashed rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.14);
  }

  /* Slot/user number, styled as a tile icon. */
  .slot-badge {
    position: relative;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    min-width: 36px;
    height: 36px;
    padding: 0 var(--ha-space-2, 8px);
    border-radius: var(--radius-pill);
    overflow: hidden;
    box-sizing: border-box;
    font-size: var(--ha-font-size-s, 12px);
    font-weight: var(--ha-font-weight-medium, 500);
    font-variant-numeric: tabular-nums;
    color: var(--secondary-text-color);
  }
  .slot-badge::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--disabled-color, #9e9e9e);
    opacity: 0.2;
  }
  /* Opt in to state colour where a badge really does represent the entity. */
  .slot-badge.accent {
    color: var(--tile-color);
  }
  .slot-badge.accent::before {
    background-color: var(--tile-color);
  }
  .slot-badge span {
    position: relative;
  }

  /* ---------------------------------------------------------------- chips -- */
  .chips {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ha-space-1, 4px);
    margin-top: 2px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    height: 20px;
    padding: 0 var(--ha-space-2, 8px);
    border-radius: var(--radius-pill);
    font-size: var(--ha-font-size-xs, 10px);
    font-weight: var(--ha-font-weight-medium, 500);
    letter-spacing: 0.4px;
    color: var(--secondary-text-color);
    background-color: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.08);
    --mdc-icon-size: 13px;
  }
  .chip.accent {
    color: var(--primary-color);
    background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.16);
  }
  .chip.warn {
    color: var(--error-color, #db4437);
    background-color: rgba(219, 68, 55, 0.16);
  }
  .chip button {
    display: grid;
    place-items: center;
    margin: 0 -3px 0 1px;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    --mdc-icon-size: 13px;
  }

  /* ----------------------------------------------------------------- form -- */
  /* A form rendered inline inside a list, directly under its row. */
  li.form-host {
    list-style: none;
    display: block;
  }
  li.form-host .form {
    margin: 0;
  }
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-3, 12px);
    margin: 0 var(--ha-space-2, 8px);
    padding: var(--ha-space-3, 12px);
    border-radius: var(--radius-lg);
    background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
  }
  .form-title {
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: var(--ha-line-height-normal, 1.6);
    letter-spacing: 0.1px;
    color: var(--primary-text-color);
  }
  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--ha-space-3, 12px);
  }
  label.field {
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-1, 4px);
    font-size: var(--ha-font-size-s, 12px);
    letter-spacing: 0.4px;
    color: var(--secondary-text-color);
  }
  label.field input,
  label.field select {
    font: inherit;
    font-size: var(--ha-font-size-m, 14px);
    height: 40px;
    padding: 0 10px;
    border-radius: var(--radius-md);
    box-sizing: border-box;
    color: var(--primary-text-color);
    background-color: var(--card-background-color, #fff);
    border: 1px solid rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.2);
    transition: box-shadow var(--duration) ease-in-out;
  }
  label.field input:focus,
  label.field select:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 2px var(--primary-color);
  }
  label.check {
    flex-direction: row;
    align-items: center;
    gap: var(--ha-space-2, 8px);
    align-self: end;
    height: 40px;
    font-size: var(--ha-font-size-m, 14px);
    color: var(--primary-text-color);
  }
  .form-actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 12px;
  }
  .form-actions .control-button {
    flex: 0 0 auto;
    min-width: 88px;
  }
  .hint {
    font-size: var(--ha-font-size-s, 12px);
    line-height: var(--ha-line-height-condensed, 1.2);
    letter-spacing: 0.4px;
    color: var(--secondary-text-color);
  }

  /* -------------------------------------------------------------- notices -- */
  .notice {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: var(--ha-space-2, 8px);
    margin: 0 var(--ha-space-2, 8px);
    padding: 10px var(--ha-space-3, 12px);
    border-radius: var(--radius-lg);
    font-size: var(--ha-font-size-s, 12px);
    line-height: var(--ha-line-height-condensed, 1.2);
    letter-spacing: 0.4px;
    --mdc-icon-size: 18px;
  }
  .notice.error {
    color: var(--error-color, #db4437);
    background-color: rgba(219, 68, 55, 0.12);
  }
  .notice.warn {
    color: var(--warning-color, #ff9800);
    background-color: rgba(255, 152, 0, 0.12);
  }
  .notice ha-icon {
    flex: 0 0 auto;
  }
  .notice .grow {
    flex: 1 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .empty-state {
    padding: var(--ha-space-4, 16px) var(--ha-space-3, 12px);
    text-align: center;
    font-size: var(--ha-font-size-m, 14px);
    line-height: var(--ha-line-height-normal, 1.6);
    letter-spacing: 0.1px;
    color: var(--secondary-text-color);
  }

  /* Whichever element ends the card supplies the bottom breathing room. */
  .tail,
  ul.list:last-child,
  .empty-state:last-child,
  .form:last-child,
  .notice:last-child {
    margin-bottom: var(--ha-space-3, 12px);
  }

  .skeleton {
    height: 56px;
    border-radius: var(--radius-lg);
    background: linear-gradient(
      90deg,
      rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05) 25%,
      rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.1) 37%,
      rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.3s ease infinite;
  }
  @keyframes shimmer {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .skeleton {
      animation: none;
    }
  }
`, St = (e, t, i) => {
  e.dispatchEvent(
    new CustomEvent(t, { detail: i, bubbles: !0, composed: !0 })
  );
}, ae = (e, t) => St(e, "hass-more-info", { entityId: t }), ce = /* @__PURE__ */ new Set(["unavailable", "unknown", "none", ""]), b = (e) => {
  if (e == null || e === "") return null;
  const t = typeof e == "number" ? e : Number(e);
  return Number.isFinite(t) ? t : null;
}, le = (e) => !!(e?.entity_id.startsWith("sensor.") && e.attributes.device_class === "monetary"), Et = (e) => Object.keys(e.states).filter((t) => le(e.states[t])).sort((t, i) => {
  const o = (r) => r.startsWith("sensor.polr_stocks_") ? 0 : 1;
  return o(t) - o(i) || t.localeCompare(i);
}), he = (e, t) => {
  const i = t.attributes.symbol;
  return typeof i == "string" && i.trim() ? i.trim().toUpperCase() : e.slice(e.indexOf(".") + 1).replace(/^polr_stocks_/, "").toUpperCase();
}, D = (e, t) => {
  const i = e.states[t];
  if (!i) return;
  const o = !ce.has(String(i.state).toLowerCase()), r = o ? b(i.state) : null, s = i.attributes;
  return {
    entity: t,
    symbol: he(t, i),
    price: r,
    currency: s.unit_of_measurement ?? "USD",
    change: b(s.change),
    changePercent: b(s.change_percent),
    previousClose: b(s.previous_close),
    open: b(s.open),
    high: b(s.high),
    low: b(s.low),
    volume: b(s.volume),
    priceSource: s.price_source ?? "",
    lastTradeAt: s.last_trade_at,
    available: o && r !== null
  };
}, de = (e) => {
  if (!e?.available) return "unknown";
  const t = e.changePercent ?? e.change;
  return t === null ? "unknown" : t > 0 ? "up" : t < 0 ? "down" : "flat";
}, pe = {
  up: "mdi:trending-up",
  down: "mdi:trending-down",
  flat: "mdi:trending-neutral",
  unknown: "mdi:help-circle-outline"
}, Ct = (e, t = "USD", i = "en") => {
  if (e === null) return "—";
  try {
    return new Intl.NumberFormat(i, {
      style: "currency",
      currency: t,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(e);
  } catch {
    return `${e.toFixed(2)} ${t}`;
  }
}, ue = (e, t = "USD", i = "en") => e === null ? "—" : `${e > 0 ? "+" : e < 0 ? "−" : ""}${Ct(Math.abs(e), t, i)}`, fe = (e, t = "en") => {
  if (e === null) return "—";
  const i = e > 0 ? "+" : e < 0 ? "−" : "", o = new Intl.NumberFormat(t, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(e));
  return `${i}${o}%`;
}, ge = (e, t = "en") => e === null ? "—" : new Intl.NumberFormat(t, {
  notation: "compact",
  maximumFractionDigits: 1
}).format(e), me = (e) => !!(e?.available && e.priceSource && e.priceSource !== "latest_trade");
var ve = Object.defineProperty, be = Object.getOwnPropertyDescriptor, F = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? be(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (r = (o ? n(t, i, r) : n(r)) || r);
  return o && r && ve(t, i, r), r;
};
const $e = [
  { name: "title", selector: { text: {} } },
  {
    name: "secondary",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "both", label: "Day change + volume" },
          { value: "change", label: "Day change" },
          { value: "session", label: "Volume" },
          { value: "none", label: "Nothing" }
        ]
      }
    }
  },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "show_change_amount", selector: { boolean: {} } },
      { name: "show_change_percent", selector: { boolean: {} } },
      { name: "color_change", selector: { boolean: {} } },
      { name: "compact", selector: { boolean: {} } }
    ]
  }
], ye = {
  title: "Section title",
  secondary: "Secondary line",
  show_change_amount: "Show change amount",
  show_change_percent: "Show change percent",
  color_change: "Colour gains and losses",
  compact: "Compact rows"
};
let C = class extends S {
  constructor() {
    super(...arguments), this._filter = "", this._computeLabel = (e) => ye[e.name] ?? e.name;
  }
  setConfig(e) {
    this._config = e;
  }
  /** Configured tickers, normalised to objects for editing. */
  get _tickers() {
    return (this._config?.tickers ?? []).map(
      (e) => typeof e == "string" ? { entity: e } : { ...e }
    );
  }
  _emit(e) {
    St(this, "config-changed", { config: e });
  }
  /** Tickers with no per-ticker options collapse back to bare entity ids. */
  _setTickers(e) {
    this._emit({
      ...this._config,
      tickers: e.map(
        (t) => Object.keys(t).length === 1 ? t.entity : t
      )
    });
  }
  _formChanged(e) {
    e.stopPropagation(), this._emit({
      ...this._config,
      ...e.detail.value,
      tickers: this._config.tickers ?? []
    });
  }
  _add(e) {
    this._setTickers([...this._tickers, { entity: e }]);
  }
  _remove(e) {
    const t = this._tickers;
    t.splice(e, 1), this._setTickers(t);
  }
  _move(e, t) {
    const i = this._tickers, o = e + t;
    o < 0 || o >= i.length || ([i[e], i[o]] = [i[o], i[e]], this._setTickers(i));
  }
  render() {
    if (!this.hass || !this._config) return u;
    const e = this._tickers, t = new Set(e.map((r) => r.entity)), i = this._filter.trim().toLowerCase(), o = Et(this.hass).filter((r) => !t.has(r)).filter((r) => i ? `${D(this.hass, r)?.symbol} ${r}`.toLowerCase().includes(i) : !0);
    return m`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${$e}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._formChanged}
      ></ha-form>

      <div class="section-head">
        <span class="grow">Tickers shown</span>
        <span class="count">${e.length}</span>
      </div>
      ${e.length ? m`
            <ul class="list">
              ${K(
      e,
      (r) => r.entity,
      (r, s) => this._renderSelected(r, s, e.length)
    )}
            </ul>
          ` : m`<div class="empty-state">
            Nothing selected yet — add tickers from the list below.
          </div>`}

      <div class="section-head">
        <span class="grow">Available tickers</span>
        <span class="count">${o.length}</span>
      </div>
      <div class="filter">
        <ha-icon icon="mdi:magnify"></ha-icon>
        <input
          type="search"
          placeholder="Filter tickers"
          .value=${this._filter}
          @input=${(r) => this._filter = r.target.value}
        />
      </div>
      ${o.length ? m`
            <ul class="list">
              ${K(
      o,
      (r) => r,
      (r) => this._renderAvailable(r)
    )}
            </ul>
          ` : m`<div class="empty-state">
            ${i ? "No tickers match that filter." : "No further price sensors found. Tickers appear here once the PoLR Stocks integration is set up."}
          </div>`}
    `;
  }
  _renderSelected(e, t, i) {
    const o = D(this.hass, e.entity);
    return m`
      <li class="row">
        <div class="tile-icon">
          <ha-icon .icon=${e.icon ?? "mdi:chart-line"}></ha-icon>
        </div>
        <div class="tile-info">
          <div class="primary">
            <span>${e.name ?? o?.symbol ?? e.entity}</span>
          </div>
          <div class="secondary">
            <span>${o ? e.entity : "Entity not found"}</span>
          </div>
        </div>
        <button
          class="icon-button"
          title="Move up"
          .disabled=${t === 0}
          @click=${() => this._move(t, -1)}
        >
          <ha-icon icon="mdi:arrow-up"></ha-icon>
        </button>
        <button
          class="icon-button"
          title="Move down"
          .disabled=${t === i - 1}
          @click=${() => this._move(t, 1)}
        >
          <ha-icon icon="mdi:arrow-down"></ha-icon>
        </button>
        <button class="icon-button danger" title="Remove" @click=${() => this._remove(t)}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </li>
    `;
  }
  _renderAvailable(e) {
    const t = D(this.hass, e);
    return m`
      <li class="row">
        <div class="tile-icon"><ha-icon icon="mdi:chart-line"></ha-icon></div>
        <div class="tile-info">
          <div class="primary"><span>${t?.symbol ?? e}</span></div>
          <div class="secondary"><span>${e}</span></div>
        </div>
        <button class="icon-button" title="Add" @click=${() => this._add(e)}>
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </li>
    `;
  }
};
C.styles = [
  kt,
  Q`
      :host {
        display: block;
      }
      ha-form {
        display: block;
        margin-bottom: var(--ha-space-2, 8px);
      }
      ul.list {
        padding: 0;
      }
      .filter {
        display: flex;
        align-items: center;
        gap: var(--ha-space-2, 8px);
        height: 40px;
        margin-bottom: var(--ha-space-2, 8px);
        padding: 0 var(--ha-space-3, 12px);
        border-radius: var(--radius-md);
        color: var(--secondary-text-color);
        background-color: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
        --mdc-icon-size: 18px;
      }
      .filter input {
        flex: 1 1 auto;
        min-width: 0;
        border: none;
        outline: none;
        background: none;
        font-family: inherit;
        font-size: var(--ha-font-size-m, 14px);
        color: var(--primary-text-color);
      }
      /* The kit sizes icon buttons for a card; an editor row is tighter. */
      .icon-button {
        width: 36px;
        height: 36px;
        --mdc-icon-size: 20px;
      }
    `
];
F([
  et({ attribute: !1 })
], C.prototype, "hass", 2);
F([
  it()
], C.prototype, "_config", 2);
F([
  it()
], C.prototype, "_filter", 2);
C = F([
  At("polr-stocks-editor")
], C);
var _e = Object.defineProperty, xe = Object.getOwnPropertyDescriptor, ot = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? xe(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (r = (o ? n(t, i, r) : n(r)) || r);
  return o && r && _e(t, i, r), r;
};
const we = "0.1.0";
console.info(
  `%c POLR-STOCKS %c v${we} `,
  "color:#fff;background:#3f51b5;font-weight:700",
  "color:#3f51b5;background:#fff;font-weight:700"
);
const Ae = (e) => e.filter((i) => i !== "").flatMap((i, o) => o ? [" · ", i] : [i]);
let R = class extends S {
  static async getConfigElement() {
    return document.createElement("polr-stocks-editor");
  }
  static getStubConfig(e) {
    return { tickers: Et(e).slice(0, 5) };
  }
  setConfig(e) {
    if (!e) throw new Error("polr-stocks: config is required");
    if (e.tickers !== void 0 && !Array.isArray(e.tickers))
      throw new Error("polr-stocks: 'tickers' must be a list");
    const t = (e.tickers ?? []).map((i) => {
      const o = typeof i == "string" ? { entity: i } : i;
      if (!o?.entity || typeof o.entity != "string")
        throw new Error("polr-stocks: every ticker needs an 'entity'");
      if (!o.entity.startsWith("sensor."))
        throw new Error(
          `polr-stocks: '${o.entity}' is not a sensor — pick a ticker's price sensor`
        );
      return { ...o };
    });
    this._config = {
      show_change_amount: !0,
      show_change_percent: !0,
      secondary: "both",
      color_change: !0,
      compact: !1,
      ...e,
      tickers: t
    };
  }
  getCardSize() {
    return 1 + (this._config?.tickers.length ?? 3);
  }
  get _language() {
    return this.hass?.locale?.language ?? "en";
  }
  get _rows() {
    const e = this.hass;
    return this._config.tickers.map((t) => ({
      config: t,
      ticker: D(e, t.entity)
    }));
  }
  render() {
    if (!this._config || !this.hass) return u;
    const e = this._rows;
    return e.length ? m`
      <ha-card>
        ${this._config.title ? m`
              <div class="section-head">
                <span class="grow">${this._config.title}</span>
                <span class="count">${e.length}</span>
              </div>
            ` : u}
        <ul class="list">
          ${K(
      e,
      (t) => t.config.entity,
      (t) => this._renderRow(t)
    )}
        </ul>
      </ha-card>
    ` : m`
        <ha-card>
          <div class="empty-state">
            No tickers selected — edit the card and pick the stocks to show.
          </div>
        </ha-card>
      `;
  }
  _renderRow(e) {
    const { config: t, ticker: i } = e;
    if (!i)
      return m`
        <li class="row empty">
          <div class="tile-icon"><ha-icon icon="mdi:help-circle-outline"></ha-icon></div>
          <div class="tile-info">
            <div class="primary muted"><span>${t.name ?? t.entity}</span></div>
            <div class="secondary"><span>Entity not found</span></div>
          </div>
        </li>
      `;
    const o = de(i), r = () => ae(this, t.entity), s = this._secondary(i, o), n = this._config.color_change ? o : "";
    return m`
      <li
        class="row dir-${o}"
        role="button"
        tabindex="0"
        @click=${r}
        @keydown=${(c) => {
      (c.key === "Enter" || c.key === " ") && (c.preventDefault(), r());
    }}
      >
        <div class="tile-icon">
          <ha-icon .icon=${t.icon ?? pe[o]}></ha-icon>
        </div>
        <div class="tile-info">
          <div class="primary"><span>${t.name ?? i.symbol}</span></div>
          ${!this._config.compact && s.length ? m`<div class="secondary"><span>${Ae(s)}</span></div>` : u}
        </div>
        <div class="quote">
          <div class="price ${i.available ? "" : "unavailable"}">
            ${i.available ? Ct(i.price, i.currency, this._language) : "—"}
          </div>
          ${i.available && this._config.compact ? m`<div class="change ${n}">${this._changeText(i)}</div>` : u}
        </div>
      </li>
    `;
  }
  /**
   * The day change, as configured. In compact mode this is the only place the
   * change appears; otherwise it leads the secondary line.
   */
  _changeText(e) {
    const { show_change_amount: t, show_change_percent: i } = this._config, o = [];
    if (t && o.push(ue(e.change, e.currency, this._language)), i) {
      const r = fe(e.changePercent, this._language);
      o.push(t ? `(${r})` : r);
    }
    return o.join(" ");
  }
  /** Secondary-line fragments for a row, before separators are added. */
  _secondary(e, t) {
    if (!e.available) return ["Unavailable"];
    const i = this._config.secondary;
    if (i === "none") return [];
    const o = this._config.color_change ? t : "", r = this._changeText(e), s = r ? m`<span class="change ${o}">${r}</span>` : "", n = me(e) ? m`<span class="derived"
          ><ha-icon icon="mdi:clock-alert-outline"></ha-icon>delayed</span
        >` : "", c = e.volume !== null ? `Vol ${ge(e.volume, this._language)}` : "";
    return i === "change" ? [s, n].filter((a) => a !== "") : i === "session" ? [c, n].filter((a) => a !== "") : [s, c, n].filter((a) => a !== "");
  }
};
R.styles = [
  kt,
  Q`
      /* Trailing price block, weighted like hui-tile-card's primary text. */
      .quote {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        padding: 0 var(--ha-space-2, 8px);
        white-space: nowrap;
      }
      .price {
        font-size: var(--ha-font-size-m, 14px);
        font-weight: var(--ha-font-weight-medium, 500);
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.1px;
        color: var(--primary-text-color);
      }
      .price.unavailable {
        color: var(--secondary-text-color);
      }
      .change {
        font-variant-numeric: tabular-nums;
      }
      .quote .change {
        font-size: var(--ha-font-size-s, 12px);
        line-height: 1.2;
      }
      .change.up {
        color: var(--success-color, #43a047);
      }
      .change.down {
        color: var(--error-color, #db4437);
      }
      /* Trend icon picks up the row's direction. */
      li.row.dir-up .tile-icon {
        color: var(--success-color, #43a047);
      }
      li.row.dir-up .tile-icon::before {
        background-color: var(--success-color, #43a047);
      }
      li.row.dir-down .tile-icon {
        color: var(--error-color, #db4437);
      }
      li.row.dir-down .tile-icon::before {
        background-color: var(--error-color, #db4437);
      }
      .derived {
        color: var(--warning-color, #ffa600);
        --mdc-icon-size: 12px;
      }
      .derived ha-icon {
        vertical-align: -2px;
        margin-inline-end: 2px;
      }
      li.row {
        cursor: pointer;
        transition: background-color var(--duration) ease-in-out;
      }
      li.row:hover {
        background-color: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.08);
      }
      li.row:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
    `
];
ot([
  et({ attribute: !1 })
], R.prototype, "hass", 2);
ot([
  it()
], R.prototype, "_config", 2);
R = ot([
  At("polr-stocks")
], R);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "polr-stocks",
  name: "PoLR Stocks",
  description: "Prices and day change for the tickers you choose.",
  preview: !0
});
export {
  R as PolrStocks
};
//# sourceMappingURL=polr-stocks.js.map
