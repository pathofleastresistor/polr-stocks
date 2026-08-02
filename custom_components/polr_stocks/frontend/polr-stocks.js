/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = globalThis, X = R.ShadowRoot && (R.ShadyCSS === void 0 || R.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, G = Symbol(), nt = /* @__PURE__ */ new WeakMap();
let _t = class {
  constructor(t, i, r) {
    if (this._$cssResult$ = !0, r !== G) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (X && t === void 0) {
      const r = i !== void 0 && i.length === 1;
      r && (t = nt.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && nt.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Pt = (e) => new _t(typeof e == "string" ? e : e + "", void 0, G), Y = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((r, o, s) => r + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + e[s + 1], e[0]);
  return new _t(i, e, G);
}, zt = (e, t) => {
  if (X) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const r = document.createElement("style"), o = R.litNonce;
    o !== void 0 && r.setAttribute("nonce", o), r.textContent = i.cssText, e.appendChild(r);
  }
}, at = X ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const r of t.cssRules) i += r.cssText;
  return Pt(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Tt, defineProperty: Ot, getOwnPropertyDescriptor: Mt, getOwnPropertyNames: Ut, getOwnPropertySymbols: Ht, getPrototypeOf: Nt } = Object, B = globalThis, ct = B.trustedTypes, Rt = ct ? ct.emptyScript : "", Dt = B.reactiveElementPolyfillSupport, M = (e, t) => e, j = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Rt : null;
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
} }, tt = (e, t) => !Tt(e, t), lt = { attribute: !0, type: String, converter: j, reflect: !1, useDefault: !1, hasChanged: tt };
Symbol.metadata ??= Symbol("metadata"), B.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let k = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = lt) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const r = Symbol(), o = this.getPropertyDescriptor(t, r, i);
      o !== void 0 && Ot(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, i, r) {
    const { get: o, set: s } = Mt(this.prototype, t) ?? { get() {
      return this[i];
    }, set(n) {
      this[i] = n;
    } };
    return { get: o, set(n) {
      const c = o?.call(this);
      s?.call(this, n), this.requestUpdate(t, c, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? lt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(M("elementProperties"))) return;
    const t = Nt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(M("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(M("properties"))) {
      const i = this.properties, r = [...Ut(i), ...Ht(i)];
      for (const o of r) this.createProperty(o, i[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [r, o] of i) this.elementProperties.set(r, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, r] of this.elementProperties) {
      const o = this._$Eu(i, r);
      o !== void 0 && this._$Eh.set(o, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const o of r) i.unshift(at(o));
    } else t !== void 0 && i.push(at(t));
    return i;
  }
  static _$Eu(t, i) {
    const r = i.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const r of i.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
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
  attributeChangedCallback(t, i, r) {
    this._$AK(t, r);
  }
  _$ET(t, i) {
    const r = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, r);
    if (o !== void 0 && r.reflect === !0) {
      const s = (r.converter?.toAttribute !== void 0 ? r.converter : j).toAttribute(i, r.type);
      this._$Em = t, s == null ? this.removeAttribute(o) : this.setAttribute(o, s), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const r = this.constructor, o = r._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const s = r.getPropertyOptions(o), n = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : j;
      this._$Em = o;
      const c = n.fromAttribute(i, s.type);
      this[o] = c ?? this._$Ej?.get(o) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, i, r, o = !1, s) {
    if (t !== void 0) {
      const n = this.constructor;
      if (o === !1 && (s = this[t]), r ??= n.getPropertyOptions(t), !((r.hasChanged ?? tt)(s, i) || r.useDefault && r.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, r)))) return;
      this.C(t, i, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: r, reflect: o, wrapped: s }, n) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? i ?? this[t]), s !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (i = void 0), this._$AL.set(t, i)), o === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [o, s] of this._$Ep) this[o] = s;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [o, s] of r) {
        const { wrapped: n } = s, c = this[o];
        n !== !0 || this._$AL.has(o) || c === void 0 || this.C(o, void 0, s, c);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
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
k.elementStyles = [], k.shadowRootOptions = { mode: "open" }, k[M("elementProperties")] = /* @__PURE__ */ new Map(), k[M("finalized")] = /* @__PURE__ */ new Map(), Dt?.({ ReactiveElement: k }), (B.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const et = globalThis, ht = (e) => e, I = et.trustedTypes, dt = I ? I.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, $t = "$lit$", b = `lit$${Math.random().toFixed(9).slice(2)}$`, xt = "?" + b, jt = `<${xt}>`, w = document, U = () => w.createComment(""), H = (e) => e === null || typeof e != "object" && typeof e != "function", it = Array.isArray, It = (e) => it(e) || typeof e?.[Symbol.iterator] == "function", Z = `[ 	
\f\r]`, T = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pt = /-->/g, ut = />/g, y = RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ft = /'/g, gt = /"/g, wt = /^(?:script|style|textarea|title)$/i, Lt = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), m = Lt(1), A = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), mt = /* @__PURE__ */ new WeakMap(), x = w.createTreeWalker(w, 129);
function At(e, t) {
  if (!it(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return dt !== void 0 ? dt.createHTML(t) : t;
}
const Bt = (e, t) => {
  const i = e.length - 1, r = [];
  let o, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = T;
  for (let c = 0; c < i; c++) {
    const a = e[c];
    let d, f, l = -1, p = 0;
    for (; p < a.length && (n.lastIndex = p, f = n.exec(a), f !== null); ) p = n.lastIndex, n === T ? f[1] === "!--" ? n = pt : f[1] !== void 0 ? n = ut : f[2] !== void 0 ? (wt.test(f[2]) && (o = RegExp("</" + f[2], "g")), n = y) : f[3] !== void 0 && (n = y) : n === y ? f[0] === ">" ? (n = o ?? T, l = -1) : f[1] === void 0 ? l = -2 : (l = n.lastIndex - f[2].length, d = f[1], n = f[3] === void 0 ? y : f[3] === '"' ? gt : ft) : n === gt || n === ft ? n = y : n === pt || n === ut ? n = T : (n = y, o = void 0);
    const h = n === y && e[c + 1].startsWith("/>") ? " " : "";
    s += n === T ? a + jt : l >= 0 ? (r.push(d), a.slice(0, l) + $t + a.slice(l) + b + h) : a + b + (l === -2 ? c : h);
  }
  return [At(e, s + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class N {
  constructor({ strings: t, _$litType$: i }, r) {
    let o;
    this.parts = [];
    let s = 0, n = 0;
    const c = t.length - 1, a = this.parts, [d, f] = Bt(t, i);
    if (this.el = N.createElement(d, r), x.currentNode = this.el.content, i === 2 || i === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (o = x.nextNode()) !== null && a.length < c; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const l of o.getAttributeNames()) if (l.endsWith($t)) {
          const p = f[n++], h = o.getAttribute(l).split(b), g = /([.?@])?(.*)/.exec(p);
          a.push({ type: 1, index: s, name: g[2], strings: h, ctor: g[1] === "." ? qt : g[1] === "?" ? Wt : g[1] === "@" ? Vt : F }), o.removeAttribute(l);
        } else l.startsWith(b) && (a.push({ type: 6, index: s }), o.removeAttribute(l));
        if (wt.test(o.tagName)) {
          const l = o.textContent.split(b), p = l.length - 1;
          if (p > 0) {
            o.textContent = I ? I.emptyScript : "";
            for (let h = 0; h < p; h++) o.append(l[h], U()), x.nextNode(), a.push({ type: 2, index: ++s });
            o.append(l[p], U());
          }
        }
      } else if (o.nodeType === 8) if (o.data === xt) a.push({ type: 2, index: s });
      else {
        let l = -1;
        for (; (l = o.data.indexOf(b, l + 1)) !== -1; ) a.push({ type: 7, index: s }), l += b.length - 1;
      }
      s++;
    }
  }
  static createElement(t, i) {
    const r = w.createElement("template");
    return r.innerHTML = t, r;
  }
}
function E(e, t, i = e, r) {
  if (t === A) return t;
  let o = r !== void 0 ? i._$Co?.[r] : i._$Cl;
  const s = H(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== s && (o?._$AO?.(!1), s === void 0 ? o = void 0 : (o = new s(e), o._$AT(e, i, r)), r !== void 0 ? (i._$Co ??= [])[r] = o : i._$Cl = o), o !== void 0 && (t = E(e, o._$AS(e, t.values), o, r)), t;
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
    const { el: { content: i }, parts: r } = this._$AD, o = (t?.creationScope ?? w).importNode(i, !0);
    x.currentNode = o;
    let s = x.nextNode(), n = 0, c = 0, a = r[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let d;
        a.type === 2 ? d = new z(s, s.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(s, a.name, a.strings, this, t) : a.type === 6 && (d = new Kt(s, this, t)), this._$AV.push(d), a = r[++c];
      }
      n !== a?.index && (s = x.nextNode(), n++);
    }
    return x.currentNode = w, o;
  }
  p(t) {
    let i = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, i), i += r.strings.length - 2) : r._$AI(t[i])), i++;
  }
}
class z {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, r, o) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = r, this.options = o, this._$Cv = o?.isConnected ?? !0;
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
    t = E(this, t, i), H(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== A && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : It(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && H(this._$AH) ? this._$AA.nextSibling.data = t : this.T(w.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: r } = t, o = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = N.createElement(At(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === o) this._$AH.p(i);
    else {
      const s = new Ft(o, this), n = s.u(this.options);
      s.p(i), this.T(n), this._$AH = s;
    }
  }
  _$AC(t) {
    let i = mt.get(t.strings);
    return i === void 0 && mt.set(t.strings, i = new N(t)), i;
  }
  k(t) {
    it(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let r, o = 0;
    for (const s of t) o === i.length ? i.push(r = new z(this.O(U()), this.O(U()), this, this.options)) : r = i[o], r._$AI(s), o++;
    o < i.length && (this._$AR(r && r._$AB.nextSibling, o), i.length = o);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const r = ht(t).nextSibling;
      ht(t).remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class F {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, r, o, s) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = i, this._$AM = o, this.options = s, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = u;
  }
  _$AI(t, i = this, r, o) {
    const s = this.strings;
    let n = !1;
    if (s === void 0) t = E(this, t, i, 0), n = !H(t) || t !== this._$AH && t !== A, n && (this._$AH = t);
    else {
      const c = t;
      let a, d;
      for (t = s[0], a = 0; a < s.length - 1; a++) d = E(this, c[r + a], i, a), d === A && (d = this._$AH[a]), n ||= !H(d) || d !== this._$AH[a], d === u ? t = u : t !== u && (t += (d ?? "") + s[a + 1]), this._$AH[a] = d;
    }
    n && !o && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class qt extends F {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Wt extends F {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Vt extends F {
  constructor(t, i, r, o, s) {
    super(t, i, r, o, s), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = E(this, t, i, 0) ?? u) === A) return;
    const r = this._$AH, o = t === u && r !== u || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, s = t !== u && (r === u || o);
    o && this.element.removeEventListener(this.name, this, r), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Kt {
  constructor(t, i, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    E(this, t);
  }
}
const Zt = { I: z }, Jt = et.litHtmlPolyfillSupport;
Jt?.(N, z), (et.litHtmlVersions ??= []).push("3.3.3");
const Qt = (e, t, i) => {
  const r = i?.renderBefore ?? t;
  let o = r._$litPart$;
  if (o === void 0) {
    const s = i?.renderBefore ?? null;
    r._$litPart$ = o = new z(t.insertBefore(U(), s), s, void 0, i ?? {});
  }
  return o._$AI(e), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const rt = globalThis;
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
S._$litElement$ = !0, S.finalized = !0, rt.litElementHydrateSupport?.({ LitElement: S });
const Xt = rt.litElementPolyfillSupport;
Xt?.({ LitElement: S });
(rt.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const kt = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Gt = { attribute: !0, type: String, converter: j, reflect: !1, hasChanged: tt }, Yt = (e = Gt, t, i) => {
  const { kind: r, metadata: o } = i;
  let s = globalThis.litPropertyMetadata.get(o);
  if (s === void 0 && globalThis.litPropertyMetadata.set(o, s = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), s.set(i.name, e), r === "accessor") {
    const { name: n } = i;
    return { set(c) {
      const a = t.get.call(this);
      t.set.call(this, c), this.requestUpdate(n, a, e, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(n, void 0, e, c), c;
    } };
  }
  if (r === "setter") {
    const { name: n } = i;
    return function(c) {
      const a = this[n];
      t.call(this, c), this.requestUpdate(n, a, e, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function ot(e) {
  return (t, i) => typeof i == "object" ? Yt(e, t, i) : ((r, o, s) => {
    const n = o.hasOwnProperty(s);
    return o.constructor.createProperty(s, r), n ? Object.getOwnPropertyDescriptor(o, s) : void 0;
  })(e, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function q(e) {
  return ot({ ...e, state: !0, attribute: !1 });
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
  _$AT(t, i, r) {
    this._$Ct = t, this._$AM = i, this._$Ci = r;
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
const { I: re } = Zt, vt = (e) => e, bt = () => document.createComment(""), O = (e, t, i) => {
  const r = e._$AA.parentNode, o = t === void 0 ? e._$AB : t._$AA;
  if (i === void 0) {
    const s = r.insertBefore(bt(), o), n = r.insertBefore(bt(), o);
    i = new re(s, n, e, e.options);
  } else {
    const s = i._$AB.nextSibling, n = i._$AM, c = n !== e;
    if (c) {
      let a;
      i._$AQ?.(e), i._$AM = e, i._$AP !== void 0 && (a = e._$AU) !== n._$AU && i._$AP(a);
    }
    if (s !== o || c) {
      let a = i._$AA;
      for (; a !== s; ) {
        const d = vt(a).nextSibling;
        vt(r).insertBefore(a, o), a = d;
      }
    }
  }
  return i;
}, _ = (e, t, i = e) => (e._$AI(t, i), e), oe = {}, se = (e, t = oe) => e._$AH = t, ne = (e) => e._$AH, J = (e) => {
  e._$AR(), e._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const yt = (e, t, i) => {
  const r = /* @__PURE__ */ new Map();
  for (let o = t; o <= i; o++) r.set(e[o], o);
  return r;
}, Q = ee(class extends ie {
  constructor(e) {
    if (super(e), e.type !== te.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(e, t, i) {
    let r;
    i === void 0 ? i = t : t !== void 0 && (r = t);
    const o = [], s = [];
    let n = 0;
    for (const c of e) o[n] = r ? r(c, n) : n, s[n] = i(c, n), n++;
    return { values: s, keys: o };
  }
  render(e, t, i) {
    return this.dt(e, t, i).values;
  }
  update(e, [t, i, r]) {
    const o = ne(e), { values: s, keys: n } = this.dt(t, i, r);
    if (!Array.isArray(o)) return this.ut = n, s;
    const c = this.ut ??= [], a = [];
    let d, f, l = 0, p = o.length - 1, h = 0, g = s.length - 1;
    for (; l <= p && h <= g; ) if (o[l] === null) l++;
    else if (o[p] === null) p--;
    else if (c[l] === n[h]) a[h] = _(o[l], s[h]), l++, h++;
    else if (c[p] === n[g]) a[g] = _(o[p], s[g]), p--, g--;
    else if (c[l] === n[g]) a[g] = _(o[l], s[g]), O(e, a[g + 1], o[l]), l++, g--;
    else if (c[p] === n[h]) a[h] = _(o[p], s[h]), O(e, o[l], o[p]), p--, h++;
    else if (d === void 0 && (d = yt(n, h, g), f = yt(c, l, p)), d.has(c[l])) if (d.has(c[p])) {
      const v = f.get(n[h]), K = v !== void 0 ? o[v] : null;
      if (K === null) {
        const st = O(e, o[l]);
        _(st, s[h]), a[h] = st;
      } else a[h] = _(K, s[h]), O(e, o[l], K), o[v] = null;
      h++;
    } else J(o[p]), p--;
    else J(o[l]), l++;
    for (; h <= g; ) {
      const v = O(e, a[g + 1]);
      _(v, s[h]), a[h++] = v;
    }
    for (; l <= p; ) {
      const v = o[l++];
      v !== null && J(v);
    }
    return this.ut = n, se(e, a), A;
  }
}), St = Y`
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
`, Et = (e, t, i) => {
  e.dispatchEvent(
    new CustomEvent(t, { detail: i, bubbles: !0, composed: !0 })
  );
}, ae = (e, t) => Et(e, "hass-more-info", { entityId: t }), ce = /* @__PURE__ */ new Set(["unavailable", "unknown", "none", ""]), $ = (e) => {
  if (e == null || e === "") return null;
  const t = typeof e == "number" ? e : Number(e);
  return Number.isFinite(t) ? t : null;
}, le = (e, t) => {
  if (!e?.entity_id.startsWith("sensor.")) return !1;
  if (t?.entities?.[e.entity_id]?.platform === "polr_stocks") return !0;
  const i = e.attributes.symbol;
  return e.attributes.device_class === "monetary" && typeof i == "string" && i.trim() !== "";
}, Ct = (e) => Object.keys(e.states).filter((t) => le(e.states[t], e)).sort((t, i) => {
  const r = (o) => e.entities?.[o]?.platform === "polr_stocks" ? 0 : 1;
  return r(t) - r(i) || t.localeCompare(i);
}), he = (e, t) => {
  const i = t.attributes.symbol;
  return typeof i == "string" && i.trim() ? i.trim().toUpperCase() : e.slice(e.indexOf(".") + 1).replace(/^polr_stocks_/, "").toUpperCase();
}, D = (e, t) => {
  const i = e.states[t];
  if (!i) return;
  const r = !ce.has(String(i.state).toLowerCase()), o = r ? $(i.state) : null, s = i.attributes;
  return {
    entity: t,
    symbol: he(t, i),
    price: o,
    currency: s.unit_of_measurement ?? "USD",
    change: $(s.change),
    changePercent: $(s.change_percent),
    previousClose: $(s.previous_close),
    open: $(s.open),
    high: $(s.high),
    low: $(s.low),
    quotedAt: s.quoted_at,
    available: r && o !== null
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
}, L = (e, t = "USD", i = "en") => {
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
}, ue = (e, t = "USD", i = "en") => e === null ? "—" : `${e > 0 ? "+" : e < 0 ? "−" : ""}${L(Math.abs(e), t, i)}`, fe = (e, t = "en") => {
  if (e === null) return "—";
  const i = e > 0 ? "+" : e < 0 ? "−" : "", r = new Intl.NumberFormat(t, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(e));
  return `${i}${r}%`;
}, ge = (e, t = "en") => {
  if (!e || e.low === null || e.high === null) return "";
  const i = e.currency;
  return `${L(e.low, i, t)} – ${L(
    e.high,
    i,
    t
  )}`;
};
var me = Object.defineProperty, ve = Object.getOwnPropertyDescriptor, W = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ve(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && me(t, i, o), o;
};
const be = [
  { name: "title", selector: { text: {} } },
  {
    name: "secondary",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "both", label: "Day change + range" },
          { value: "change", label: "Day change" },
          { value: "range", label: "Session range" },
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
      { name: "compact", selector: { boolean: {} } },
      { name: "sparkline", selector: { boolean: {} } }
    ]
  },
  {
    name: "sparkline_hours",
    selector: { number: { min: 1, max: 720, step: 1, mode: "box", unit_of_measurement: "hours" } }
  }
], ye = {
  title: "Section title",
  secondary: "Secondary line",
  show_change_amount: "Show change amount",
  show_change_percent: "Show change percent",
  color_change: "Colour gains and losses",
  compact: "Compact rows",
  sparkline: "Show trend line",
  sparkline_hours: "Trend line covers the last"
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
    Et(this, "config-changed", { config: e });
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
    const i = this._tickers, r = e + t;
    r < 0 || r >= i.length || ([i[e], i[r]] = [i[r], i[e]], this._setTickers(i));
  }
  render() {
    if (!this.hass || !this._config) return u;
    const e = this._tickers, t = new Set(e.map((o) => o.entity)), i = this._filter.trim().toLowerCase(), r = Ct(this.hass).filter((o) => !t.has(o)).filter((o) => i ? `${D(this.hass, o)?.symbol} ${o}`.toLowerCase().includes(i) : !0);
    return m`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${be}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._formChanged}
      ></ha-form>

      <div class="section-head">
        <span class="grow">Tickers shown</span>
        <span class="count">${e.length}</span>
      </div>
      ${e.length ? m`
            <ul class="list">
              ${Q(
      e,
      (o) => o.entity,
      (o, s) => this._renderSelected(o, s, e.length)
    )}
            </ul>
          ` : m`<div class="empty-state">
            Nothing selected yet — add tickers from the list below.
          </div>`}

      <div class="section-head">
        <span class="grow">Available tickers</span>
        <span class="count">${r.length}</span>
      </div>
      <div class="filter">
        <ha-icon icon="mdi:magnify"></ha-icon>
        <input
          type="search"
          placeholder="Filter tickers"
          .value=${this._filter}
          @input=${(o) => this._filter = o.target.value}
        />
      </div>
      ${r.length ? m`
            <ul class="list">
              ${Q(
      r,
      (o) => o,
      (o) => this._renderAvailable(o)
    )}
            </ul>
          ` : m`<div class="empty-state">
            ${i ? "No tickers match that filter." : "No further price sensors found. Tickers appear here once the PoLR Stocks integration is set up."}
          </div>`}
    `;
  }
  _renderSelected(e, t, i) {
    const r = D(this.hass, e.entity);
    return m`
      <li class="row">
        <div class="tile-icon">
          <ha-icon .icon=${e.icon ?? "mdi:chart-line"}></ha-icon>
        </div>
        <div class="tile-info">
          <div class="primary">
            <span>${e.name ?? r?.symbol ?? e.entity}</span>
          </div>
          <div class="secondary">
            <span>${r ? e.entity : "Entity not found"}</span>
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
  St,
  Y`
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
W([
  ot({ attribute: !1 })
], C.prototype, "hass", 2);
W([
  q()
], C.prototype, "_config", 2);
W([
  q()
], C.prototype, "_filter", 2);
C = W([
  kt("polr-stocks-editor")
], C);
const _e = (e, t) => {
  const i = e?.[t];
  if (!Array.isArray(i)) return [];
  const r = [];
  for (const o of i) {
    const s = o?.s ?? o?.state;
    if (s === void 0) continue;
    const n = Number(s);
    Number.isFinite(n) && r.push(n);
  }
  return r;
}, $e = (e, t = 96) => {
  if (t < 2 || e.length <= t) return e;
  const i = [], r = (e.length - 1) / (t - 1);
  for (let o = 0; o < t; o++)
    i.push(e[Math.round(o * r)]);
  return i;
}, xe = (e, t, i, r = 2) => {
  if (e.length < 2 || t <= 0 || i <= 0) return "";
  const o = Math.min(...e), n = Math.max(...e) - o, c = Math.max(0, i - r * 2), a = t / (e.length - 1);
  return e.map((d, f) => {
    const l = f * a, p = n === 0 ? 0.5 : (d - o) / n, h = r + (1 - p) * c;
    return `${f === 0 ? "M" : "L"}${l.toFixed(2)},${h.toFixed(2)}`;
  }).join(" ");
}, we = (e) => {
  if (e.length < 2) return "flat";
  const t = e[0], i = e[e.length - 1];
  return i > t ? "up" : i < t ? "down" : "flat";
}, Ae = async (e, t, i) => {
  if (!t.length) return {};
  const r = /* @__PURE__ */ new Date(), o = new Date(r.getTime() - i * 36e5);
  return e.callWS({
    type: "history/history_during_period",
    start_time: o.toISOString(),
    end_time: r.toISOString(),
    entity_ids: t,
    minimal_response: !0,
    no_attributes: !0,
    significant_changes_only: !1
  });
};
var ke = Object.defineProperty, Se = Object.getOwnPropertyDescriptor, V = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Se(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && ke(t, i, o), o;
};
const Ee = "0.4.0";
console.info(
  `%c POLR-STOCKS %c v${Ee} `,
  "color:#fff;background:#3f51b5;font-weight:700",
  "color:#3f51b5;background:#fff;font-weight:700"
);
const Ce = (e) => e.filter((i) => i !== "").flatMap((i, r) => r ? [" · ", i] : [i]);
let P = class extends S {
  constructor() {
    super(...arguments), this._historyPending = !1;
  }
  static async getConfigElement() {
    return document.createElement("polr-stocks-editor");
  }
  static getStubConfig(e) {
    return { tickers: Ct(e).slice(0, 5) };
  }
  setConfig(e) {
    if (!e) throw new Error("polr-stocks: config is required");
    if (e.tickers !== void 0 && !Array.isArray(e.tickers))
      throw new Error("polr-stocks: 'tickers' must be a list");
    const t = (e.tickers ?? []).map((i) => {
      const r = typeof i == "string" ? { entity: i } : i;
      if (!r?.entity || typeof r.entity != "string")
        throw new Error("polr-stocks: every ticker needs an 'entity'");
      if (!r.entity.startsWith("sensor."))
        throw new Error(
          `polr-stocks: '${r.entity}' is not a sensor — pick a ticker's price sensor`
        );
      return { ...r };
    });
    this._config = {
      show_change_amount: !0,
      show_change_percent: !0,
      secondary: "both",
      color_change: !0,
      compact: !1,
      sparkline: !1,
      sparkline_hours: 24,
      ...e,
      tickers: t
    }, this._history = void 0, this._scheduleHistory();
  }
  connectedCallback() {
    super.connectedCallback(), this._scheduleHistory();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._clearHistoryTimer();
  }
  _clearHistoryTimer() {
    this._historyTimer !== void 0 && (clearInterval(this._historyTimer), this._historyTimer = void 0);
  }
  _scheduleHistory() {
    this._clearHistoryTimer(), !(!this._config?.sparkline || !this.isConnected) && (this._loadHistory(), this._historyTimer = window.setInterval(() => void this._loadHistory(), 3e5));
  }
  async _loadHistory() {
    const e = this._config;
    if (!this.hass || !e?.sparkline || this._historyPending) return;
    const t = e.tickers.map((i) => i.entity);
    if (t.length) {
      this._historyPending = !0;
      try {
        this._history = await Ae(this.hass, t, e.sparkline_hours);
      } catch (i) {
        console.warn("polr-stocks: could not load history", i), this._history = void 0;
      } finally {
        this._historyPending = !1;
      }
    }
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
          ${Q(
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
    const r = de(i), o = () => ae(this, t.entity), s = this._secondary(i, r), n = this._config.color_change ? r : "";
    return m`
      <li
        class="row dir-${r}"
        role="button"
        tabindex="0"
        @click=${o}
        @keydown=${(c) => {
      (c.key === "Enter" || c.key === " ") && (c.preventDefault(), o());
    }}
      >
        <div class="tile-icon">
          <ha-icon .icon=${t.icon ?? pe[r]}></ha-icon>
        </div>
        <div class="tile-info">
          <div class="primary"><span>${t.name ?? i.symbol}</span></div>
          ${!this._config.compact && s.length ? m`<div class="secondary"><span>${Ce(s)}</span></div>` : u}
        </div>
        ${this._renderSparkline(t.entity)}
        <div class="quote">
          <div class="price ${i.available ? "" : "unavailable"}">
            ${i.available ? L(i.price, i.currency, this._language) : "—"}
          </div>
          ${i.available && this._config.compact ? m`<div class="change ${n}">${this._changeText(i)}</div>` : u}
        </div>
      </li>
    `;
  }
  /** Trend line for one row, or nothing when there is too little history. */
  _renderSparkline(e) {
    if (!this._config.sparkline) return u;
    const t = $e(_e(this._history, e)), i = 64, r = 26, o = xe(t, i, r);
    if (!o) return u;
    const s = this._config.color_change ? we(t) : "";
    return m`
      <svg
        class="spark ${s}"
        viewBox="0 0 ${i} ${r}"
        width=${i}
        height=${r}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d=${o} fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }
  /**
   * The day change, as configured. In compact mode this is the only place the
   * change appears; otherwise it leads the secondary line.
   */
  _changeText(e) {
    const { show_change_amount: t, show_change_percent: i } = this._config, r = [];
    if (t && r.push(ue(e.change, e.currency, this._language)), i) {
      const o = fe(e.changePercent, this._language);
      r.push(t ? `(${o})` : o);
    }
    return r.join(" ");
  }
  /** Secondary-line fragments for a row, before separators are added. */
  _secondary(e, t) {
    if (!e.available) return ["Unavailable"];
    const i = this._config.secondary;
    if (i === "none") return [];
    const r = this._config.color_change ? t : "", o = this._changeText(e), s = o ? m`<span class="change ${r}">${o}</span>` : "", n = ge(e, this._language);
    return i === "change" ? [s].filter((c) => c !== "") : i === "range" ? [n].filter((c) => c !== "") : [s, n].filter((c) => c !== "");
  }
};
P.styles = [
  St,
  Y`
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
      .spark {
        flex: 0 0 auto;
        margin-inline-end: var(--ha-space-1, 4px);
        color: var(--secondary-text-color);
        overflow: visible;
      }
      .spark.up {
        color: var(--success-color, #43a047);
      }
      .spark.down {
        color: var(--error-color, #db4437);
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
V([
  ot({ attribute: !1 })
], P.prototype, "hass", 2);
V([
  q()
], P.prototype, "_config", 2);
V([
  q()
], P.prototype, "_history", 2);
P = V([
  kt("polr-stocks")
], P);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "polr-stocks",
  name: "PoLR Stocks",
  description: "Prices and day change for the tickers you choose.",
  preview: !0
});
export {
  P as PolrStocks
};
//# sourceMappingURL=polr-stocks.js.map
