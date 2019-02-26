const QRCodeSymbols = (
  function() {
    const xmlns_svg = 'http://www.w3.org/2000/svg';

    const QRCodeSymbols = function(settings) {
      settings = settings || {};
      settings.dotSize = settings.dotSize || 16;
      settings.symbolsSelector = '#symbols input[type="checkbox"]:checked + object';
      this.settings = settings;
    };

    QRCodeSymbols.prototype.svg = function(text) {
      if (text === '') {
        return '';
      }
      let modules = new QRCode(text).qrcode.modules;
      const dotSize = this.settings.dotSize;
      const svg = document.implementation.createDocument(xmlns_svg, 'svg', null);
      const length = modules.length;
      svg.documentElement.setAttribute('width', length * dotSize);
      svg.documentElement.setAttribute('height', length * dotSize);

      const defs = svg.documentElement.appendChild(
        svg.createElementNS(xmlns_svg, 'defs')
      );
      const patterns = [];
      document.querySelectorAll(this.settings.symbolsSelector).forEach(
        function(imageNode) {
          let symbol = imageNode.contentDocument.documentElement;
          if (symbol.localName !== 'svg') {
            return;
          }
          let pattern = defs.appendChild(svg.createElementNS(xmlns_svg, 'pattern'));
          const patternName = imageNode.getAttribute('data').match(/\/([^/]+)\.svg$/)[1];
          patterns.push(patternName);
          pattern.setAttribute('id', patternName);
          pattern.setAttribute('width', '100%');
          pattern.setAttribute('height', '100%');
          let viewBox = symbol.getAttribute('viewBox');
          if (viewBox) {
            pattern.setAttribute('viewBox', viewBox);
          } else {
            pattern.setAttribute(
              'viewBox',
              '0 0 ' + symbol.getAttribute('width') + ' ' + symbol.getAttribute('height')
            );
          }
          symbol.childNodes.forEach(
            function(node) {
              pattern.appendChild(svg.importNode(node, true));
            }
          );
        }
      );

      const addCorner = function(x, y, dotSize) {
        const outer = svg.documentElement.appendChild(
          svg.createElementNS(xmlns_svg, 'rect')
        );
        outer.setAttribute('x', x * dotSize + dotSize / 2);
        outer.setAttribute('y', y * dotSize + dotSize / 2);
        outer.setAttribute('width', 6 * dotSize);
        outer.setAttribute('height', 6  * dotSize);
        outer.setAttribute('fill', 'none');
        outer.setAttribute('stroke', '#000');
        outer.setAttribute('stroke-width', dotSize);
        const inner = svg.documentElement.appendChild(
          svg.createElementNS(xmlns_svg, 'rect')
        );
        inner.setAttribute('x', (x + 2) * dotSize);
        inner.setAttribute('y', (y + 2) * dotSize);
        inner.setAttribute('width', 3 * dotSize);
        inner.setAttribute('height', 3  * dotSize);
        inner.setAttribute('fill', '#000');
      };
      addCorner(0, 0, dotSize);
      addCorner(0, length - 7, dotSize);
      addCorner(length - 7, 0, dotSize);
      for (let y = 0; y < length; y++) {
        for (let x = 0; x < length; x++) {
          if (!modules[x][y]) {
            continue;
          }
          if ((x < 8 && y < 8) || (x > length - 8 && y < 8) || (x < 8 && y > length - 8)) {
            continue;
          }
          const dot = svg.documentElement.appendChild(
            svg.createElementNS(xmlns_svg, 'rect')
          );
          dot.setAttribute('x', x * dotSize);
          dot.setAttribute('y', y * dotSize);
          dot.setAttribute('width', dotSize);
          dot.setAttribute('height', dotSize);
          if (patterns.length > 0) {
            dot.setAttribute('fill', 'url(#' + patterns[Math.floor(Math.random() * Math.floor(patterns.length))] + ')');
          } else {
            dot.setAttribute('fill', '#000');
          }
        }
      }
      return (new XMLSerializer()).serializeToString(svg.documentElement);
    };

    QRCodeSymbols.prototype.download = function(text, filename) {
      const element = document.createElement('a');
      const data = this.svg(text);
      console.log(data);
      element.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }

    return QRCodeSymbols;
  }
)();
