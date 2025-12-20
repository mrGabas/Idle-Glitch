import { Window } from './Window.js';
import { PasswordWindow } from './PasswordWindow.js';
import { LORE_DB } from '../data/loreData.js';
import { COLLECTION_DB } from '../data/collectionData.js';
import { UTILS } from '../core/config.js';
import { assetLoader } from '../core/AssetLoader.js';

export class MediaViewerWindow extends Window {
    constructor(gameW, gameH, type, src, name) {
        const w = 600;
        const h = 500;
        const x = (gameW - w) / 2;
        const y = (gameH - h) / 2;
        super(x, y, w, h, name || "Media Viewer");
        this.type = type;
        this.src = src;

        if (this.type === 'image') {
            this.image = assetLoader.getImage(src);
        } else if (this.type === 'video') {
            this.video = assetLoader.getVideo(src);
            if (this.video) {
                this.video.currentTime = 0;
                this.video.loop = true;
                this.video.play().catch(e => console.error(e));
            }
        }
    }

    onClose() {
        if (this.video) {
            this.video.pause();
            this.video.currentTime = 0;
        }
    }

    drawContent(ctx, x, y, w, h) {
        // Draw Black BG
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, w, h);

        if (this.type === 'image' && this.image && this.image.complete) {
            // Fit logic
            const imgW = this.image.naturalWidth;
            const imgH = this.image.naturalHeight;

            if (imgW > 0 && imgH > 0) {
                const scale = Math.min(w / imgW, h / imgH);
                const drawW = imgW * scale;
                const drawH = imgH * scale;
                const dx = x + (w - drawW) / 2;
                const dy = y + (h - drawH) / 2;

                ctx.drawImage(this.image, dx, dy, drawW, drawH);
            }
        } else if (this.type === 'video' && this.video) {
            const vidW = this.video.videoWidth;
            const vidH = this.video.videoHeight;
            if (vidW > 0 && vidH > 0) {
                const scale = Math.min(w / vidW, h / vidH);
                const drawW = vidW * scale;
                const drawH = vidH * scale;
                const dx = x + (w - drawW) / 2;
                const dy = y + (h - drawH) / 2;

                ctx.drawImage(this.video, dx, dy, drawW, drawH);
            } else {
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.fillText("Buffering Video...", x + w / 2, y + h / 2);
            }
        } else {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText("Loading Media...", x + w / 2, y + h / 2);
        }
    }
}

export class ArchiveWindow extends Window {
    constructor(game) {
        const w = 600;
        const h = 450;
        const x = (game.w - w) / 2;
        const y = (game.h - h) / 2;
        super(x, y, w, h, "Archive_Explorer.exe");

        this.game = game;
        this.currentPath = []; // Stack of folder keys. Empty = Root
        this.selectedFileId = null;
        this.selectedFolderKey = null;
        this.scrollY = 0;
        this.maxScroll = 0;

        // Sidebar Scroll
        this.sidebarScrollY = 0;
        this.sidebarMaxScroll = 0;
    }

