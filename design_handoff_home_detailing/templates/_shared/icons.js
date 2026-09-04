(() => {
if (customElements.get('hd-icon')) return;
const P = {
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  'arrow-down': '<path d="M12 5v14M5 12l7 7 7-7"/>',
  'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
  'chevron-left': '<path d="M15 6l-6 6 6 6"/>',
  'chevron-right': '<path d="M9 6l6 6-6 6"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  'close': '<path d="M6 6l12 12M18 6 6 18"/>',
  'check': '<path d="M5 12l5 5L20 7"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  'plus': '<path d="M12 5v14M5 12h14"/>',
  'minus': '<path d="M5 12h14"/>',
  'search': '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',
  'calendar': '<rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'pin': '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  'phone': '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  'mail': '<rect x="3" y="5" width="18" height="14"/><path d="M3 7l9 6 9-6"/>',
  'user': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  'users': '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a6 6 0 0 1 4 6.5"/>',
  'car': '<path d="M3 13l2-5h14l2 5v5H3z"/><path d="M3 13h18M7 18v2M17 18v2"/><circle cx="7.5" cy="15.5" r="1"/><circle cx="16.5" cy="15.5" r="1"/>',
  'droplet': '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  'sparkle': '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/>',
  'spray': '<path d="M9 8h6v13H9zM10 8V5h4v3M14 5h4M18 3v4M20 5h1"/>',
  'shield': '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  'home': '<path d="M3 11l9-7 9 7v10H3z"/><path d="M10 21v-6h4v6"/>',
  'edit': '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  'trash': '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
  'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  'alert': '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  'bell': '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',
  'undo': '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  'refresh': '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',
  'menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
  'logout': '<path d="M10 4H5v16h5M14 8l5 4-5 4M19 12H9"/>',
  'settings': '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  'grid': '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
  'list': '<path d="M9 6h12M9 12h12M9 18h12M4 6h.5M4 12h.5M4 18h.5"/>',
  'tag': '<path d="M3 3h9l9 9-9 9-9-9z"/><circle cx="8" cy="8" r="1"/>',
  'star': '<path d="M12 3l2.8 6 6.2.7-4.6 4.3 1.3 6.4L12 17.3 6.3 20.4l1.3-6.4L3 9.7 9.2 9z"/>',
  'wallet': '<rect x="3" y="6" width="18" height="13"/><path d="M3 10h18M16 14h2"/>',
  'file': '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
  'external': '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'
};
class HdIcon extends HTMLElement {
  static get observedAttributes() { return ['name', 'size', 'stroke']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this.draw(); }
  attributeChangedCallback() { this.draw(); }
  draw() {
    const n = this.getAttribute('name') || 'info', s = this.getAttribute('size') || 20, w = this.getAttribute('stroke') || 1.75;
    this.style.display = 'inline-flex'; this.style.lineHeight = '0'; this.style.flexShrink = '0';
    this.shadowRoot.innerHTML = '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + w + '" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">' + (P[n] || P.info) + '</svg>';
  }
}
customElements.define('hd-icon', HdIcon);
window.HD_ICONS = Object.keys(P);
})();
