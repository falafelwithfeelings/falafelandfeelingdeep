// ================= USER IDENTIFIER =================
        let visitorAlias = localStorage.getItem('visitor_alias');
        if (!visitorAlias) {
            visitorAlias = prompt("What should we call you? (Leave blank for Anonymous)") || "Anonymous";
            localStorage.setItem('visitor_alias', visitorAlias);
        }

        // ================= WINDOW DRAG / MAXIMIZE / MINIMIZE =================
        const windowFrame = document.getElementById('main-window');
        const windowBar = document.getElementById('window-bar');
        const maximizeButton = document.getElementById('maximize-window-btn');
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        windowBar.addEventListener('pointerdown', (event) => {
            if (event.target.closest('.win-btn') || windowFrame.classList.contains('maximized')) return;
            isDragging = true;
            const rect = windowFrame.getBoundingClientRect();
            dragOffsetX = event.clientX - rect.left;
            dragOffsetY = event.clientY - rect.top;
            // Switch from centre-based placement to absolute pixel placement on first drag.
            windowFrame.style.left = rect.left + 'px';
            windowFrame.style.top = rect.top + 'px';
            windowFrame.style.transform = 'none';
            try { windowBar.setPointerCapture(event.pointerId); } catch (_) {}
        });
        windowBar.addEventListener('pointermove', (event) => {
            if (!isDragging) return;
            const maxLeft = Math.max(0, window.innerWidth - Math.min(windowFrame.offsetWidth, window.innerWidth));
            const maxTop = Math.max(0, window.innerHeight - Math.min(windowFrame.offsetHeight, window.innerHeight));
            const nextLeft = Math.min(maxLeft, Math.max(0, event.clientX - dragOffsetX));
            const nextTop = Math.min(maxTop, Math.max(0, event.clientY - dragOffsetY));
            windowFrame.style.left = nextLeft + 'px';
            windowFrame.style.top = nextTop + 'px';
        });
        const stopDragging = () => { isDragging = false; };
        windowBar.addEventListener('pointerup', stopDragging);
        windowBar.addEventListener('pointercancel', stopDragging);

        function toggleMaximize() {
            const maximized = windowFrame.classList.toggle('maximized');
            if (maximizeButton) {
                maximizeButton.setAttribute('aria-pressed', String(maximized));
                maximizeButton.title = maximized ? 'Restore window' : 'Maximize window';
                maximizeButton.textContent = maximized ? '❐' : '□';
            }
            isDragging = false;
        }

        function minimizeWindow() {
            document.getElementById('blade-minimize-modal').style.display = 'flex';
        }
        function cancelMinimize() {
            document.getElementById('blade-minimize-modal').style.display = 'none';
        }
        function confirmMinimize() {
            document.getElementById('blade-minimize-modal').style.display = 'none';
            windowFrame.classList.add('is-minimized');
            document.getElementById('desktop-taskbar').style.display = 'block';
        }
        function restoreMinimizedWindow() {
            document.getElementById('desktop-taskbar').style.display = 'none';
            windowFrame.classList.remove('is-minimized');
        }
        function closeWindow() {
            document.getElementById('blade-modal').style.display = 'flex';
        }
        function cancelExit() {
            document.getElementById('blade-modal').style.display = 'none';
        }
        function forceOpenWindow() {
            document.getElementById('blade-modal').style.display = 'none';
            document.getElementById('blade-minimize-modal').style.display = 'none';
            document.getElementById('desktop-taskbar').style.display = 'none';
            document.getElementById('exit-screen').style.display = 'none';
            windowFrame.classList.remove('is-minimized');
        }
        function finishExit() {
            document.getElementById('blade-modal').style.display = 'none';
            document.getElementById('desktop-taskbar').style.display = 'none';
            windowFrame.classList.add('is-minimized');
            document.getElementById('exit-screen').style.display = 'flex';
        }
        function reopenFromExit() { forceOpenWindow(); }

        // ================= CUSTOM WALLPAPERS =================
        function uploadBg(type, event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                if (type === 'inner') {
                    document.documentElement.style.setProperty('--bg-inside', `url(${e.target.result})`);
                } else {
                    document.documentElement.style.setProperty('--bg-outside', `url(${e.target.result})`);
                }
            };
            reader.readAsDataURL(file);
        }

        function resetBgs() {
            document.documentElement.style.setProperty('--bg-inside', `url('https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/Cute%20Whimsical%20Desktop%20Wallpaper%20Collage.jpe')`);
            document.documentElement.style.setProperty('--bg-outside', `url('https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/Hatsune%20Miku%20Wallpaper%20(I%20made%20it%20myself).jpe')`);
        }

        // No background starfield: the animated vector frame is the page decoration.

        // ================= THEME SWITCHER =================
        function changeMood(mood) {
            document.body.setAttribute('data-mood', mood);
            document.getElementById('admin-mood-select').value = mood;
        }

        // ================= BACKGROUND DANCERS =================
        const danceOptions = {
            miku: 'https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/DANCING%20MIKUUU.png',
            emu: 'https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/NO%20EMU.png'
        };

        function updateDancingBg() {
            const toggleEl = document.getElementById('dance-toggle');
            const container = document.getElementById('dancing-bg');
            if (!toggleEl || !container) return;

            const toggle = toggleEl.value;
            container.replaceChildren();
            if (toggle === 'none') return;

            const itemsToSpawn = toggle === 'both' ? [danceOptions.miku, danceOptions.emu]
                : toggle === 'miku' ? [danceOptions.miku]
                : toggle === 'emu' ? [danceOptions.emu] : [];
            if (!itemsToSpawn.length) return;

            for (let i = 0; i < 15; i++) {
                const img = document.createElement('img');
                const chosen = itemsToSpawn[Math.floor(Math.random() * itemsToSpawn.length)];
                img.className = 'dance-item sticker-img';
                img.alt = toggle === 'both' ? 'Miku or Emu dancing' : `${toggle} dancing`;
                img.decoding = 'async';
                img.loading = 'eager';
                img.draggable = false;
                img.src = chosen;
                img.style.position = 'absolute';
                img.style.top = '-110px';
                img.style.width = `${Math.random() * 40 + 30}px`;
                img.style.left = `${Math.random() * 94}vw`;
                img.style.pointerEvents = 'none';
                const duration = Math.random() * 10 + 10;
                img.style.animation = `fallDown ${duration}s linear infinite`;
                img.style.animationDelay = `${-(Math.random() * duration)}s`;
                img.onerror = () => img.remove();
                container.appendChild(img);
            }
        }
        updateDancingBg();

        // ================= MS PAINT ENGINE =================
        const canvas = document.getElementById('paint-canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let currentTool = 'pencil';
        let currentColor = '#000000';
        let isDrawing = false;
        let startX = 0, startY = 0, lastX = 0, lastY = 0;
        let paintSnapshot = null;
        let paintHistory = [];
        let paintRedo = [];
        let zoomLevel = 1;
        let freeSelectPoints = [];
        let floatingSelection = null;
        let draggingSelection = false;
        let selectionDragOffset = { x: 0, y: 0 };
        let selectionMoveSnapshot = null;

        function paintStatus(message) {
            const status = document.getElementById('canvas-coords');
            if (status) status.textContent = message;
        }
        function paintPoint(event) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: Math.max(0, Math.min(canvas.width - 1, (event.clientX - rect.left) * canvas.width / rect.width)),
                y: Math.max(0, Math.min(canvas.height - 1, (event.clientY - rect.top) * canvas.height / rect.height))
            };
        }
        function savePaintHistory() {
            try {
                paintHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
                if (paintHistory.length > 25) paintHistory.shift();
                paintRedo = [];
            } catch (error) { console.warn('Paint history could not be saved.', error); }
        }
        function restorePaintImage(image) {
            if (image) ctx.putImageData(image, 0, 0);
        }
        function initPaintCanvas() {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.imageSmoothingEnabled = false;
            paintHistory = [];
            paintRedo = [];
            savePaintHistory();
            paintStatus('900 × 500 px');
        }
        initPaintCanvas();

        function setTool(tool) {
            const validTools = ['freeSelect','select','eraser','fill','picker','zoom','pencil','brush','airbrush','text','line','curve','rect','polygon','ellipse','roundRect'];
            if (!validTools.includes(tool)) return;
            currentTool = tool;
            document.querySelectorAll('.mspaint-tool').forEach(button => button.classList.toggle('active', button.id === `tool-${tool}`));
            const cursorMap = { picker: 'crosshair', text: 'text', select: 'crosshair', freeSelect: 'crosshair', zoom: 'zoom-in' };
            canvas.style.cursor = cursorMap[tool] || 'crosshair';
            paintStatus(`Tool: ${tool}`);
        }
        function setColor(color, element) {
            currentColor = color;
            document.querySelectorAll('.color-box').forEach(box => box.classList.remove('active'));
            if (element) element.classList.add('active');
            if (currentTool === 'eraser') setTool('pencil');
            paintStatus(`Color: ${color}`);
        }
        function paintRoundedRect(x, y, width, height, radius) {
            const left = Math.min(x, x + width), top = Math.min(y, y + height);
            const w = Math.abs(width), h = Math.abs(height), r = Math.min(radius, w / 2, h / 2);
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(left, top, w, h, r);
            else {
                ctx.moveTo(left + r, top); ctx.lineTo(left + w - r, top); ctx.quadraticCurveTo(left + w, top, left + w, top + r);
                ctx.lineTo(left + w, top + h - r); ctx.quadraticCurveTo(left + w, top + h, left + w - r, top + h);
                ctx.lineTo(left + r, top + h); ctx.quadraticCurveTo(left, top + h, left, top + h - r);
                ctx.lineTo(left, top + r); ctx.quadraticCurveTo(left, top, left + r, top); ctx.closePath();
            }
            ctx.stroke();
        }
        function drawPaintShape(tool, x, y) {
            restorePaintImage(paintSnapshot);
            ctx.strokeStyle = currentColor;
            ctx.fillStyle = currentColor;
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            const w = x - startX, h = y - startY;
            if (tool === 'line') {
                ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(x, y); ctx.stroke();
            } else if (tool === 'rect') {
                ctx.strokeRect(startX, startY, w, h);
            } else if (tool === 'roundRect') {
                paintRoundedRect(startX, startY, w, h, 18);
            } else if (tool === 'ellipse') {
                ctx.beginPath(); ctx.ellipse(startX + w / 2, startY + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2); ctx.stroke();
            } else if (tool === 'polygon') {
                const sides = 6, rx = Math.abs(w / 2), ry = Math.abs(h / 2), cx = startX + w / 2, cy = startY + h / 2;
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = -Math.PI / 2 + i * Math.PI * 2 / sides;
                    const px = cx + Math.cos(angle) * rx, py = cy + Math.sin(angle) * ry;
                    if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                }
                ctx.closePath(); ctx.stroke();
            } else if (tool === 'curve') {
                const midX = (startX + x) / 2;
                const midY = (startY + y) / 2 - Math.min(80, Math.abs(w + h) * .16);
                ctx.beginPath(); ctx.moveTo(startX, startY); ctx.quadraticCurveTo(midX, midY, x, y); ctx.stroke();
            }
        }
        function sprayAt(x, y) {
            ctx.fillStyle = currentColor;
            for (let i = 0; i < 24; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 17;
                const size = Math.random() * 2.4 + .6;
                ctx.fillRect(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, size, size);
            }
        }
        function pickColor(x, y) {
            const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            currentColor = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
            document.querySelectorAll('.color-box').forEach(box => box.classList.remove('active'));
            paintStatus(`Picked ${currentColor}`);
        }
        function floodFill(x, y, color) {
            x = Math.floor(x); y = Math.floor(y);
            if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = image.data;
            const pixelCount = canvas.width * canvas.height;
            const startIndex = y * canvas.width + x;
            const startOffset = startIndex * 4;
            const target = [data[startOffset], data[startOffset + 1], data[startOffset + 2], data[startOffset + 3]];
            const hex = color.replace('#', '');
            const replacementColor = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16), 255];
            if (target.every((value, index) => value === replacementColor[index])) return;
            const matches = index => {
                const offset = index * 4;
                return data[offset] === target[0] && data[offset+1] === target[1] && data[offset+2] === target[2] && data[offset+3] === target[3];
            };
            const queue = new Int32Array(pixelCount);
            const visited = new Uint8Array(pixelCount);
            let head = 0, tail = 0, touched = 0;
            if (matches(startIndex)) { queue[tail++] = startIndex; visited[startIndex] = 1; }
            while (head < tail) {
                const index = queue[head++];
                const offset = index * 4;
                data[offset] = replacementColor[0]; data[offset+1] = replacementColor[1];
                data[offset+2] = replacementColor[2]; data[offset+3] = 255;
                touched++;
                const px = index % canvas.width;
                const neighbours = [];
                if (px > 0) neighbours.push(index - 1);
                if (px < canvas.width - 1) neighbours.push(index + 1);
                if (index >= canvas.width) neighbours.push(index - canvas.width);
                if (index < pixelCount - canvas.width) neighbours.push(index + canvas.width);
                for (const next of neighbours) {
                    if (!visited[next] && matches(next)) { visited[next] = 1; queue[tail++] = next; }
                }
            }
            ctx.putImageData(image, 0, 0);
            paintStatus(`Filled ${touched.toLocaleString()} px`);
        }
        function paintText(x, y) {
            const value = prompt('Type your text:');
            if (value === null || !value.trim()) return;
            const fontSize = Number(prompt('Font size? (default 24)', '24')) || 24;
            ctx.fillStyle = currentColor;
            ctx.font = `${Math.max(8, Math.min(120, fontSize))}px VT323, monospace`;
            ctx.textBaseline = 'top';
            value.split('\n').forEach((line, index) => ctx.fillText(line, x, y + index * (fontSize + 2)));
            savePaintHistory();
        }
        function pointInPolygon(x, y, points) {
            let inside = false;
            for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
                const a = points[i], b = points[j];
                const crosses = ((a.y > y) !== (b.y > y)) && (x < (b.x - a.x) * (y - a.y) / ((b.y - a.y) || .0001) + a.x);
                if (crosses) inside = !inside;
            }
            return inside;
        }
        function commitFloatingSelection() {
            if (!floatingSelection) return;
            if (floatingSelection.baseSnapshot) ctx.putImageData(floatingSelection.baseSnapshot, 0, 0);
            ctx.putImageData(floatingSelection.image, Math.round(floatingSelection.x), Math.round(floatingSelection.y));
            floatingSelection = null;
            savePaintHistory();
        }
        function finishSelection(points, rectangular) {
            if (!paintSnapshot) return;
            const xs = points.map(p => p.x), ys = points.map(p => p.y);
            const minX = Math.max(0, Math.floor(Math.min(...xs))), minY = Math.max(0, Math.floor(Math.min(...ys)));
            const maxX = Math.min(canvas.width, Math.ceil(Math.max(...xs))), maxY = Math.min(canvas.height, Math.ceil(Math.max(...ys)));
            const width = Math.max(1, maxX - minX), height = Math.max(1, maxY - minY);
            const source = new ImageData(width, height);
            for (let yy = 0; yy < height; yy++) {
                for (let xx = 0; xx < width; xx++) {
                    const inShape = rectangular || pointInPolygon(minX + xx + .5, minY + yy + .5, points);
                    if (!inShape) continue;
                    const from = ((minY + yy) * canvas.width + (minX + xx)) * 4;
                    const to = (yy * width + xx) * 4;
                    source.data[to] = paintSnapshot.data[from]; source.data[to+1] = paintSnapshot.data[from+1];
                    source.data[to+2] = paintSnapshot.data[from+2]; source.data[to+3] = paintSnapshot.data[from+3];
                }
            }
            ctx.putImageData(paintSnapshot, 0, 0);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(minX, minY, width, height);
            const baseSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
            floatingSelection = { x: minX, y: minY, width, height, image: source, baseSnapshot };
            ctx.save(); ctx.setLineDash([5,4]); ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
            if (rectangular) ctx.strokeRect(minX, minY, width, height);
            else { ctx.beginPath(); points.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.stroke(); }
            ctx.restore();
            paintStatus('Selection ready — drag it to move');
        }
        function onPaintPointerDown(event) {
            event.preventDefault();
            const point = paintPoint(event); startX = lastX = point.x; startY = lastY = point.y;
            if (currentTool === 'fill') { commitFloatingSelection(); floodFill(point.x, point.y, currentColor); savePaintHistory(); return; }
            if (currentTool === 'picker') { pickColor(point.x, point.y); return; }
            if (currentTool === 'zoom') { zoomLevel = zoomLevel === 1 ? 1.5 : zoomLevel === 1.5 ? 2 : 1; canvas.style.transform = 'none'; canvas.style.width = `${100 * zoomLevel}%`; canvas.style.height = `${100 * zoomLevel}%`; paintStatus(`Zoom ${Math.round(zoomLevel*100)}%`); return; }
            if (currentTool === 'text') { commitFloatingSelection(); paintText(point.x, point.y); return; }
            if (currentTool === 'select' || currentTool === 'freeSelect') {
                if (floatingSelection && point.x >= floatingSelection.x && point.x <= floatingSelection.x + floatingSelection.width && point.y >= floatingSelection.y && point.y <= floatingSelection.y + floatingSelection.height) {
                    draggingSelection = true; selectionDragOffset = { x: point.x - floatingSelection.x, y: point.y - floatingSelection.y };
                    selectionMoveSnapshot = floatingSelection.baseSnapshot || ctx.getImageData(0,0,canvas.width,canvas.height);
                    try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
                    return;
                }
                commitFloatingSelection();
                isDrawing = true; paintSnapshot = ctx.getImageData(0,0,canvas.width,canvas.height); freeSelectPoints = [point];
                try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
                return;
            }
            commitFloatingSelection();
            isDrawing = true; paintSnapshot = ctx.getImageData(0,0,canvas.width,canvas.height);
            ctx.beginPath(); ctx.moveTo(point.x, point.y);
            if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
                ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
                ctx.lineWidth = currentTool === 'eraser' ? 22 : currentTool === 'brush' ? 11 : 3;
                ctx.lineTo(point.x + .01, point.y + .01); ctx.stroke();
            }
            if (currentTool === 'airbrush') sprayAt(point.x, point.y);
            try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
        }
        function onPaintPointerMove(event) {
            const point = paintPoint(event);
            paintStatus(`${Math.round(point.x)}, ${Math.round(point.y)} px`);
            if (draggingSelection && floatingSelection && selectionMoveSnapshot) {
                const nx = Math.max(0, Math.min(canvas.width - floatingSelection.width, point.x - selectionDragOffset.x));
                const ny = Math.max(0, Math.min(canvas.height - floatingSelection.height, point.y - selectionDragOffset.y));
                ctx.putImageData(selectionMoveSnapshot, 0, 0);
                ctx.putImageData(floatingSelection.image, Math.round(nx), Math.round(ny));
                floatingSelection.x = nx; floatingSelection.y = ny;
                return;
            }
            if (!isDrawing) return;
            if (currentTool === 'select' || currentTool === 'freeSelect') {
                restorePaintImage(paintSnapshot);
                if (currentTool === 'select') {
                    ctx.save(); ctx.setLineDash([5,4]); ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.strokeRect(startX,startY,point.x-startX,point.y-startY); ctx.restore();
                } else {
                    freeSelectPoints.push(point); ctx.save(); ctx.setLineDash([4,3]); ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.beginPath(); freeSelectPoints.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke(); ctx.restore();
                }
                return;
            }
            if (['line','curve','rect','roundRect','ellipse','polygon'].includes(currentTool)) {
                drawPaintShape(currentTool, point.x, point.y); return;
            }
            if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
                ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
                ctx.lineWidth = currentTool === 'eraser' ? 22 : currentTool === 'brush' ? 11 : 3;
                ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(point.x,point.y); ctx.stroke();
            } else if (currentTool === 'airbrush') sprayAt(point.x, point.y);
            lastX = point.x; lastY = point.y;
        }
        function onPaintPointerUp(event) {
            if (draggingSelection) {
                draggingSelection = false;
                if (floatingSelection) {
                    const moved = floatingSelection;
                    const base = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const left = Math.round(moved.x), top = Math.round(moved.y);
                    for (let yy = 0; yy < moved.height; yy++) {
                        for (let xx = 0; xx < moved.width; xx++) {
                            const offset = ((top + yy) * canvas.width + left + xx) * 4;
                            if (offset >= 0 && offset + 3 < base.data.length) {
                                base.data[offset] = 255; base.data[offset+1] = 255; base.data[offset+2] = 255; base.data[offset+3] = 255;
                            }
                        }
                    }
                    moved.baseSnapshot = base;
                    ctx.putImageData(base, 0, 0);
                    ctx.putImageData(moved.image, left, top);
                    ctx.save(); ctx.setLineDash([5,4]); ctx.strokeStyle = '#444'; ctx.lineWidth = 1; ctx.strokeRect(left, top, moved.width, moved.height); ctx.restore();
                }
                selectionMoveSnapshot = null; savePaintHistory(); paintStatus('Selection moved'); return;
            }
            if (!isDrawing) return;
            const point = paintPoint(event);
            if (currentTool === 'select' || currentTool === 'freeSelect') {
                if (currentTool === 'select') finishSelection([{x:startX,y:startY},{x:point.x,y:point.y}], true);
                else { freeSelectPoints.push(point); finishSelection(freeSelectPoints, false); }
            } else if (['line','curve','rect','roundRect','ellipse','polygon'].includes(currentTool)) {
                drawPaintShape(currentTool, point.x, point.y); savePaintHistory();
            } else {
                savePaintHistory();
            }
            isDrawing = false; paintSnapshot = null;
        }
        canvas.addEventListener('pointerdown', onPaintPointerDown);
        canvas.addEventListener('pointermove', onPaintPointerMove);
        canvas.addEventListener('pointerup', onPaintPointerUp);
        canvas.addEventListener('pointercancel', onPaintPointerUp);
        canvas.addEventListener('dblclick', (event) => { if (currentTool === 'select' || currentTool === 'freeSelect') { commitFloatingSelection(); savePaintHistory(); } });

        function undoPaint() {
            if (paintHistory.length <= 1) return;
            paintRedo.push(paintHistory.pop());
            restorePaintImage(paintHistory[paintHistory.length - 1]);
            floatingSelection = null; paintStatus('Undo');
        }
        function redoPaint() {
            if (!paintRedo.length) return;
            const image = paintRedo.pop(); paintHistory.push(image); restorePaintImage(image);
            floatingSelection = null; paintStatus('Redo');
        }
        function clearPaint() {
            if (!confirm('Clear the whole canvas?')) return;
            floatingSelection = null; ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height); savePaintHistory(); paintStatus('Canvas cleared');
        }
        function savePaint() {
            commitFloatingSelection();
            const link = document.createElement('a'); link.download = 'falafel-painting.png'; link.href = canvas.toDataURL('image/png'); link.click();
            paintStatus('Saved falafel-painting.png');
        }
        window.addEventListener('keydown', (event) => {
            if (!(event.ctrlKey || event.metaKey)) return;
            if (event.key.toLowerCase() === 'z') { event.preventDefault(); undoPaint(); }
            if (event.key.toLowerCase() === 'y') { event.preventDefault(); redoPaint(); }
        });

        // ================= TAMAGOTCHI (AKITO 7 CYCLE) =================
        let tama = { coins: 20, mood: 100, belly: 2 };
        let isPartying = false;
        let isWorking = false;
        let partyTimeout = null;
        let workInterval = null;
        let chaosHudInterval = null;
        let activeAkitoMode = null;
        let akitoModeStarted = 0;
        let akitoModeDuration = 0;
        let currentAkitoIndex = 0;

        const akitoSprites = [
            'https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/AKIT%201',
            'https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/AKIT%202',
            'https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/AKIT%203',
            'https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/AKIT%204',
            'https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/AKIT%205',
            'https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/AKIT%206',
            'https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/AKIT%207'
        ];

        const akitoReplies = {
            talk: ["What do you want? I'm busy practicing.", "Don't look at me like that.", "I'm not cute, I'm cool!", "Cheesecake...?", "I'm the best at this!", "Do I have to talk to you?", "Did you need something?"],
            feed: ["Cheesecake... I mean, pancakes! Thanks.", "I guess this is okay.", "Don't think this makes us friends.", "Finally, some good food.", "Can I have more?"],
            work: ["I'll show you how it's done.", "Ugh, fine. Watch this.", "I'm gonna work so hard!", "Let me show you my true power."],
            arcade: ["VBS PARTY TIME! 🎉", "I'll beat you at this!", "ARCADE LET'S GOOOO!", "I'm gonna get the high score!", "You're on!"],
            interrupted: ["HOW DARE YOU INTERRUPT MY DANCE!", "Hey! I wasn't finished!", "Oh, you didn't let me finish my dance...", "Rude! I was in the zone!", "Excuse me?! I was dancing!"],
            apologize: ["S-sorry! I got a little carried away...", "Did I break the screen? My bad.", "Wait, why is everything shaking? Oh, it was me.", "Please don't tell the webmaster I did that.", "I'm just... really passionate about working.", "Did the HTML survive? I hope the CSS is okay."],
            danceComplete: ["WOO! I'm the best dancer! Did you see that?!", "That was awesome! I should do that more often.", "I think I broke a sweat... worth it!"]
        };

        function cycleAkito(countAsTap = true) {
            currentAkitoIndex = (currentAkitoIndex + 1) % akitoSprites.length;
            const sprite = document.getElementById('tama-sprite');
            if (sprite) sprite.src = akitoSprites[currentAkitoIndex];
            if (countAsTap) registerAkitoTap();
        }

        function updateTamaUI() {
            const coins = document.getElementById('tama-coins');
            const mood = document.getElementById('tama-mood');
            const belly = document.getElementById('tama-belly');
            if (coins) coins.textContent = tama.coins;
            if (mood) mood.textContent = tama.mood;
            if (belly) belly.textContent = tama.belly;
        }

        function setTamaDialogue(text) {
            const dialogue = document.getElementById('tama-dialogue');
            if (dialogue) dialogue.textContent = `Akito: ${text}`;
        }

        // Secret Akito discoveries: rapid taps, typed passwords, and the coin counter.
        let akitoTapCount = 0;
        let akitoTapResetTimer = null;
        let akitoSecretBuffer = '';
        let lastAkitoCoinSecret = 0;

        function triggerAkitoSecret(kind) {
            const room = document.getElementById('akito-room');
            if (room) {
                room.classList.remove('secret-found');
                void room.offsetWidth;
                room.classList.add('secret-found');
            }

            if (kind === 'tap') {
                tama.coins += 7;
                setTamaDialogue('Seven taps?! You found my backstage stash. Take 7 coins. Nobody saw that.');
            } else if (kind === 'cake') {
                tama.coins += 5;
                tama.mood = Math.min(100, tama.mood + 5);
                setTamaDialogue('CHEESECAKE?! You remembered. +5 coins. This stays between us.');
            } else if (kind === 'vbs') {
                tama.coins += 10;
                tama.mood = 100;
                setTamaDialogue('VIVID BAD SQUAD! Now THAT is a password. +10 coins!');
            } else if (kind === 'blade') {
                tama.coins += 3;
                setTamaDialogue('You called Blade? Tch. I was already doing a perfectly good job. +3 coins.');
            } else if (kind === 'coin') {
                const now = Date.now();
                if (now - lastAkitoCoinSecret < 12000) return;
                lastAkitoCoinSecret = now;
                tama.coins += 3;
                setTamaDialogue('HEY! That is my coin stash. ...Fine, take 3.');
            }
            updateTamaUI();
        }

        function registerAkitoTap() {
            akitoTapCount++;
            clearTimeout(akitoTapResetTimer);
            if (akitoTapCount >= 7) {
                akitoTapCount = 0;
                triggerAkitoSecret('tap');
                return;
            }
            akitoTapResetTimer = setTimeout(() => { akitoTapCount = 0; }, 2400);
        }

        window.addEventListener('keydown', (event) => {
            const target = event.target;
            if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
            if (event.key.length !== 1 || !/[a-z0-9]/i.test(event.key)) return;
            akitoSecretBuffer = (akitoSecretBuffer + event.key.toLowerCase()).slice(-24);
            if (akitoSecretBuffer.endsWith('cheesecake')) {
                akitoSecretBuffer = '';
                triggerAkitoSecret('cake');
            } else if (akitoSecretBuffer.endsWith('vividsquad')) {
                akitoSecretBuffer = '';
                triggerAkitoSecret('vbs');
            } else if (akitoSecretBuffer.endsWith('blade')) {
                akitoSecretBuffer = '';
                triggerAkitoSecret('blade');
            }
        });

        function akitoBurst(text = null) {
            const room = document.getElementById('akito-room');
            if (!room) return;
            const particle = document.createElement('span');
            particle.className = 'akito-burst';
            particle.textContent = text || ['!!','VBS!','GO!','✦','★','100%','WOO!'][Math.floor(Math.random() * 7)];
            particle.style.left = `${Math.random() * 78 + 4}%`;
            particle.style.top = `${Math.random() * 52 + 4}%`;
            particle.style.setProperty('--burst-x', `${Math.random() * 80 - 40}px`);
            particle.style.setProperty('--burst-y', `${-25 - Math.random() * 60}px`);
            room.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
        function showAkitoChaosHud(mode, duration) {
            activeAkitoMode = mode;
            akitoModeStarted = Date.now();
            akitoModeDuration = duration;
            const hud = document.getElementById('akito-chaos-hud');
            const title = document.getElementById('akito-chaos-title');
            if (hud) hud.style.display = 'block';
            if (title) title.textContent = mode === 'work' ? 'AKITO WORK.EXE' : 'VBS ARCADE OVERDRIVE';
            clearInterval(chaosHudInterval);
            chaosHudInterval = setInterval(() => {
                const elapsed = Date.now() - akitoModeStarted;
                const progress = Math.min(100, elapsed / akitoModeDuration * 100);
                const remaining = Math.max(0, (akitoModeDuration - elapsed) / 1000);
                const bar = document.getElementById('akito-chaos-progress');
                const count = document.getElementById('akito-chaos-countdown');
                if (bar) bar.style.width = `${progress}%`;
                if (count) count.textContent = `${remaining.toFixed(1)}s`;
            }, 90);
        }
        function hideAkitoChaosHud() {
            clearInterval(chaosHudInterval);
            chaosHudInterval = null;
            const hud = document.getElementById('akito-chaos-hud');
            if (hud) hud.style.display = 'none';
            const bar = document.getElementById('akito-chaos-progress');
            if (bar) bar.style.width = '0%';
            document.body.classList.remove('akito-chaos-mode');
            document.getElementById('main-window')?.classList.remove('neon-mode');
        }
        function finishAkitoMode({ skipped = false, interrupted = false } = {}) {
            if (!activeAkitoMode) return;
            const mode = activeAkitoMode;
            activeAkitoMode = null;
            clearTimeout(partyTimeout); partyTimeout = null;
            clearInterval(workInterval); workInterval = null;
            isPartying = false; isWorking = false;
            hideAkitoChaosHud();
            document.getElementById('akito-room')?.classList.remove('party-mode');
            document.getElementById('tama-sprite')?.classList.remove('dancing');
            document.getElementById('tama-sprite')?.style.removeProperty('opacity');
            document.querySelectorAll('.akito-chaos-clone').forEach(node => node.remove());
            if (mode === 'work') {
                tama.coins += skipped ? 5 : 15;
                tama.mood = Math.max(0, tama.mood - (interrupted ? 10 : 20));
                if (skipped) setTamaDialogue('Skipping the WORK EXPLOSION?! Fine. You still earned 5 coins.');
                else if (interrupted) setTamaDialogue(akitoReplies.interrupted[Math.floor(Math.random() * akitoReplies.interrupted.length)]);
                else setTamaDialogue(akitoReplies.apologize[Math.floor(Math.random() * akitoReplies.apologize.length)]);
            } else {
                tama.mood = Math.min(100, tama.mood + (skipped ? 5 : 0));
                if (skipped) setTamaDialogue('ARCADE SKIPPED! I was just getting to the good part!');
                else if (interrupted) setTamaDialogue(akitoReplies.interrupted[Math.floor(Math.random() * akitoReplies.interrupted.length)]);
                else setTamaDialogue(akitoReplies.danceComplete[Math.floor(Math.random() * akitoReplies.danceComplete.length)]);
            }
            updateTamaUI();
        }
        function stopParty(interrupted = false) {
            if (activeAkitoMode === 'arcade') finishAkitoMode({ interrupted });
        }
        function skipAkitoMode() {
            if (!activeAkitoMode) return;
            finishAkitoMode({ skipped: true });
        }
        function startParty() {
            if (activeAkitoMode) return;
            isPartying = true;
            const room = document.getElementById('akito-room');
            const sprite = document.getElementById('tama-sprite');
            room.classList.add('party-mode');
            sprite.classList.add('dancing');
            document.body.classList.add('akito-chaos-mode');
            document.getElementById('main-window').classList.add('neon-mode');
            setTamaDialogue(akitoReplies.arcade[Math.floor(Math.random() * akitoReplies.arcade.length)]);
            showAkitoChaosHud('arcade', 12000);
            let flashes = 0;
            const flashTimer = setInterval(() => {
                akitoBurst(['VBS!','WOO!','♪','100','GO!!'][Math.floor(Math.random() * 5)]);
                flashes++;
                if (flashes >= 22 || activeAkitoMode !== 'arcade') clearInterval(flashTimer);
            }, 280);
            partyTimeout = setTimeout(() => finishAkitoMode(), 12000);
        }
        function aggressiveWork() {
            if (activeAkitoMode) return;
            isWorking = true;
            const sprite = document.getElementById('tama-sprite');
            const spriteClone = sprite.cloneNode(true);
            spriteClone.id = 'akito-chaos-clone-main';
            spriteClone.className = 'akito-chaos-clone sticker-img';
            spriteClone.style.position = 'fixed';
            spriteClone.style.zIndex = '9998';
            spriteClone.style.width = '108px';
            spriteClone.style.height = '108px';
            spriteClone.style.left = '48vw';
            spriteClone.style.top = '42vh';
            spriteClone.style.pointerEvents = 'none';
            spriteClone.style.transition = 'left .22s cubic-bezier(.18,.89,.32,1.28), top .22s cubic-bezier(.18,.89,.32,1.28), transform .22s ease';
            document.body.appendChild(spriteClone);
            sprite.style.opacity = '0';
            document.body.classList.add('akito-chaos-mode');
            document.getElementById('main-window').classList.add('neon-mode');
            setTamaDialogue('WORK MODE ACTIVATED!!! EVERYONE MOVE!!!');
            showAkitoChaosHud('work', 7200);
            let bounces = 0;
            workInterval = setInterval(() => {
                if (activeAkitoMode !== 'work') return;
                bounces++;
                spriteClone.style.left = `${Math.random() * 84 + 4}vw`;
                spriteClone.style.top = `${Math.random() * 78 + 5}vh`;
                spriteClone.style.transform = `rotate(${Math.random() * 900 - 450}deg) scale(${1.15 + Math.random() * .8})`;
                if (bounces % 2 === 0) akitoBurst(['WORK!','FASTER!','!!!','⚡'][Math.floor(Math.random()*4)]);
                if (bounces > 28) finishAkitoMode();
            }, 240);
            partyTimeout = setTimeout(() => finishAkitoMode(), 7200);
        }

        function tamaAction(action) {
            cycleAkito(false); 
            
            if (activeAkitoMode) { finishAkitoMode({ interrupted: true }); return; }
            
            if (action === 'Talk') { 
                setTamaDialogue(akitoReplies.talk[Math.floor(Math.random() * akitoReplies.talk.length)]); 
                tama.mood = Math.min(100, tama.mood + 10); 
                updateTamaUI();
            } 
            else if (action === 'Feed') {
                if (tama.coins < 5) return setTamaDialogue("I don't have enough coins for pancakes...");
                tama.coins -= 5; tama.belly += 1; tama.mood = Math.min(100, tama.mood + 20);
                setTamaDialogue(akitoReplies.feed[Math.floor(Math.random() * akitoReplies.feed.length)]);
                updateTamaUI();
            } 
            else if (action === 'Work') {
                setTamaDialogue(akitoReplies.work[Math.floor(Math.random() * akitoReplies.work.length)]);
                aggressiveWork();
            }
            else if (action === 'Arcade') {
                if (tama.coins < 20) return setTamaDialogue("I need 20 coins for the arcade!");
                tama.coins -= 20; tama.mood = 100;
                startParty();
            }
        }
        updateTamaUI();

        // ================= SHARED SITE CONFIG =================
        // Deploy falafelverse-shared-config-worker.js, then paste its URL below.
        // The administrator password lives only in the Worker secret and in memory while logged in.
        const SHARED_CONFIG_API = 'https://falafelverseapi.falafelwithfeelings.workers.dev';
        const REPO_RAW = 'https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/';
        const defaultBlinkies = [
            REPO_RAW + 'DANCING%20MIKUUU.png',
            REPO_RAW + 'NO%20EMU.png',
            REPO_RAW + 'badge%20genshin!%20(make%20it%20transparent.jpe',
            REPO_RAW + 'Screenshot%202026-11-06%20170703.png'
        ];
        const DEFAULT_SITE_CONFIG = {
            profileName: 'Falafel',
            profileMood: 'gacha goblin',
            profileImageUrl: REPO_RAW + 'me',
            webmasterParagraphs: [
                "hi!!! im this website's webmaster! I rlly enjoy learning to code even tho it pmo sometimes. I made this on a macbook air using chrome (2560x1600 px), so it will probably look best on that device. Hopefully it doesn't look to bad on other devices tho.",
                "I love art, and I'm going to be studying animation at my dream school soon YAYAYAYYYYY (I NEED A WAY TO PAY FOR IT THO HELP) I used to be a trad artist, but now, I seem to be getting more used to digital art. I also love journaling and collecting CD's, and drinking ramune."
            ],
            bannerImageUrl: REPO_RAW + 'EMU%20BANNER.jpe',
            blinkies: defaultBlinkies.slice(),
            foodLog: [
                { name: 'Strawberry Roll', recipe: 'Sponge cake, cream, strawberries.', emoji: '🍰' },
                { name: 'Sushi Roll', recipe: 'Rice, seaweed, salmon, avocado.', emoji: '🍣' }
            ]
        };
        let siteConfig = JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG));
        let blinkieItems = siteConfig.blinkies.slice();
        let foodLog = siteConfig.foodLog.slice();
        let sharedAdminPassword = '';
        let adminSessionActive = false;
        let siteConfigLoadedFromServer = false;
        let hasPendingSiteChanges = localStorage.getItem('falafel_site_config_pending') === 'true';
        let configRefreshTimer = null;

        function isSiteAdmin() { return adminSessionActive && !!sharedAdminPassword; }
        window.falafelGetAdminPassword = () => (isSiteAdmin() ? sharedAdminPassword : '');
        window.falafelIsAdmin = () => isSiteAdmin();
        function sharedApiIsConfigured() {
            return /^https:\/\//i.test(SHARED_CONFIG_API) && !SHARED_CONFIG_API.includes('YOUR-WORKER-NAME') && !SHARED_CONFIG_API.includes('YOUR-SUBDOMAIN');
        }
        function sharedApiUrl(path) { return SHARED_CONFIG_API.replace(/\/$/, '') + path; }
        function mergeSiteConfig(candidate) {
            const source = candidate && typeof candidate === 'object' ? candidate : {};
            const merged = { ...DEFAULT_SITE_CONFIG, ...source };
            merged.webmasterParagraphs = Array.isArray(source.webmasterParagraphs) ? source.webmasterParagraphs.slice(0,2).map(String) : DEFAULT_SITE_CONFIG.webmasterParagraphs.slice();
            while (merged.webmasterParagraphs.length < 2) merged.webmasterParagraphs.push('');
            merged.blinkies = Array.isArray(source.blinkies) ? source.blinkies.filter(v => typeof v === 'string' && validHttpUrl(v)).slice(0,40) : DEFAULT_SITE_CONFIG.blinkies.slice();
            merged.foodLog = Array.isArray(source.foodLog) ? source.foodLog.filter(v => v && typeof v === 'object').slice(0,60).map(v => ({ name:String(v.name || 'Mystery treat').slice(0,80), recipe:String(v.recipe || '').slice(0,2000), emoji:String(v.emoji || '🍽️').slice(0,12) })) : DEFAULT_SITE_CONFIG.foodLog.slice();
            merged.profileName = String(merged.profileName || 'Falafel').slice(0,50);
            merged.profileMood = String(merged.profileMood || '').slice(0,120);
            merged.profileImageUrl = validHttpUrl(merged.profileImageUrl) ? merged.profileImageUrl : DEFAULT_SITE_CONFIG.profileImageUrl;
            merged.bannerImageUrl = validHttpUrl(merged.bannerImageUrl) ? merged.bannerImageUrl : DEFAULT_SITE_CONFIG.bannerImageUrl;
            return merged;
        }
        function validHttpUrl(value) {
            try { const parsed = new URL(value); return parsed.protocol === 'https:' || parsed.protocol === 'http:'; }
            catch (_) { return false; }
        }
        function readLocalConfigCache() {
            try {
                const cached = JSON.parse(localStorage.getItem('falafel_site_config') || 'null');
                if (cached) return mergeSiteConfig(cached);
                // Import older per-browser settings as an offline fallback; the shared backend remains canonical.
                const legacy = { ...DEFAULT_SITE_CONFIG };
                const oldBlinkies = JSON.parse(localStorage.getItem('falafel_blinkies') || 'null');
                const oldFood = JSON.parse(localStorage.getItem('falafel_food_log') || 'null');
                if (Array.isArray(oldBlinkies)) legacy.blinkies = oldBlinkies;
                if (Array.isArray(oldFood)) legacy.foodLog = oldFood;
                return mergeSiteConfig(legacy);
            } catch (_) { return mergeSiteConfig(DEFAULT_SITE_CONFIG); }
        }
        function cacheSiteConfig() {
            try { localStorage.setItem('falafel_site_config', JSON.stringify(siteConfig)); }
            catch (error) { console.warn('Could not cache the site configuration in this browser.', error); }
        }
        function markPendingSiteChanges(pending) {
            hasPendingSiteChanges = !!pending;
            try { localStorage.setItem('falafel_site_config_pending', hasPendingSiteChanges ? 'true' : 'false'); } catch (_) {}
        }
        function setImageFallback(img, candidates, finalLabel) {
            if (!img) return;
            const unique = [...new Set(candidates.filter(Boolean))];
            let index = 0;
            img.onerror = () => {
                index++;
                if (index < unique.length) img.src = unique[index];
                else {
                    img.onerror = null;
                    const label = encodeURIComponent(finalLabel || '?');
                    img.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" rx="18" fill="#ffe7f4"/><text x="50%" y="56%" text-anchor="middle" font-family="Arial" font-size="72" fill="#c45aa0">${finalLabel || '?'}</text></svg>`)}`;
                }
            };
            img.src = unique[0] || '';
        }
        function applySiteConfig() {
            const profileName = document.getElementById('profile-name-label');
            const profileMood = document.getElementById('profile-mood-label');
            const profilePic = document.getElementById('profile-pic-image');
            const paragraphOne = document.getElementById('webmaster-paragraph-one');
            const paragraphTwo = document.getElementById('webmaster-paragraph-two');
            const banner = document.getElementById('webmaster-banner-image');
            if (profileName) profileName.textContent = siteConfig.profileName;
            if (profileMood) profileMood.textContent = `Mood: ${siteConfig.profileMood}`;
            if (profilePic) setImageFallback(profilePic, [siteConfig.profileImageUrl, REPO_RAW+'me', REPO_RAW+'me.png', REPO_RAW+'me.PNG', REPO_RAW+'me.jpg', REPO_RAW+'me.JPG', REPO_RAW+'me.jpeg', REPO_RAW+'me.webp'], 'F');
            if (paragraphOne) paragraphOne.textContent = siteConfig.webmasterParagraphs[0] || '';
            if (paragraphTwo) paragraphTwo.textContent = siteConfig.webmasterParagraphs[1] || '';
            if (banner) setImageFallback(banner, [siteConfig.bannerImageUrl, REPO_RAW+'EMU%20BANNER.jpe', REPO_RAW+'EMU%20BANNER.jpeg', REPO_RAW+'EMU%20BANNER.png', REPO_RAW+'EMU%20BANNER.jpg', REPO_RAW+'EMU%20BANNER.webp'], 'EMU');
            blinkieItems = siteConfig.blinkies.slice();
            foodLog = siteConfig.foodLog.slice();
            renderBlinkies();
            renderFoodLog();
        }
        async function loadSharedSiteConfig(silent = false) {
            siteConfig = readLocalConfigCache();
            applySiteConfig();
            if (!sharedApiIsConfigured()) return false;
            try {
                const response = await fetch(sharedApiUrl('/config'), { method:'GET', cache:'no-store' });
                if (!response.ok) throw new Error(`Shared config read returned ${response.status}`);
                const config = await response.json();
                // If this is a fresh Worker with no saved record, preserve older browser-side
                // blinkies/recipes as the initial seed until the admin's first successful save.
                if (config._initialized === false || hasPendingSiteChanges) {
                    siteConfigLoadedFromServer = false;
                    applySiteConfig();
                    return false;
                }
                siteConfig = mergeSiteConfig(config);
                siteConfigLoadedFromServer = true;
                cacheSiteConfig();
                applySiteConfig();
                return true;
            } catch (error) {
                console.warn('Shared site settings are not reachable; showing this browser cache/defaults.', error);
                if (!silent) setConfigStatus('Shared settings could not load. Showing cached settings until the connection is restored.');
                return false;
            }
        }
        async function saveSharedSiteConfig(successMessage = 'Site settings updated!') {
            siteConfig = mergeSiteConfig({ ...siteConfig, blinkies:blinkieItems, foodLog });
            cacheSiteConfig();
            applySiteConfig();
            if (!sharedApiIsConfigured()) {
                markPendingSiteChanges(true);
                alert('Saved in this browser only. To make every visitor see this change, deploy the shared Worker and set SHARED_CONFIG_API in index.html.');
                return false;
            }
            if (!isSiteAdmin()) {
                markPendingSiteChanges(true);
                alert('Please unlock admin mode before saving shared site settings.');
                return false;
            }
            try {
                const response = await fetch(sharedApiUrl('/admin/config'), {
                    method:'POST',
                    headers:{ 'Content-Type':'application/json', 'X-Admin-Password':sharedAdminPassword },
                    body:JSON.stringify(siteConfig)
                });
                if (!response.ok) {
                    if (response.status === 401) { adminSessionActive = false; sharedAdminPassword = ''; checkAdminStateUI(); }
                    throw new Error(response.status === 401 ? 'Admin password expired or rejected.' : `Save failed (${response.status}).`);
                }
                siteConfigLoadedFromServer = true;
                markPendingSiteChanges(false);
                setConfigStatus(successMessage);
                return true;
            } catch (error) {
                markPendingSiteChanges(true);
                console.error(error);
                alert(`The shared save failed: ${error.message}\nYour changes remain in this browser's cache for now.`);
                return false;
            }
        }
        function setConfigStatus(message) {
            const node = document.getElementById('site-config-status');
            if (node) node.textContent = message;
        }

        // ================= RECIPE SCRAPBOOK =================
        function renderFoodLog() {
            const container = document.getElementById('food-log-container');
            if (!container) return;
            const isAdmin = isSiteAdmin();
            if (!foodLog.length) {
                container.innerHTML = '<p style="font-size:1rem;color:#a46a98;">The recipe scrapbook is waiting for its first treat. ♡</p>';
            } else {
                container.innerHTML = foodLog.map((food, index) => `
                    <article class="food-item">
                        <button type="button" class="food-card-open" onclick="openFoodRecipe(${index})" aria-label="Open ${escapeHTML(food.name || 'recipe')}">
                            <span class="food-emoji">${escapeHTML(food.emoji || '🍽️')}</span>
                            <span class="food-name-label">${escapeHTML(food.name || 'Mystery treat')}</span>
                            <span class="food-open-hint">OPEN RECIPE ♡</span>
                        </button>
                        ${isAdmin ? `<button type="button" class="food-admin-remove" onclick="removeFood(${index})" title="Remove recipe">✕ remove</button>` : ''}
                    </article>
                `).join('');
            }
            const addButton = document.getElementById('food-add-btn');
            if (addButton) addButton.style.display = isAdmin ? 'inline-flex' : 'none';
        }
        function openFoodRecipe(index) {
            const recipe = foodLog[index];
            if (!recipe) return;
            document.getElementById('food-reader-emoji').textContent = recipe.emoji || '🍽️';
            document.getElementById('food-reader-title').textContent = recipe.name || 'Mystery treat';
            document.getElementById('food-reader-copy').textContent = recipe.recipe || 'A little kitchen mystery...';
            document.getElementById('food-recipe-reader-modal').style.display = 'flex';
        }
        function closeFoodRecipe() { document.getElementById('food-recipe-reader-modal').style.display = 'none'; }
        function openAddFoodModal() {
            if (!isSiteAdmin()) { alert('Only the site admin can add recipes to this little scrapbook.'); return; }
            document.getElementById('food-modal').style.display = 'flex';
            document.getElementById('food-name').value = '';
            document.getElementById('food-recipe').value = '';
            document.getElementById('food-emoji').value = '';
        }
        async function addFood() {
            if (!isSiteAdmin()) { alert('Admin access is required to add a recipe.'); return; }
            const name = document.getElementById('food-name').value.trim();
            const recipe = document.getElementById('food-recipe').value.trim();
            const emoji = document.getElementById('food-emoji').value.trim() || '🍽️';
            if (!name) { alert('Please enter a food name!'); return; }
            foodLog.push({ name, recipe, emoji });