import { Window } from './Window.js';
import { LORE_DB } from '../data/loreData.js';
import { UTILS } from '../core/config.js';

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

        // View State
        this.iconSize = 64;
    }

    get currentFolder() {
        if (this.currentPath.length === 0) return LORE_DB;
        // Traverse
        let folder = LORE_DB;
        for (const key of this.currentPath) {
            // In our structure, LORE_DB keys are folders.
            // But LORE_DB is flat list of folders at root?
            // "personal": { ... }, "system": { ... }
            // Yes, shallow depth for now based on loreData.js structure.
            folder = folder[key];
        }
        return folder;
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

        // Draw Sidebar Items (Root folders)
        let sy = y + 10;
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText("My Computer", x + 10, sy);
        sy += 20;

        Object.keys(LORE_DB).forEach(key => {
            const folder = LORE_DB[key];
            const isSelected = key === this.selectedFolderKey;

            if (isSelected) {
                ctx.fillStyle = '#000080';
                ctx.fillRect(x + 5, sy - 12, sidebarW - 10, 16);
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = '#000';
            }

            // Check if locked
            let name = folder.name;
            if (folder.locked && !this.game.state.isFolderUnlocked(key)) {
                name = "🔒 " + name;
            }

            ctx.fillText(name, x + 20, sy);
            sy += 20;
        });

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

        // If at root, show folders as icons
        if (this.currentPath.length === 0) {
            Object.keys(LORE_DB).forEach(key => {
                const folder = LORE_DB[key];
                this.drawIcon(ctx, gx, gy, folder.name, 'folder', key === this.selectedFolderKey, folder.locked && !this.game.state.isFolderUnlocked(key));
                gx += 80;
                if (gx > x + w - 80) {
                    gx = contentX;
                    gy += 80;
                }
            });
        } else {
            // Inside a folder
            const folderKey = this.currentPath[0];
            const folder = LORE_DB[folderKey];

            // If locked and not unlocked, show lock wall? (Should catch before entering)
            // Assuming checks done on enter.

            // Draw Files
            folder.files.forEach(file => {
                // Check if file is unlocked/collected
                const isCollected = this.game.state.isFileUnlocked(file.id);
                // We show all files but maybe grayed out/unknown if not collected?
                // Or only show collected? 
                // "The user wants to collect lore files". Usually implies empty slots or hidden.
                // Let's show "Unknown" for uncollected.

                let label = isCollected ? file.name : "Unknown_File";
                let icon = isCollected ? 'file' : 'unknown';

                if (isCollected) {
                    this.drawIcon(ctx, gx, gy, label, icon, file.id === this.selectedFileId);
                } else {
                    // Render ghost/placeholder
                    ctx.globalAlpha = 0.5;
                    this.drawIcon(ctx, gx, gy, label, icon, false);
                    ctx.globalAlpha = 1.0;
                }

                gx += 80;
                if (gx > x + w - 80) {
                    gx = contentX;
                    gy += 80;
                }
            });

            // Back button logic implicit or need explicit 'Up' icon?
            // Windows usually has Up button.
            // Can double click background to go up? No.
            // Let's add ".." folder.
            this.drawIcon(ctx, contentX, contentY + 30, "..", 'folder', false);
            // Shift grid
            // Actually, let's keep it simple: Toolbar button or just handle it in click.
        }
    }

    drawIcon(ctx, x, y, label, type, selected, locked) {
        if (selected) {
            ctx.fillStyle = '#000080'; // Selection Blue
            ctx.globalAlpha = 0.3;
            ctx.fillRect(x, y, 64, 64);
            ctx.globalAlpha = 1.0;
        }

        // Icon Art
        ctx.strokeStyle = '#000';
        ctx.fillStyle = type === 'folder' ? '#ebb434' : '#fff'; // Folder yellow or File white

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
                // Lock overlay
                ctx.fillStyle = '#000';
                ctx.fillText("🔒", x + 25, y + 40);
            }
        } else if (type === 'file') {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(x + 15, y + 10);
            ctx.lineTo(x + 40, y + 10); // Fold corner logic omitted for simplicity
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
        } else {
            // Unknown
            ctx.fillStyle = '#ccc';
            ctx.fillRect(x + 15, y + 10, 34, 44);
            ctx.strokeRect(x + 15, y + 10, 34, 44);
            ctx.fillStyle = '#000';
            ctx.fillText("?", x + 28, y + 35);
        }

        // Label
        ctx.fillStyle = selected ? '#000080' : '#000';
        if (selected) {
            ctx.fillRect(x, y + 56, 64, 14);
            ctx.fillStyle = '#fff';
        }

        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        // Truncate
        let dLabel = label;
        if (dLabel.length > 10) dLabel = dLabel.substring(0, 8) + '...';

        ctx.fillText(dLabel, x + 32, y + 66);
    }

    checkClick(mx, my) {
        const res = super.checkClick(mx, my);
        if (res) return res;

        // Content Area Click
        const sidebarW = 150;
        const contentX = this.x + sidebarW + 10;
        const contentY = this.y + 40; // Including address bar

        // Calc Grid
        let gx = contentX;
        let gy = contentY;

        // UP Navigation
        // Hardcoded hit area for ".." which we sort of implicitly drew or didn't.
        // I didn't actually draw ".." in the loop correctly if I want it to be interactable.
        // Let's assume Backspace key or creating a dedicated button later. 
        // For now, if currentPath > 0, we can click the "Up" button or breadcrumb?
        // Let's implement double click on background to go up? No, confusing.
        // Let's implement clicking Sidebar items to navigate.

        // Sidebar Clicks
        if (mx > this.x && mx < this.x + sidebarW && my > this.y + 10 && my < this.y + this.h) {
            let sy = this.y + 30; // Start after "My Computer"
            const diff = my - sy + 10; // offset
            const index = Math.floor(diff / 20);
            const keys = Object.keys(LORE_DB);
            if (index >= 0 && index < keys.length) {
                const key = keys[index];
                this.selectFolder(key);
                return 'consumed';
            }
        }

        // Grid Clicks (Files)
        if (mx > contentX && my > contentY) {
            if (this.currentPath.length > 0) {
                const folderKey = this.currentPath[0];
                const folder = LORE_DB[folderKey];

                let idx = 0;
                // Loop same as draw to find hit
                // Simplified grid hit test
                const relX = mx - contentX;
                const relY = my - contentY;

                const col = Math.floor(relX / 80);
                const row = Math.floor(relY / 80);
                // Width is dynamic in draw loop... 
                const cols = Math.floor((this.w - sidebarW - 20) / 80);

                const targetIdx = row * cols + col;

                if (targetIdx >= 0 && targetIdx < folder.files.length) {
                    const file = folder.files[targetIdx];
                    this.handleFileClick(file);
                    return 'consumed';
                }
            } else {
                // Root grid (Folders)
                const relX = mx - contentX;
                const relY = my - contentY;
                const cols = Math.floor((this.w - sidebarW - 20) / 80);
                const col = Math.floor(relX / 80);
                const row = Math.floor(relY / 80);
                const targetIdx = row * cols + col;
                const keys = Object.keys(LORE_DB);
                if (targetIdx >= 0 && targetIdx < keys.length) {
                    const key = keys[targetIdx];
                    this.selectFolder(key);
                    return 'consumed';
                }
            }
        }

        return null;
    }

    selectFolder(key) {
        if (this.currentPath[0] === key) return; // Already there

        const folder = LORE_DB[key];
        // Check Lock
        if (folder.locked && !this.game.state.isFolderUnlocked(key)) {
            // Prompt Password
            const password = prompt("ENTER PASSWORD FOR " + folder.name);
            if (password === folder.password) {
                this.game.state.unlockFolder(key);
                this.game.uiManager.chat.addMessage('SYSTEM', 'ACCESS GRANTED.');
                this.game.events.emit('play_sound', 'startup');
            } else {
                this.game.uiManager.chat.addMessage('SYSTEM', 'ACCESS DENIED.');
                this.game.events.emit('play_sound', 'error');
                return;
            }
        }

        this.currentPath = [key];
        this.selectedFolderKey = key;
        this.selectedFileId = null;
    }

    handleFileClick(file) {
        if (this.game.state.isFileUnlocked(file.id)) {
            this.selectedFileId = file.id;
            // Open it
            this.game.uiManager.openNotepad(file.content, { title: file.name, password: null }); // Unlocked files don't need pass re-entry?
        } else {
            this.game.events.emit('play_sound', 'error');
            this.game.uiManager.chat.addMessage('SYSTEM', 'FILE ENCRYPTED OR MISSING.');
        }
    }
}