    onScroll(deltaY) {
        // Check mouse position for split scroll
        const mx = this.game.mouse.x;
        // Sidebar width is 150 + 4 (padding/bezel offset in drawContent is +4) 
        // Window x is this.x. Sidebar ends at this.x + 154 theoretically
        const sidebarEnd = this.x + 154;

        const speed = 50;

        if (mx < sidebarEnd) {
            // Sidebar Scroll
            if (deltaY > 0) this.sidebarScrollY += speed;
            else this.sidebarScrollY -= speed;

            // Clamp Sidebar
            if (this.sidebarScrollY < 0) this.sidebarScrollY = 0;
            if (this.sidebarScrollY > this.sidebarMaxScroll) this.sidebarScrollY = this.sidebarMaxScroll;
        } else {
            // Main Content Scroll
            if (deltaY > 0) this.scrollY += speed;
            else this.scrollY -= speed;

            // Clamp Content
            if (this.scrollY < 0) this.scrollY = 0;
            if (this.scrollY > this.maxScroll) this.scrollY = this.maxScroll;
        }
    }

    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    getSidebarLayout(ctx, x, y) {
        ctx.font = '12px Arial';
        const sidebarW = 150;
        const layout = [];
        let curY = y + 10;
        const paddingLeft = 10; // Consistent alignment

        // Root
        layout.push({
            type: 'root',
            key: null,
            label: "My Computer",
            lineHeight: 16,
            lines: ["My Computer"],
            x: x,
            y: curY,
            w: sidebarW,
            h: 20
        });
        curY += 20;



        // COLLECTION (MEMES)
        layout.push({
            type: 'folder',
            key: 'COLLECTION',
            label: "Collection",
            lineHeight: 16,
            lines: ["Collection"],
            x: x,
            y: curY,
            w: sidebarW,
            h: 20
        });

        // Debug: Show count
        const count = COLLECTION_DB.items.length;
        layout[1].label = `Collection (${count})`;
        layout[1].lines = [`Collection (${count})`];

        curY += 20;

        // Folders
        const visibleKeys = Object.keys(LORE_DB).filter(key => this.game.loreSystem.isFolderVisible(key));

        visibleKeys.forEach(key => {
            const folder = LORE_DB[key];
            let name = folder.name;
            if (folder.locked && !this.game.loreSystem.isFolderUnlocked(key)) {
                name = "🔒 " + name;
            }

            const lines = this.wrapText(ctx, name, sidebarW - 20);
            const itemHeight = Math.max(20, lines.length * 16 + 4);

            layout.push({
                type: 'folder',
                key: key,
                label: name,
                lines: lines,
                lineHeight: 16,
                x: x,
                y: curY,
                w: sidebarW,
                h: itemHeight
            });

            curY += itemHeight;
        });

        return layout;
    }

    drawContent(ctx, x, y, w, h) {
        // Background
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, w, h);

