document.addEventListener('DOMContentLoaded', () => {
    
    // --- Drag and Drop Logic ---
    const draggables = document.querySelectorAll('.draggable');
    let highestZIndex = 10;

    draggables.forEach(element => {
            // Assign initial z-index based on DOM order so later items are on top
            element.style.zIndex = highestZIndex++;

            let isDragging = false;
            let startX, startY, initialX, initialY;

            // Handle Mouse Events
            element.addEventListener('mousedown', dragStart);
            
            // Handle Touch Events (for tablets)
            element.addEventListener('touchstart', dragStart, { passive: false });

            function dragStart(e) {
                if (e.type === 'touchstart') {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                } else {
                    startX = e.clientX;
                    startY = e.clientY;
                }

                // Get current computed transform values or top/left
                const rect = element.getBoundingClientRect();
                // To avoid complicated transform parsing, we'll convert everything to absolute left/top
                
                // If it's the first time dragging, switch from percentage based top/left to pixel based
                if (!element.dataset.dragged) {
                    element.style.left = rect.left + 'px';
                    element.style.top = rect.top + 'px';
                    element.style.bottom = 'auto';
                    element.style.right = 'auto';
                    // keep rotation but remove any translation
                    const computedStyle = window.getComputedStyle(element);
                    const transform = computedStyle.getPropertyValue('transform');
                    // We only want to keep rotation, so we strip translate if any.
                    // For simplicity in this demo, we assume initial transforms are mostly rotates.
                    
                    element.dataset.dragged = "true";
                }

                initialX = parseFloat(element.style.left) || 0;
                initialY = parseFloat(element.style.top) || 0;

                isDragging = true;
                
                // Bring to front
                element.style.zIndex = highestZIndex++;

                if (e.type === 'touchstart') {
                    document.addEventListener('touchmove', drag, { passive: false });
                    document.addEventListener('touchend', dragEnd);
                } else {
                    document.addEventListener('mousemove', drag);
                    document.addEventListener('mouseup', dragEnd);
                }
            }

            function drag(e) {
                if (!isDragging) return;
                e.preventDefault(); // Prevent default touch actions like scrolling

                let currentX, currentY;

                if (e.type === 'touchmove') {
                    currentX = e.touches[0].clientX;
                    currentY = e.touches[0].clientY;
                } else {
                    currentX = e.clientX;
                    currentY = e.clientY;
                }

                const dx = currentX - startX;
                const dy = currentY - startY;

                element.style.left = (initialX + dx) + 'px';
                element.style.top = (initialY + dy) + 'px';
            }

            function dragEnd(e) {
                isDragging = false;
                if (e.type === 'touchend') {
                    document.removeEventListener('touchmove', drag);
                    document.removeEventListener('touchend', dragEnd);
                } else {
                    document.removeEventListener('mousemove', drag);
                    document.removeEventListener('mouseup', dragEnd);
                }
            }
        });

    // Optional: Add a small random rotation on load to make it look even more natural
    draggables.forEach(el => {
        // Only apply if it doesn't already have an inline transform rotation
        if (!el.style.transform) {
            const randomRotation = Math.floor(Math.random() * 10) - 5; // -5 to +5 degrees
            el.style.transform = `rotate(${randomRotation}deg)`;
        }
    });

});
