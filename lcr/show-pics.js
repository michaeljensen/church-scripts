javascript:(function () {
  /* LCR Photo Tiles v1.4. Docs: lcr/show-pics.md.
     Browsers join these lines into one when this is pasted into a bookmark, so use only block
     comments, end every statement with a semicolon, and never type a percent sign (use PCT). */
  var table = document.querySelector('table');
  if (!table) {
    alert('No table found. Use this on a Custom Report page.');
    return;
  }
  if (document.getElementById('lcr-tile-view')) {
    alert('Tile view already active! Refresh to reset.');
    return;
  }
  var PCT = '\x25';

  /* LCR sometimes renders a label twice ("NameName"). */
  function dedupe(text) {
    var half = Math.ceil(text.length / 2);
    return (text.length > 1 && text.slice(0, half) === text.slice(half)) ? text.slice(0, half) : text;
  }

  /* Turns a raw label key (dots and dashes, no spaces) into Title Case words. */
  function prettyLabel(text) {
    if (!text) return text;
    if (text.indexOf('.') < 0 || /\s/.test(text)) return text;
    var parts = text.split('.');
    if (parts.length > 2) parts = parts.slice(1);
    return parts.join(' ').replace(/-/g, ' ').replace(/(^|\s)\S/g, function (ch) {
      return ch.toUpperCase();
    });
  }

  /* Visible text of a cell, skipping aria-hidden duplicates. */
  function cellText(cell) {
    var copy = cell.cloneNode(true);
    Array.prototype.slice.call(copy.querySelectorAll('[aria-hidden="true"]')).forEach(function (el) {
      el.parentNode.removeChild(el);
    });
    return copy.textContent.replace(/\s+/g, ' ').trim();
  }

  /* Member UUID from the row's member-card attribute, else from the React props of its button. */
  function memberUuid(row) {
    var btn = row.querySelector('[data-member-card-person-uuid]');
    var attr = btn ? btn.getAttribute('data-member-card-person-uuid') : null;
    if (attr) return attr;
    btn = row.querySelector('button');
    if (!btn) return null;
    var fiberKey = Object.keys(btn).filter(function (key) {
      return key.indexOf('__reactFiber') === 0;
    })[0];
    var fiber = fiberKey ? btn[fiberKey] : null;
    for (var depth = 0; depth < 6 && fiber; depth++) {
      var propSets = [
        fiber.memoizedProps,
        fiber.pendingProps,
        fiber.alternate && fiber.alternate.memoizedProps,
        fiber.alternate && fiber.alternate.pendingProps
      ];
      for (var i = 0; i < propSets.length; i++) {
        var props = propSets[i];
        if (props && typeof props.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(props.id)) return props.id;
      }
      fiber = fiber.return;
    }
    return null;
  }

  /* Read the table: headers, the photo column to skip, and the name column. */
  var headerCells = Array.prototype.slice.call(table.querySelectorAll('th'));
  var photoCol = headerCells.findIndex(function (th) {
    return th.id === 'lcr-photo-col-added' || dedupe(th.textContent.trim()) === 'Photo';
  });
  var headers = headerCells.map(function (th, i) {
    return i === photoCol ? null : prettyLabel(dedupe(th.textContent.trim()));
  }).filter(Boolean);
  var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
  var nameCol = -1;
  if (rows[0]) {
    var firstCells = Array.prototype.slice.call(rows[0].querySelectorAll('td'));
    for (var col = 0; col < firstCells.length; col++) {
      if (col !== photoCol && firstCells[col].querySelector('[data-member-card-person-uuid],button')) {
        nameCol = col;
        break;
      }
    }
  }
  var nameHeader = (nameCol >= 0 && headerCells[nameCol]) ? prettyLabel(dedupe(headerCells[nameCol].textContent.trim())) : null;

  var members = rows.map(function (tr) {
    var memberId = memberUuid(tr);
    var allCells = Array.prototype.slice.call(tr.querySelectorAll('td'));
    var memberName = (nameCol >= 0 && allCells[nameCol]) ? cellText(allCells[nameCol]) : '';
    var cells = allCells.filter(function (td, i) {
      return i !== photoCol;
    }).map(cellText);
    var values = {};
    headers.forEach(function (header, i) {
      if (cells[i]) values[header] = cells[i];
    });
    if (!memberName) memberName = cells[0] || '';
    return { uuid: memberId, fields: values, name: memberName };
  }).filter(function (member) {
    return member.uuid;
  });
  if (!members.length) {
    alert('Table found, but no member IDs could be read - the page layout may have changed again.');
    return;
  }

  /* Hide the table and put the grid in its container. Lift fixed pixel max-widths from the
     container and its ancestors so the grid can span the window; else fall back to the body. */
  var tableWrap = table.parentElement;
  tableWrap.style.display = 'none';
  var host = tableWrap.parentElement || document.body;
  for (var node = host; node && node !== document.body; node = node.parentElement) {
    var nodeStyle = getComputedStyle(node);
    if (/px$/.test(nodeStyle.maxWidth)) node.style.maxWidth = 'none';
  }
  if (host.getBoundingClientRect().width < window.innerWidth * 0.9) host = document.body;
  var grid = document.createElement('div');
  grid.id = 'lcr-tile-view';
  grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;padding:12px;width:100' + PCT + ';box-sizing:border-box;justify-content:flex-start;align-items:flex-start;';
  host.appendChild(grid);
  var PHOTO_SIZE = 320, TILE_WIDTH = PHOTO_SIZE + 40;

  /* First photo URL in a member-card response: tokenUrl, else a URL under a photo-like key. */
  function findPhotoUrl(obj) {
    var found = null, seen = [];
    (function walk(value) {
      if (found || value == null || typeof value !== 'object') return;
      if (seen.indexOf(value) >= 0) return;
      seen.push(value);
      if (typeof value.tokenUrl === 'string' && value.tokenUrl) {
        found = value.tokenUrl;
        return;
      }
      var names = Object.keys(value);
      for (var i = 0; i < names.length; i++) {
        if (found) return;
        var key = names[i], child = value[key];
        if (typeof child === 'string') {
          if (/token|photo|image|avatar|thumb/i.test(key) && /^https?:\/\//.test(child)) {
            found = child;
            return;
          }
        } else {
          walk(child);
        }
      }
    })(obj);
    return found;
  }

  /* Fetch the member card and show its photo, trying the next endpoint on any failure. */
  function loadPhoto(photoBox) {
    var memberId = photoBox.dataset.uuid;
    var urls = [
      'https://mltp-api.churchofjesuschrist.org/api/member/' + memberId + '/card',
      '/mlt/api/member-card?uuid=' + memberId
    ];
    (function tryUrl(i) {
      if (i >= urls.length) return;
      fetch(urls[i], { credentials: 'include' }).then(function (res) {
        if (!res.ok) throw 0;
        return res.json();
      }).then(function (card) {
        var url = findPhotoUrl(card);
        if (!url) throw 0;
        var src = (/\/(SMALL|MEDIUM|LARGE|ORIGINAL)$/i.test(url) || /\.(jpe?g|png|webp|gif)($|\?)/i.test(url)) ? url : url + '/LARGE';
        var img = document.createElement('img');
        img.style.cssText = 'width:100' + PCT + ';height:100' + PCT + ';object-fit:cover;display:block;';
        img.onerror = function () {
          img.onerror = null;
          img.src = url;
        };
        img.src = src;
        photoBox.innerHTML = '';
        photoBox.appendChild(img);
      }).catch(function () {
        tryUrl(i + 1);
      });
    })(0);
  }

  /* Load each photo when its tile comes within 200px of the screen. */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        loadPhoto(entry.target);
      }
    });
  }, { rootMargin: '200px 0px', threshold: 0 });

  members.forEach(function (member) {
    var tile = document.createElement('div');
    tile.style.cssText = 'width:' + TILE_WIDTH + 'px;flex:0 0 ' + TILE_WIDTH + 'px;border:1px solid #dde;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.10);display:flex;flex-direction:column;align-items:center;padding:20px 20px 16px;box-sizing:border-box;';
    var photoBox = document.createElement('div');
    photoBox.dataset.uuid = member.uuid;
    photoBox.style.cssText = 'width:' + PHOTO_SIZE + 'px;height:' + PHOTO_SIZE + 'px;border-radius:50' + PCT + ';overflow:hidden;background:linear-gradient(135deg,#e0e4ef,#c8cfe0);margin-bottom:14px;flex-shrink:0;';
    observer.observe(photoBox);
    tile.appendChild(photoBox);
    var nameEl = document.createElement('div');
    nameEl.textContent = member.name;
    nameEl.style.cssText = 'font-weight:700;font-size:16px;text-align:center;margin-bottom:12px;color:#1a1a2e;line-height:1.3;';
    tile.appendChild(nameEl);
    Object.keys(member.fields).filter(function (key) {
      return key !== nameHeader;
    }).forEach(function (key) {
      var value = member.fields[key];
      if (!value) return;
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:baseline;width:100' + PCT + ';font-size:13px;padding:4px 0;border-top:1px solid #f0f0f5;gap:10px;';
      var label = document.createElement('span');
      label.textContent = key;
      label.style.cssText = 'color:#888;white-space:nowrap;flex-shrink:0;';
      var valueEl = document.createElement('span');
      valueEl.textContent = value;
      valueEl.style.cssText = 'color:#333;font-weight:500;text-align:right;';
      row.appendChild(label);
      row.appendChild(valueEl);
      tile.appendChild(row);
    });
    grid.appendChild(tile);
  });
})();