        // Sidebar (Tree View stub)
        const sidebarW = 150;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x, y, sidebarW, h);
        ctx.fillStyle = '#808080';
        ctx.fillRect(x + sidebarW, y, 1, h);

        // Sidebar Content
        // Reset text alignment to ensure left-align
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top'; // Easier for multiline

        // Save & Clip Sidebar Area
        ctx.save();
        ctx.beginPath();
        // Clip area: x, y+20 (header approx), sidebarW, h-20 (bottom)
        // Adjust depending on where startY is.
        // StartY is y + 24 in Window.js for content.
        // But drawContent receives x, y, w, h which are inner content bounds.
        // x is this.x + 4, y is this.y + 24
        ctx.rect(x, y, sidebarW, h);
        ctx.clip();

        const layout = this.getSidebarLayout(ctx, x, y - this.sidebarScrollY);

        layout.forEach(item => {
            const isSelected = item.key !== null && item.key === this.selectedFolderKey;

            // Selection Background
            if (isSelected) {
                ctx.fillStyle = '#000080';
                ctx.fillRect(item.x + 2, item.y, sidebarW - 4, item.h);
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = '#000';
            }

            // Text
            let ty = item.y + 2;
            item.lines.forEach(line => {
                ctx.fillText(line, item.x + 10, ty);
                ty += item.lineHeight;
            });
        });

        // Calculate Sidebar Max Scroll
        // Last item bottom
        if (layout.length > 0) {
            const lastItem = layout[layout.length - 1];
            const contentBottom = lastItem.y + lastItem.h + this.sidebarScrollY; // Real bottom relative to y
            // View height is h
            // We want contentBottom - h
            // relative to y: (lastItem.y + this.sidebarScrollY) is approx (y + totalH)
            // Wait, lastItem.y ALREADY includes -this.sidebarScrollY
            // So lastItem.y + lastItem.h is the screen coordinate of the bottom.
            // We need abstract height.
            // let's re-calculate total height from layout logic or just infer it
            // Infer: (lastItem.y + this.sidebarScrollY) - y + lastItem.h = totalHeight
            const totalH = (lastItem.y + this.sidebarScrollY) - y + lastItem.h;
            this.sidebarMaxScroll = Math.max(0, totalH - h + 20);
        }

        ctx.restore(); // End Sidebar Clip

        // Restore baseline for other draws if needed (though standard is usually alphabetic)
        ctx.textBaseline = 'alphabetic';

        // Main Content Area
        const contentX = x + sidebarW + 10;
        const contentY = y + 10;
        const contentW = w - sidebarW - 20;

        // Breadcrumbs / Address Bar
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#808080';
        ctx.strokeRect(contentX, contentY - 5, contentW, 20);
        ctx.fillStyle = '#000';
        let pathStr = "C:\\Archive";
        if (this.currentPath.length > 0) {
            pathStr += "\\" + LORE_DB[this.currentPath[0]].name;
        }
        ctx.fillText(pathStr, contentX + 5, contentY + 10);

        // File/Folder Grid
        let gx = contentX;
        let gy = contentY + 30;
        const cellW = 80;
        const cellH = 110; // Increased height for wrapped text

        // Clip Content Area
        ctx.save();
        ctx.beginPath();
        // Offset Y by 20 to start clip below address bar (which is at -5 to +15 relative to contentY)
        // Reduce height by 20 to maintain bottom margin
        ctx.rect(contentX, contentY + 20, contentW, h - 50);
        ctx.clip();

        // Apply Scroll
        gy -= this.scrollY;

        // If at root, show folders as icons
        const visibleKeys = Object.keys(LORE_DB).filter(key => this.game.loreSystem.isFolderVisible(key));
        if (this.currentPath.length === 0 && this.selectedFolderKey !== 'COLLECTION') {
            // Draw COLLECTION folder first
            this.drawIcon(ctx, gx, gy, "Collection", 'folder', false, false);
            gx += cellW;
            if (gx > x + w - cellW) {
                gx = contentX;
                gy += cellH;
            }

            visibleKeys.forEach(key => {
                const folder = LORE_DB[key];
                // Check if folder has new files
                // Badge logic: Show if has new files AND (Unlocked OR (Locked AND Not Acknowledged))
                const hasNewFiles = folder.files.some(f => this.game.loreSystem.newFileIds.includes(f.id));
                const isLocked = folder.locked && !this.game.loreSystem.isFolderUnlocked(key);
                const isAcknowledged = this.game.loreSystem.acknowledgedLockedFolders.includes(key);

                const hasNewInFolder = hasNewFiles && (!isLocked || !isAcknowledged);

                this.drawIcon(ctx, gx, gy, folder.name, 'folder', key === this.selectedFolderKey, isLocked, hasNewInFolder);
                gx += cellW;
                if (gx > x + w - cellW) {
                    gx = contentX;
                    gy += cellH;
                }
            });

        } else if (this.selectedFolderKey === 'COLLECTION') {
            // COLLECTION VIEW
            const allItems = COLLECTION_DB.items;
            const itemsPerRow = 5;

            allItems.forEach((item, index) => {
                const col = index % itemsPerRow;
                const row = Math.floor(index / itemsPerRow);

                // Calculate position based on grid logic
                const drawX = contentX + (col * cellW);
                const drawY = gy + (row * cellH); // gy includes scroll offset

                const isUnlocked = this.game.collectionSystem.isUnlocked(item.id);

                let label = isUnlocked ? item.name : "???";
                let icon = isUnlocked ? 'image' : 'unknown';

                this.drawIcon(ctx, drawX, drawY, label, icon, item.id === this.selectedFileId, false, false, item.rarity);

                // Update final GY for scroll calc
                if (index === allItems.length - 1) {
                    gy = (contentY + 30 - this.scrollY) + ((row + 1) * cellH);
                }
            });
        } else {
            // Inside a folder
            const folderKey = this.currentPath[0];
            const folder = LORE_DB[folderKey];

            // Draw Files
            folder.files.forEach(file => {
                const isCollected = this.game.loreSystem.isFileUnlocked(file.id);
                let label = isCollected ? file.name : "???????";
                let icon = isCollected ? 'file' : 'unknown';

                if (isCollected) {
                    const isNew = this.game.loreSystem.newFileIds.includes(file.id);
                    this.drawIcon(ctx, gx, gy, label, icon, file.id === this.selectedFileId, false, isNew);
                } else {
                    ctx.globalAlpha = 0.5;
                    this.drawIcon(ctx, gx, gy, label, icon, false);
                    ctx.globalAlpha = 1.0;
                }

                gx += cellW;
                if (gx > x + w - cellW) {
                    gx = contentX;
                    gy += cellH;
                }
            });

            // Back button

            this.drawIcon(ctx, gx, gy, "..", 'folder', false);
        }

        // Calculate max scroll based on gx/gy relative to start
        // Last item bottom Y relative to contentY
        const contentHeight = (gy - contentY) + cellH + this.scrollY;
        const viewHeight = h - 40; // Approx
        this.maxScroll = Math.max(0, contentHeight - viewHeight + 20);

        ctx.restore(); // Clip
    }

    drawIcon(ctx, x, y, label, type, selected, locked, hasNew = false, rarity = null) {
        // Icon drawing (same size as before)
        const iconW = 64;
        const iconH = 64; // Visual icon height approx

        // Calculate text wrapping first to determine selection box size
        ctx.font = '10px Arial';
        const maxWidth = 70;
        const words = label.split(/(?=[_])|(?<=[_])|\s+/);
        const lines = [];
        let currentLine = words[0] || "";

        const fit = (text) => ctx.measureText(text).width <= maxWidth;

        if (fit(label)) {
            lines.push(label);
        } else {
            const parts = label.split(/([_\-\s\.])/);
            let buf = "";
            parts.forEach(p => {
                if (fit(buf + p)) {
                    buf += p;
                } else {
                    if (buf) lines.push(buf);
                    buf = p;
                }
            });
            if (buf) lines.push(buf);
        }

        for (let i = 0; i < lines.length; i++) {
            if (!fit(lines[i])) {
                let sub = lines[i];
                lines.splice(i, 1);
                while (sub.length > 0) {
                    let c = sub.length;
                    while (c > 0 && !fit(sub.substring(0, c))) c--;
                    if (c === 0) c = 1;
                    lines.splice(i, 0, sub.substring(0, c));
                    sub = sub.substring(c);
                    i++;
                }
                i--;
            }
        }


        // Selection Box
        if (selected) {
            ctx.fillStyle = '#000080';
            ctx.globalAlpha = 0.3;
            const textH = lines.length * 12;
            ctx.fillRect(x, y, 64, 54 + textH + 4);
            ctx.globalAlpha = 1.0;
        }

        // Icon Art
        ctx.strokeStyle = '#000';
        ctx.fillStyle = type === 'folder' ? '#ebb434' : '#fff';

        if (type === 'folder') {
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 20);
            ctx.lineTo(x + 30, y + 20);
            ctx.lineTo(x + 35, y + 15);
            ctx.lineTo(x + 54, y + 15);
            ctx.lineTo(x + 54, y + 50);
            ctx.lineTo(x + 10, y + 50);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            if (locked) {
                ctx.fillStyle = '#000';
                ctx.fillText("🔒", x + 25, y + 40);
            }
        } else if (type === 'file') {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(x + 15, y + 10);
            ctx.lineTo(x + 40, y + 10);
            ctx.lineTo(x + 49, y + 19);
            ctx.lineTo(x + 49, y + 54);
            ctx.lineTo(x + 15, y + 54);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Lines
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 20, y + 20, 20, 2);
            ctx.fillRect(x + 20, y + 25, 20, 2);
            ctx.fillRect(x + 20, y + 30, 20, 2);
        } else if (type === 'image' || type === 'audio' || type === 'video') {
            // If rarity provided, color the bg/border
            if (rarity) {
                const rColor = COLLECTION_DB.rarities[rarity].color;
                ctx.strokeStyle = rColor;
                ctx.lineWidth = 2;
                ctx.fillStyle = '#eee'; // Light bg for image placeholder
                ctx.fillRect(x + 15, y + 10, 34, 44);
                ctx.strokeRect(x + 15, y + 10, 34, 44);
                ctx.lineWidth = 1;
            } else {
                ctx.fillStyle = '#ccc';
                ctx.fillRect(x + 15, y + 10, 34, 44);
                ctx.strokeRect(x + 15, y + 10, 34, 44);
            }

            ctx.fillStyle = '#000';
            let iconChar = type === 'image' ? '🖼️' : '🎵';
            if (type === 'video') iconChar = '🎥';
            ctx.fillText(iconChar, x + 32, y + 35);
        }
        else {
            // Unknown
            ctx.fillStyle = '#ccc';
            ctx.fillRect(x + 15, y + 10, 34, 44);
            ctx.strokeRect(x + 15, y + 10, 34, 44);
            ctx.fillStyle = '#000';
            ctx.fillText("?", x + 28, y + 35);
        }

        // Notification Badge (!)
        if (hasNew) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x + 45, y + 15, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("!", x + 45, y + 18);
        }

        // Label Rendering

        let ty = y + 66;
        ctx.textAlign = 'center';

        lines.forEach(line => {
            if (selected) {
                const tw = ctx.measureText(line).width;
                ctx.fillStyle = '#000080';
                ctx.fillRect((x + 32) - (tw / 2) - 1, ty - 9, tw + 2, 11);
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = '#000';
            }
            ctx.fillText(line, x + 32, ty);
            ty += 11;
        });
    }

    checkClick(mx, my) {
        const res = super.checkClick(mx, my);

        // 1. If close button clicked or drag started - return immediately
        if (res === 'close' || res === 'drag') return res;

        // 2. If click was outside window - return null
        if (res === null) return null;

        // 3. If res === 'consumed', click was inside window body.

        // Need Context for measuring text in sidebar click (since we re-run layout)
        const ctx = this.game.renderer.ctx;

        const sidebarW = 150;
        const contentX = this.x + sidebarW + 10;
        const contentY = this.y + 40; // Including address bar

        // --- SIDEBAR CHECK ---
        const contentStartX = this.x + 4;
        const contentStartY = this.y + 24;

        if (mx > contentStartX && mx < contentStartX + sidebarW && my > contentStartY && my < this.y + this.h) {
            // Apply Scroll to click detection
            // We pass y - scrollY effectively into getSidebarLayout to match draw logic
            // But getSidebarLayout changes Y. 
            // We need to match the item.y which will be drawn at (Y_layout - scrollY).
            // Actually getSidebarLayout is pure.
            // In draw: getSidebarLayout(..., y - scroll) -> items have y shifted.

            const layout = this.getSidebarLayout(ctx, contentStartX, contentStartY - this.sidebarScrollY);

            for (let item of layout) {
                // Clipping check: is item visible? 
                // Simple version: if click Y is valid within sidebar view
                // We already checked my > contentStartY && my < this.y + this.h above.

                if (my >= item.y && my < item.y + item.h) {
                    if (item.type === 'root') {
                        this.currentPath = [];
                        this.selectedFolderKey = null;
                        this.scrollY = 0; // Reset scroll
                        this.game.events.emit('play_sound', 'archive');
                        return 'consumed';
                    } else if (item.key === 'COLLECTION') {
                        this.currentPath = [];
                        this.selectedFolderKey = 'COLLECTION';
                        this.scrollY = 0; // Reset scroll
                        this.game.events.emit('play_sound', 'archive');
                        return 'consumed';
                    } else if (item.type === 'folder') {
                        const opened = this.selectFolder(item.key);
                        return opened ? 'no_focus' : 'consumed';
                    }
                }
            }
        }

        // --- FILE GRID CHECK ---

        if (mx > contentX && my > contentY) {
            // Calculate grid click with SCROLL
            const relX = mx - contentX;
            const fileGridY = my - contentY + this.scrollY;
            const cellW = 80;
            const cellH = 110;

            const col = Math.floor(relX / cellW);
            const row = Math.floor(fileGridY / cellH);
            // Content width
            const contentW = this.w - sidebarW - 20;
            const cols = Math.floor(contentW / cellW);

            const targetIdx = row * cols + col;

            // If inside a folder
            if (this.currentPath.length > 0) {
                const folderKey = this.currentPath[0];
                const folder = LORE_DB[folderKey];

                if (targetIdx >= 0 && targetIdx < folder.files.length) {
                    const file = folder.files[targetIdx];
                    const opened = this.handleFileClick(file);
                    return opened ? 'no_focus' : 'consumed';
                } else if (targetIdx === folder.files.length) {
                    // ".." button
                    this.currentPath = []; // Go to root
                    this.selectedFolderKey = null; // Also clear selection to be safe
                    this.selectedFileId = null;
                    this.scrollY = 0; // Reset scroll
                    this.game.events.emit('play_sound', 'archive');
                    return 'consumed';
                }



            } else if (this.selectedFolderKey === 'COLLECTION') {
                const allItems = COLLECTION_DB.items;
                if (targetIdx >= 0 && targetIdx < allItems.length) {
                    const item = allItems[targetIdx];
                    if (this.game.collectionSystem.isUnlocked(item.id)) {
                        // Open item
                        this.game.uiManager.showMedia({
                            mediaType: item.type,
                            src: item.src,
                            name: item.name
                        });
                        return 'no_focus';
                    } else {
                        this.game.events.emit('play_sound', 'error');
                        return 'consumed';
                    }
                }

            } else {
                // We are in Root (Root + Media)

                // Check COLLECTION (Index 0)
                if (targetIdx === 0) {
                    this.currentPath = [];
                    this.selectedFolderKey = 'COLLECTION';
                    this.scrollY = 0; // Reset scroll
                    this.game.events.emit('play_sound', 'archive');
                    return 'consumed';
                }

                // Check other folders (Index 1+)
                const visibleKeys = Object.keys(LORE_DB).filter(k => this.game.loreSystem.isFolderVisible(k));
                const folderIdx = targetIdx - 1;

                if (folderIdx >= 0 && folderIdx < visibleKeys.length) {
                    const key = visibleKeys[folderIdx];
                    const opened = this.selectFolder(key);
                    return opened ? 'no_focus' : 'consumed';
                }
            }
        }

        // If clicked inside window but not on folder/file - consume click anyway
        return 'consumed';
    }

    selectFolder(key) {
        if (this.currentPath[0] === key) return;

        const folder = LORE_DB[key];

        if (folder.locked && !this.game.loreSystem.isFolderUnlocked(key)) {
            // Acknowledge the lock (supress badge)
            this.game.loreSystem.acknowledgeLockedFolder(key);

            this.game.tutorialSystem.triggerContextual('locked_folder_hint');

            const existingWindow = this.game.uiManager.windowManager.windows.find(w =>
                w instanceof PasswordWindow && w.folderName === folder.name
            );

            if (existingWindow) {
                this.game.uiManager.windowManager.focus(existingWindow);
                return true;
            }

            // Instantiate custom PasswordWindow
            const passwordWindow = new PasswordWindow(this.game, folder.name, folder.hint || 'No hint', folder.password, () => {
                this.game.loreSystem.unlockFolder(key);
                this.game.uiManager.chat.addMessage('SYSTEM', 'ACCESS GRANTED.');
                this.game.events.emit('play_sound', 'startup');
                // Refresh to show unlocked state (update current path/selection if needed)
                // Actually, selectFolder sets currentPath. We need to call selectFolder again or manually set it?
                // If we are here, we returned early. So we need to call selectFolder(key) again OR do the logic here.
                // Simpler: Just recursively call selectFolder(key) which will now pass the check!
                this.selectFolder(key);
            });
            this.game.uiManager.windowManager.add(passwordWindow);
            return true; // Stop processing, wait for unlock callback
        }

        this.currentPath = [key];
        this.selectedFolderKey = key;
        this.selectedFileId = null;
        this.scrollY = 0; // Reset scroll
        this.game.events.emit('play_sound', 'archive');
        return false;
    }

    handleFileClick(file) {
        if (this.game.loreSystem.isFileUnlocked(file.id)) {
            this.game.events.emit('play_sound', 'archive');
            // Check for Audio/Image types
            if (file.type === 'audio' || file.type === 'image') {
                this.game.loreSystem.markFileAsViewed(file.id); // Mark as viewed
                this.game.uiManager.showMedia({
                    mediaType: file.type,
                    src: file.src || file.content, // Fallback if src not set but content is path
                    name: file.name,
                    silentOpen: true
                });
                return true;
            }

            // Check if Notepad for this file is already open
            // We use Title matching since NotepadWindow doesn't store file ID explicitly usually, 
            // but we pass title: file.name
            const existingWindow = this.game.uiManager.windowManager.windows.find(w =>
                w.constructor.name === 'NotepadWindow' && w.title === file.name
            );

            if (existingWindow) {
                this.selectedFileId = file.id;
                this.game.uiManager.windowManager.focus(existingWindow);
                return true;
            }

            this.selectedFileId = file.id;
            this.game.loreSystem.markFileAsViewed(file.id); // Mark as viewed
            this.game.uiManager.openNotepad(file.content, { title: file.name, password: null, silentOpen: true });
            return true;
        } else {
            this.game.events.emit('play_sound', 'error');
            this.game.uiManager.chat.addMessage('SYSTEM', 'FILE NOT DOWNLOADED OR CORRUPTED.');
            return false;
        }
    }
}