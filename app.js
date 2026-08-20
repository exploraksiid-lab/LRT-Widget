document.addEventListener('DOMContentLoaded', () => {
    // State
    let scheduleData = null;
    let currentStation = localStorage.getItem('lrt_station') || 'Cawang';
    let currentDirection = 'inbound'; // 'inbound' (Ke Dukuh Atas) or 'outbound' (Dari Dukuh Atas)
    let allStations = [];
    
    // Check URL parameters for widget view
    const urlParams = new URLSearchParams(window.location.search);
    const isWidgetView = urlParams.get('view') === 'widget';
    if (isWidgetView) {
        document.body.classList.add('widget-view');
        const stationParam = urlParams.get('station');
        if (stationParam) {
            currentStation = stationParam;
        }
        const directionParam = urlParams.get('direction');
        if (directionParam) {
            currentDirection = directionParam;
        }
    }
    
    // DOM Elements
    const stationNameEl = document.getElementById('current-station-name');
    const heroDestinationEl = document.getElementById('hero-destination');
    const heroLineEl = document.getElementById('hero-line');
    const heroTimeEl = document.getElementById('hero-time');
    const heroClockEl = document.getElementById('hero-clock');
    const heroProgressEl = document.getElementById('hero-progress');
    const trainListEl = document.getElementById('upcoming-trains-list');
    const lastUpdatedEl = document.getElementById('last-updated');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // Station Modal Elements
    const stationTrigger = document.getElementById('station-selector-trigger');
    const stationModal = document.getElementById('station-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const stationSearch = document.getElementById('station-search');
    const stationListEl = document.getElementById('station-list');
    
    // Direction Tabs
    const directionTabs = document.querySelectorAll('#direction-tabs button');
    
    // Initialize Theme
    const isDarkMode = localStorage.getItem('lrt_theme') === 'dark' || 
                       (!('lrt_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDarkMode) document.documentElement.classList.add('dark');
    
    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('lrt_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    // Fetch Data
    function loadData() {
        try {
            scheduleData = LRT_SCHEDULE;
            
            // Extract unique stations
            const stationsSet = new Set();
            scheduleData.lines.forEach(line => {
                line.directions.forEach(dir => {
                    dir.stations.forEach(st => stationsSet.add(st));
                });
            });
            allStations = Array.from(stationsSet).sort();
            
            // Validate current station
            if (!allStations.includes(currentStation)) {
                currentStation = allStations.includes('Cawang') ? 'Cawang' : allStations[0];
            }
            
            updateUI();
            
            // Setup auto-refresh every minute
            setInterval(updateUI, 60000);
            
        } catch (error) {
            console.error('Error loading schedule data:', error);
            trainListEl.innerHTML = '<div class="p-4 text-error text-center">Gagal memuat jadwal.</div>';
        }
    }
    
    function parseTimeToDate(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const now = new Date();
        const trainTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
        return trainTime;
    }
    
    function getNextTrains() {
        if (!scheduleData) return [];
        
        const now = new Date();
        const upcoming = [];
        
        scheduleData.lines.forEach(line => {
            line.directions.forEach(dir => {
                // Determine if this direction matches our filter
                const isToDukuhAtas = dir.destination.toLowerCase().includes('dukuh atas');
                const matchesDirection = (currentDirection === 'inbound' && isToDukuhAtas) || 
                                         (currentDirection === 'outbound' && !isToDukuhAtas);
                
                if (!matchesDirection) return;
                
                // Only if station exists in this direction
                if (!dir.stations.includes(currentStation)) return;
                
                dir.trips.forEach(trip => {
                    const departureTimeStr = trip[currentStation];
                    if (!departureTimeStr) return; // Train might not stop here or end of line
                    
                    const departureDate = parseTimeToDate(departureTimeStr);
                    const diffMs = departureDate - now;
                    const diffMins = Math.floor(diffMs / 60000);
                    
                    // Allow up to 1 minute in the past to still show as "Tiba"
                    if (diffMins >= -1 && diffMins < 120) { // Limit to next 2 hours
                        upcoming.push({
                            lineName: line.line_name,
                            destination: dir.destination,
                            departureTimeStr,
                            departureDate,
                            diffMins: diffMins < 0 ? 0 : diffMins,
                            isCritical: diffMins <= 2 && diffMins >= 0
                        });
                    }
                });
            });
        });
        
        // Sort by departure time
        upcoming.sort((a, b) => a.departureDate - b.departureDate);
        return upcoming;
    }
    
    function updateUI() {
        if (!scheduleData) return;
        
        stationNameEl.textContent = currentStation;
        
        const trains = getNextTrains();
        
        renderHero(trains[0]);
        renderTrainList(trains.slice(1, 4)); // Show next 3 trains in list
        
        const now = new Date();
        lastUpdatedEl.textContent = `Terakhir diperbarui: ${now.toLocaleTimeString('id-ID')}`;
    }
    
    function renderHero(train) {
        if (!train) {
            heroDestinationEl.textContent = "Tidak ada jadwal";
            heroLineEl.textContent = "---";
            heroTimeEl.textContent = "--";
            heroClockEl.textContent = "--:--";
            heroProgressEl.style.width = "0%";
            return;
        }
        
        heroDestinationEl.textContent = train.destination;
        heroLineEl.textContent = train.lineName;
        heroTimeEl.textContent = train.diffMins;
        heroClockEl.textContent = `Berangkat pada ${train.departureTimeStr}`;
        
        // Visual indicator logic
        if (train.isCritical) {
            heroTimeEl.classList.add('text-error');
            heroTimeEl.classList.remove('text-primary', 'dark:text-inverse-primary');
            heroProgressEl.classList.add('bg-error', 'pulse-alert');
            heroProgressEl.classList.remove('bg-primary', 'dark:bg-inverse-primary');
            heroProgressEl.style.width = "100%";
        } else {
            heroTimeEl.classList.remove('text-error');
            heroTimeEl.classList.add('text-primary', 'dark:text-inverse-primary');
            heroProgressEl.classList.remove('bg-error', 'pulse-alert');
            heroProgressEl.classList.add('bg-primary', 'dark:bg-inverse-primary');
            // Mock progress bar
            const progress = Math.max(10, 100 - (train.diffMins * 3));
            heroProgressEl.style.width = `${progress}%`;
        }
    }
    
    function renderTrainList(trains) {
        trainListEl.innerHTML = '';
        
        if (trains.length === 0) {
            trainListEl.innerHTML = '<div class="p-4 text-outline text-center glass-panel rounded-lg">Tidak ada jadwal kereta berikutnya</div>';
            return;
        }
        
        trains.forEach((train, index) => {
            const isAlert = train.isCritical;
            const iconBg = isAlert ? 'bg-error/20' : 'bg-surface-variant dark:bg-surface-dim';
            const iconColor = isAlert ? 'bg-error' : (index === 0 ? 'bg-primary dark:bg-inverse-primary' : 'bg-outline');
            const alertClass = isAlert ? 'pulse-alert' : '';
            const textColor = isAlert ? 'text-error' : (index === 0 ? 'text-primary dark:text-inverse-primary' : 'text-on-surface');
            
            const html = `
                <div class="glass-panel rounded-lg p-md flex items-center justify-between">
                    <div class="flex items-center gap-md">
                        <div class="relative">
                            <div class="w-10 h-10 ${iconBg} rounded-full flex items-center justify-center ${alertClass}">
                                <span class="w-3 h-3 ${iconColor} rounded-full"></span>
                            </div>
                        </div>
                        <div>
                            <h3 class="font-headline-md text-headline-md text-on-surface">${train.destination}</h3>
                            <p class="font-body-sm text-body-sm text-outline">${train.lineName} • ${train.departureTimeStr}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="font-headline-lg-mobile text-headline-lg-mobile ${textColor} font-bold block">${train.diffMins} Min</span>
                    </div>
                </div>
            `;
            trainListEl.insertAdjacentHTML('beforeend', html);
        });
    }

    // Modal & Selection Logic
    function populateStationList(filter = '') {
        stationListEl.innerHTML = '';
        const filtered = allStations.filter(st => st.toLowerCase().includes(filter.toLowerCase()));
        
        filtered.forEach(st => {
            const btn = document.createElement('button');
            btn.className = `w-full text-left p-3 rounded-lg border-b border-surface-variant dark:border-surface-dim hover:bg-surface-variant/50 transition-colors ${st === currentStation ? 'text-primary dark:text-inverse-primary font-bold bg-primary/5 dark:bg-inverse-primary/10' : 'text-on-surface'}`;
            btn.textContent = st;
            btn.onclick = () => {
                currentStation = st;
                localStorage.setItem('lrt_station', st);
                stationModal.classList.add('hidden');
                stationModal.classList.remove('flex');
                updateUI();
            };
            stationListEl.appendChild(btn);
        });
    }
    
    stationTrigger.addEventListener('click', () => {
        stationModal.classList.remove('hidden');
        stationModal.classList.add('flex');
        stationSearch.value = '';
        populateStationList();
        stationSearch.focus();
    });
    
    closeModalBtn.addEventListener('click', () => {
        stationModal.classList.add('hidden');
        stationModal.classList.remove('flex');
    });
    
    stationSearch.addEventListener('input', (e) => {
        populateStationList(e.target.value);
    });

    // Direction Tab Logic
    directionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active styling
            directionTabs.forEach(t => {
                t.classList.remove('bg-white', 'dark:bg-surface', 'shadow-sm', 'text-primary', 'dark:text-inverse-primary', 'active-tab');
                t.classList.add('text-on-surface-variant', 'dark:text-outline', 'hover:bg-white/50', 'dark:hover:bg-surface/50');
            });
            
            tab.classList.add('bg-white', 'dark:bg-surface', 'shadow-sm', 'text-primary', 'dark:text-inverse-primary', 'active-tab');
            tab.classList.remove('text-on-surface-variant', 'dark:text-outline', 'hover:bg-white/50', 'dark:hover:bg-surface/50');
            
            currentDirection = tab.getAttribute('data-dir');
            updateUI();
        });
    });
    
    // Refresh Button
    refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('span');
        icon.classList.add('animate-spin');
        updateUI();
        setTimeout(() => icon.classList.remove('animate-spin'), 500);
    });

    // Start App
    loadData();
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});
